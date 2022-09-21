const getBlocks = exports.getBlocks = (md) => {
    const getRawBlocks = (md) => {
        const blocks = [ '' ];

        let currentBlock = 0;
        for (let i = 0; i < md.length; i++) {
            // If there are two \r\n style linebreaks or if there are two \n style ones,
            // initialize a new block and make it the current one
            // Otherwise add to the current block
            if (md[i] === '\r' && md[i + 1] === '\n' && md[i + 2] === '\r' && md[i + 3] === '\n') {
                currentBlock += 1;
                i += 3;

                blocks[currentBlock] = '';
            } else if (md[i] === '\n' && md[i + 1] === '\n') {
                currentBlock += 1;
                i += 1;

                blocks[currentBlock] = '';
            } else {
                blocks[currentBlock] += md[i];
            }
        }

        // At this point every block implies two line breaks afterwards (so empty blocks
        // imply extra line breaks betweem regular blocks)
        return blocks;
    };

    const consolidateBlocks = (blocks) => {
        const processed = [];

        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];

            // Skip empty blocks (ie extra linebreaks in the markdown)
            if (block === undefined) {
                continue;
            }

            // Handle blocks which should include following blocks (code, quotes
            // and inline HTML might have multiple linebreaks but should still 
            // be one block)
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
                        // Current block doesn't start with a '>' so we should treat
                        // it like a normal block
                        i -= 1;

                        break;
                    }
                }
            } else if (block.startsWith('<')) {
                // This attempts to handle large inline HTML blocks.  This is a 
                // very sloppy solution because something like <p><p></p></p> 
                // would break it. For my use case (script tag with JS inside)
                // it works fine, anything more complex will likely require a more
                // sophisticated solution. 

                const firstSpace = block.indexOf(' ');
                const firstClosingTag = block.indexOf('>');
                const name = block.slice(1, Math.min(firstSpace, firstClosingTag))

                if (!block.endsWith(name + '>')) {
                    for (i += 1; i < blocks.length; i++) {
                        block += '\n\n' + blocks[i];
    
                        if (block.endsWith(name + '>')) {
                            break;
                        }
                    }
                }
            }

            const trimmed = block.trim();

            // Skip blocks which contain only whitespace
            if (!trimmed.length) {
                continue;
            }

            processed.push(trimmed);
        }

        return processed;
    };

    return consolidateBlocks(getRawBlocks(md));
};

const escapeHTMLCharacter = (char) => {
    if (char === '<') {
        return '&lt;';
    } else if (char === '>') {
        return '&gt;';
    } else if (char === '&') {
        return '&amp;';
    } else {
        return char;
    }
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
            // The contents of <code> tags are still interpreted as HTML, so we 
            // need to escape special characters
            // I really hate calling a function for every code character but 
            // the functionality is needed in other places as well 
            html += escapeHTMLCharacter(cur);
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
    let content = '';
    let language = '';
    let inContent = false;

    for (let i = 0; i < block.length; i++) {
        const cur = block[i];

        if (!inContent && cur === '\n') {
            // we just got done with the language part, start actually
            // handling the block but skip the newline
            inContent = true;
        } else if (!inContent && cur !== '`') {
            // we're in the language part
            language += cur.toLowerCase();
        } else if (inContent && cur === '\n' && i >= block.length - 4) {
            // we're at the last newline
            inContent = false;
        } else if (inContent) {
            content += escapeHTMLCharacter(cur);
        }
    }

    return `<pre><code class="language-${language || 'plaintext'}">${content}</code></pre>`;
};

const parseSemanticBreak = exports.parseSemanticBreak = () => {
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

    const inline = parseParagraph(block.slice(level + 1), { inline: true });

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
