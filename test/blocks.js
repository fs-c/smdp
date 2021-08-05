const { getBlocks } = require('../src/');
const { deepStrictEqual } = require('assert/strict');

deepStrictEqual(getBlocks(`

a

b


c`), [ 'a', 'b', 'c' ]);

deepStrictEqual(getBlocks(`a
b

c

d`), [ 'a\nb', 'c', 'd' ]);

// Special case: Code blocks
deepStrictEqual(getBlocks(`a

\`\`\`a
lorem

ipsum
\`\`\`

c`), [ 'a', `\`\`\`a
lorem

ipsum
\`\`\``, 'c' ]);

// Special case: Block quotes
deepStrictEqual(getBlocks(`a

>Lorem

>Ipsum

>Dolor

b`), [ 'a', '>Lorem\n\n>Ipsum\n\n>Dolor', 'b' ])