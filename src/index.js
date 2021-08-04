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
    // Handle: emphasis, links, inline code and inline html

    let html = '<p>';

    const emphasis = {
        _current: 0,
        last: 0,
        get current() { return this._current; },
        set current(val) {
            this.last = this.current;
            this._current = val;
        },
    };

    let currentLink = {
        content: '',
        href: '',
    };

    for (let i = 1; i <= block.length; i++) {
        if (block[i - 1] === '*' || block[i - 1] === '_') {
            if (block[i] === '*' || block[i] === '_') {
                if (emphasis.current === 2) {
                    html += '</strong>';
                    emphasis.current = 0;
                } else {
                    html += '<strong>';
                    emphasis.current = 2;
                }
            } else {
                if (emphasis.current === 1) {
                    html += '</em>';
                    emphasis.current = 0;
                } else if (emphasis.current !== 2 && emphasis.last !== 2) {
                    html += '<em>';
                    emphasis.current = 1;
                }
            }
        } else if (block[i - 1] === '[') {
            
        } else {
            html += block[i - 1];
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
        } else {
            html += parseParagraph(block);
        }
    }

    return html;
};

exports.parse = parse;
