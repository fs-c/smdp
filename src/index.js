const { EOF } = require('os');

const getBlocks = exports.getBlocks = (md, { lineEnding = EOF }) => {
    const blocks = md.split(lineEnding + lineEnding);
    const processed = [];

    for (const block of blocks) {
        if (!block || !block.length) {
            continue;
        }

        processed.push(block.trim());
    }

    return processed;
};

const parseParagraph = exports.parseParagraph = (block) => {
    let html = '<p>';

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

    for (let i = 1; i <= block.length; i++) {
        const cur = block[i - 1];
        const next = block[i];

        // Handle inline code
        if (cur === '`') {
            if (inCode) {
                inCode = false;

                html += '</code>';
            } else {
                inCode = true;

                html += '<code>';
            }
        } else if (inCode) {
            html += cur;
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

                html += `<a href="${currentLink.href}">${currentLink.content}</a>`;

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

    return html + '</p>';
};

const parse = (md) => {
    const blocks = getBlocks(md);

    let html = '';

    for (const block of blocks) {
        if (block[0] === '!') {
            // It's an image
        } else if (block.startsWith('```')) {
            // It's a code block
        } else if (block.startsWith('---')) {
            // It's a semantic break
        } else if (block[0] === '>') {
            // It's a blockquote
        } else if (block[0] === '-') {
            // It's an unordered list
        } else if (Number.isInteger(+block.slice(0, block.indexOf('.')))) {
            // It's an ordered list
        } else if (block[0] === '<') {
            // It's an html block
        } else if (block[0] === '#') {
            // It's a heading
        } else {
            html += parseParagraph(block);
        }
    }

    return html;
};

exports.parse = parse;
