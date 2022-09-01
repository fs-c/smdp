const getBlocks = exports.getBlocks = (md) => {
    const blocks = [ '' ];

    let blockIdx = 0;
    for (let i = 0; i < md.length; i++) {
        if (md[i] === '\r' && md[i + 1] === '\n' && md[i + 2] === '\r' && md[i + 3] === '\n') {
            blockIdx += 1;
            i += 3;

            blocks[blockIdx] = '';
        } else if (md[i] === '\n' && md[i + 1] === '\n') {
            blockIdx += 1;
            i += 1;

            blocks[blockIdx] = '';
        } else {
            blocks[blockIdx] += md[i];
        }
    }

    // At this point every block implies two line breaks afterwards (so empty blocks
    // imply extra line breaks betweem regular blocks)

    const processed = [];

    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];

        if (block === undefined) {
            continue;
        }

        if (block.startsWith('```') && !block.endsWith('```')) {
            for (i += 1; i < blocks.length; i++) {
                block += '\n\n' + blocks[i];

                if (blocks[i].endsWith('```')) {
                    break;
                }
            }
        } else if (block.startsWith('>')) {
            for (i += 1; i < blocks.length; i++) {
                if (blocks[i].startsWith('>')) {
                    block += '\n\n' + blocks[i];
                } else {
                    // Went one too far
                    i -= 1;

                    break;
                }
            }
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
        } else if (cur === '\n') {
            html += '<br>';
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
        } else if (cur === '-' && next === '-') {
            html += '&mdash;';

            i++;
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
    const firstBreak = block.indexOf('\n');
    const lastBreak = block.lastIndexOf('\n');

    const language = block.slice(3, firstBreak).toLowerCase()
        || 'plaintext';
    const content = block.slice(firstBreak + 1, lastBreak);

    return `<pre><code class="language-${language}">${content}</code></pre>`;
};

const parseSemanticBreak = exports.parseSemanticBreak = (block) => {
    return '<hr>';
};

const parseBlockQuote = exports.parseBlockQuote = (block) => {
    const content = block.split('\n').filter((b) => b.length)
        .map((b) => parseParagraph(b.slice(1)).html).join('');

    return '<blockquote>' + content + '</blockquote>';
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

    const inline = parseParagraph(block.slice(level + 1),{ inline: true });

    return `<h${level}>` + inline.html + `</h${level}>`;
}

const parseBlock = exports.parseBlock = (block) => {
    if (block[0] === '!') {
        // It's an image
        return parseImage(block);
    } else if (block.startsWith('```')) {
        // It's a code block
        return parseCodeBlock(block);
    } else if (block.startsWith('---')) {
        // It's a semantic break
        return parseSemanticBreak(block);
    } else if (block[0] === '>') {
        return parseBlockQuote(block);
    } else if (block[0] === '-') {
        // It's an unordered list
        return parseList(block, false);
    } else if (isOrderedListItem(block)) {
        // It's an ordered list
        return parseList(block, true);
    } else if (block[0] === '<') {
        // It's an html block
        return block;
    } else if (block[0] === '#') {
        // It's a heading
        return parseHeading(block);
    } else {
        // It's a paragraph
        return parseParagraph(block).html;
    }
};

const parse = (md) => {
    const blocks = getBlocks(md);

    let html = '';

    for (let i = 0; i < blocks.length; i++) {
        html += parseBlock(blocks[i]);
    }

    return html;
};

exports.parse = parse;
