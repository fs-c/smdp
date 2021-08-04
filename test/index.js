const { getBlocks, parseParagraph, parseImage, parseCodeBlock } = require('../src/');
const { deepStrictEqual } = require('assert/strict');

//
// Utility
//

// Apparently \r\n automatically gets converted to \n internally, so force
// parser to use it even on Windows
// (The file contains CRLF on Windows, but looking at the string in JS shows \n.)
deepStrictEqual(getBlocks(`

a

b


c`, { lineEnding: '\n' }), [ 'a', 'b', 'c' ]);

//
// Paragraphs
//

deepStrictEqual(parseParagraph('a').html, '<p>a</p>');
deepStrictEqual(parseParagraph('Lorem ipsum dolor').html, '<p>Lorem ipsum dolor</p>');

// Emphasis
deepStrictEqual(parseParagraph('_a_').html, '<p><em>a</em></p>');
deepStrictEqual(parseParagraph('*a*').html, '<p><em>a</em></p>');
deepStrictEqual(parseParagraph('Lorem _ipsum_ dolor').html, '<p>Lorem <em>ipsum</em> dolor</p>');
deepStrictEqual(parseParagraph('__a__').html, '<p><strong>a</strong></p>');
deepStrictEqual(parseParagraph('**a**').html, '<p><strong>a</strong></p>');
deepStrictEqual(parseParagraph('Lorem __ipsum__ dolor').html, '<p>Lorem <strong>ipsum</strong> dolor</p>');

// Links
deepStrictEqual(parseParagraph('[content](href)').html, '<p><a href="href">content</a></p>');
deepStrictEqual(parseParagraph('[Some link text](https://example.com/a_b)').html, '<p><a href="https://example.com/a_b">Some link text</a></p>');
deepStrictEqual(parseParagraph('Lorem [ipsum dolor](./a.b) sit amet').html, '<p>Lorem <a href="./a.b">ipsum dolor</a> sit amet</p>');
deepStrictEqual(parseParagraph('Lorem [ipsum _dolor_](./a.b) sit amet').html, '<p>Lorem <a href="./a.b">ipsum <em>dolor</em></a> sit amet</p>');
deepStrictEqual(parseParagraph('Lorem [ipsum `dolor`](./a.b) sit amet').html, '<p>Lorem <a href="./a.b">ipsum <code>dolor</code></a> sit amet</p>');

// Inline code
deepStrictEqual(parseParagraph('Lorem `ipsum` dolor').html, '<p>Lorem <code>ipsum</code> dolor</p>');
deepStrictEqual(parseParagraph('Lorem `[ipsum](a) _dolor_` sit amet').html, '<p>Lorem <code>[ipsum](a) _dolor_</code> sit amet</p>');

// Inline html
deepStrictEqual(parseParagraph('Lorem <span class="a">ipsum</span> dolor').html, '<p>Lorem <span class="a">ipsum</span> dolor</p>');
deepStrictEqual(parseParagraph('Lorem <span class="a">_ipsum_</span> dolor').html, '<p>Lorem <span class="a">_ipsum_</span> dolor</p>');
deepStrictEqual(parseParagraph('Lorem <span class="a">_ipsum_ <span>sit</span></span> dolor').html,
    '<p>Lorem <span class="a">_ipsum_ <span>sit</span></span> dolor</p>');

//
// Images
//

deepStrictEqual(parseImage('![label](image)'), '<figure role="img"><img src="image" alt="label"><figcaption>label</figcaption></figure>');
deepStrictEqual(parseImage('![Lorem _ipsum_ dolor](https://a.b/c_d)'),
    '<figure role="img"><img src="https://a.b/c_d" alt="Lorem <em>ipsum</em> dolor"><figcaption>Lorem <em>ipsum</em> dolor</figcaption></figure>');

//
// Code blocks
//

deepStrictEqual(parseCodeBlock(
`\`\`\`
Lorem ipsum
\`\`\``), '<pre><code>Lorem ipsum</code></pre>');

deepStrictEqual(parseCodeBlock(
`\`\`\`
Lorem _ipsum_
 <Dolor></Dolor>
  Sit amet
\`\`\``),
`<pre><code>Lorem _ipsum_
 <Dolor></Dolor>
  Sit amet</code></pre>`);
