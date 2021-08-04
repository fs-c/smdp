const { parse, getBlocks, parseParagraph } = require('../src/');
const { strictEqual, deepStrictEqual } = require('assert/strict');

// Apparently \r\n automatically gets converted to \n here, internally, so force
// parser to use it even on Windows
deepStrictEqual(getBlocks(`

a

b


c`, { lineEnding: '\n' }), [ 'a', 'b', 'c' ]);

//
// Paragraphs
//

deepStrictEqual(parseParagraph('a'), '<p>a</p>');
deepStrictEqual(parseParagraph('Lorem ipsum dolor'), '<p>Lorem ipsum dolor</p>');

// Emphasis
deepStrictEqual(parseParagraph('_a_'), '<p><em>a</em></p>');
deepStrictEqual(parseParagraph('*a*'), '<p><em>a</em></p>');
deepStrictEqual(parseParagraph('Lorem _ipsum_ dolor'), '<p>Lorem <em>ipsum</em> dolor</p>');
deepStrictEqual(parseParagraph('__a__'), '<p><strong>a</strong></p>');
deepStrictEqual(parseParagraph('**a**'), '<p><strong>a</strong></p>');
deepStrictEqual(parseParagraph('Lorem __ipsum__ dolor'), '<p>Lorem <strong>ipsum</strong> dolor</p>');

// Links
deepStrictEqual(parseParagraph('[content](href)'), '<p><a href="href">content</a></p>');
deepStrictEqual(parseParagraph('[Some link text](https://example.com/a_b)'), '<p><a href="https://example.com/a_b">Some link text</a></p>');
deepStrictEqual(parseParagraph('Lorem [ipsum dolor](./a.b) sit amet'), '<p>Lorem <a href="./a.b">ipsum dolor</a> sit amet</p>');

// Inline code
deepStrictEqual(parseParagraph('Lorem `ipsum` dolor'), '<p>Lorem <code>ipsum</code> dolor</p>');
deepStrictEqual(parseParagraph('Lorem `[ipsum](a) _dolor_` sit amet'), '<p>Lorem <code>[ipsum](a) _dolor_</code> sit amet</p>');

// Inline html
deepStrictEqual(parseParagraph('Lorem <span class="a">ipsum</span> dolor'), '<p>Lorem <span class="a">ipsum</span> dolor</p>');
