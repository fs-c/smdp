const { EOF } = require('os');

const getBlocks = exports.getBlocks = (md) => {
    const blocks = md.split('\n');
    const processed = [];

    for (const block of blocks) {
        if (!block) {
            continue;
        }

        const trimmed = block.trim();

        if (!trimmed.length) {
            continue;
        }

        processed.push(trimmed);
    }

    return processed;
};

const parseParagraph = exports.parseParagraph = (block, { inline = false, index = 1 } = {}) => {
    let html = inline ? '' : '<p>';

    let inCode = false;

    let inLink = 0;
    const currentLink = {
        content: '',
        href: '',
    };

    const emphasis = {
        _current: 0,
        last: 0,
        get current() { return this._current; },
        set current(val) {
            this.last = this.current;
            this._current = val;
        },
    };

    let i = index;
    for (; i <= block.length; i++) {
        const cur = block[i - 1];
        const next = block[i];

        // Handle inline code
        if (cur === '`' && !inLink) {
            if (inCode) {
                inCode = false;

                html += '</code>';
            } else {
                inCode = true;

                html += '<code>';
            }
        } else if (inCode) {
            html += cur;
        // Handle inline html
        } else if (cur === '<') {
            // Considering how rare it usually is, inline html is disproportionally 
            // annoying to implement using the performance-oriented approach employed
            // for other stuff, so the following is inefficient but less annoying

            let j = i;
            let open = 1;
            let processed = '';
            for (; j < block.length && open; j++) {
                if (block[j - 1] === '<') {
                    // The way we're determining if we're in an opening or closing tag 
                    // is what makes this so inefficient, if it ever becomes a problem 
                    // this should be refactored
                    const subBlock = block.slice(j)
                    const slashIndex = subBlock.indexOf('/');
                    const opening = slashIndex === -1 ? Infinity : slashIndex
                        > subBlock.indexOf('>');

                    if (opening) {
                        open += 1;
                    } else {
                        open -= 1;
                    }
                }

                processed += block[j - 1];
            }

            html += processed;
            i = j - 1;
        // Handle link begin
        } else if (cur === '[') {
            if (inLink === 0) {
                inLink = 1;
            }
        // Handle link content
        } else if (inLink === 1) {
            if (cur === ']' && next === '(') {
                inLink = 2;
            } else {
                currentLink.content += cur;
            }
        // Handle link href
        } else if (inLink === 2) {
            if (cur === '(') {
                continue;
            } else if (cur === ')') {
                inLink = 0;

                const inline = parseParagraph(currentLink.content, {
                    inline: true,
                });

                html += `<a href="${currentLink.href}">${inline.html}</a>`;

                currentLink.content = '';
                currentLink.href = '';
            } else {
                currentLink.href += cur;
            }
        // Handle emphasis
        } else if (cur === '*' || cur === '_') {
            // Strong
            if (next === '*' || next === '_') {
                if (emphasis.current === 2) {
                    html += '</strong>';
                    emphasis.current = 0;
                } else {
                    html += '<strong>';
                    emphasis.current = 2;
                }
            // Weak
            } else {
                if (emphasis.current === 1) {
                    html += '</em>';
                    emphasis.current = 0;
                } else if (emphasis.current !== 2 && emphasis.last !== 2) {
                    html += '<em>';
                    emphasis.current = 1;
                }
            }
        } else {
            html += cur;
        }
    }

    html += inline ? '' : '</p>';

    return { html, i };
};

const parseImage = exports.parseImage = (block) => {
    let label = '';
    let inLabel = true;

    let source = '';

    const lastClosing = block.lastIndexOf(']');

    for (let i = 2; i < block.length; i++) {
        const cur = block[i];

        if (inLabel && i === lastClosing) {
            inLabel = false;
        } else if (inLabel) {
            label += cur;
        } else {
            source += cur;
        }
    }

    label = parseParagraph(label, { inline: true }).html;

    return `<figure role="img"><img src="${source.slice(1, -1)}" alt="${label}">`
        + `<figcaption>${label}</figcaption></figure>`
};

const parseCodeBlock = exports.parseCodeBlock = (block) => {
    return '<pre><code>' + block.slice(4, -4) + '</code></pre>';
};

const parseSemanticBreak = exports.parseSemanticBreak = (block) => {
    return '<hr>';
};

const parseBlockQuote = exports.parseBlockQuote = (blocks) => {
    const parsed = blocks.map((b) => parseParagraph(b.slice(1)).html);

    return '<blockquote>' + parsed.join('') + '</blockquote>';
};

const isOrderedListItem = (string) => {
    for (let i = 0; i < string.length; i++) {
        if (Number.isInteger(+string[i])) {
            if (string[i + 1] === '.') {
                return true;
            }

            continue;
        }

        return false;
    }
};

const parseList = exports.parseList = (block, ordered) => {
    let html = ordered ? '<ol>' : '<ul>';

    // Not terribly efficient but I don't use lists often so it's fine
    block.split('\n').forEach((b, i) => {
        const text = b.trim().slice(b.indexOf(' ') + 1);

        html += '<li>' + parseParagraph(text, { inline: true }).html + '</li>';
    });

    return html + (ordered ? '</ol>' : '</ul>');
};

const parseHeading = exports.parseHeading = (block) => {
    let level = 0;
    
    // No one should ever use more than 3 levels of headings
    for (let i = 0; i < 3; i++) {
        if (block[i] === '#') {
            level += 1;
        } else {
            break;
        }
    }

    const content = block.slice(level + 1);

    return `<h${level}>` + parseParagraph(content, { inline: true }).html + `</h${level}>`;
}

const parse = (md) => {
    const blocks = getBlocks(md);

    let html = '';

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        if (block[0] === '!') {
            // It's an image
            html += parseImage(block);
        } else if (block.startsWith('```')) {
            // It's a code block
            html += parseCodeBlock(block);
        } else if (block.startsWith('---')) {
            // It's a semantic break
            html += parseSemanticBreak(block);
        } else if (block[0] === '>') {
            // It's a blockquote
            const quoteBlocks = [ block ];

            for (let j = i + 1; j < blocks.length; j++, i++) {
                if (blocks[j][0] === '>') {
                    quoteBlocks.push(blocks[j]);
                } else {
                    break;
                }
            }

            html += parseBlockQuote(quoteBlocks);
        } else if (block[0] === '-') {
            // It's an unordered list
            html += parseList(block, false);
        } else if (isOrderedListItem(block)) {
            // It's an ordered list
            html += parseList(block, true);
        } else if (block[0] === '<') {
            // It's an html block
            html += block;
        } else if (block[0] === '#') {
            // It's a heading
            html += parseHeading(block);
        } else {
            html += parseParagraph(block);
        }
    }

    return html;
};

exports.parse = parse;
