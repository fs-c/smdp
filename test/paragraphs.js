const { parse, parseParagraph } = require('../src/');
const { deepStrictEqual } = require('assert/strict');

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
deepStrictEqual(parseParagraph('Lorem `<ipsum` `_dolor`').html, '<p>Lorem <code><ipsum</code> <code>_dolor</code></p>');
deepStrictEqual(parseParagraph('Lorem `<>ipsum</> <dolor /> <sit>amet</sit>`').html, '<p>Lorem <code><>ipsum</> <dolor /> <sit>amet</sit></code></p>');

// Inline html
deepStrictEqual(parseParagraph('Lorem <span class="a">ipsum</span> dolor').html, '<p>Lorem <span class="a">ipsum</span> dolor</p>');
deepStrictEqual(parseParagraph('Lorem <span class="a">_ipsum_</span> dolor').html, '<p>Lorem <span class="a">_ipsum_</span> dolor</p>');
deepStrictEqual(parseParagraph('Lorem <span class="a">_ipsum_ <span>sit</span></span> dolor').html,
    '<p>Lorem <span class="a">_ipsum_ <span>sit</span></span> dolor</p>');

// Line breaks
deepStrictEqual(parseParagraph(`Lorem
ipsum
dolor`).html, '<p>Lorem<br>ipsum<br>dolor</p>')

// Em dashes
deepStrictEqual(parseParagraph('Lorem ipsum--dolor').html, '<p>Lorem ipsum&mdash;dolor</p>')

// With the parse function
deepStrictEqual(parse(`Lorem

[\`Ipsum\`](Dolor)

_Sit_ __Amet__`), `<p>Lorem</p><p><a href="Dolor"><code>Ipsum</code></a></p><p><em>Sit</em> <strong>Amet</strong></p>`);
