const { parse, getBlocks, parseParagraph, parseImage, parseCodeBlock,
    parseSemanticBreak, parseBlockQuote, parseList, parseHeading } = require('../src/');
const { deepStrictEqual } = require('assert/strict');

//
// Utility
//

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

//
// Main parse function
//

deepStrictEqual(parse(`

# Lorem _ipsum_

Dolor sit.

Amet.`), '<h1>Lorem <em>ipsum</em></h1><p>Dolor sit.</p><p>Amet.</p>');

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

// Line breaks
deepStrictEqual(parseParagraph(`Lorem
ipsum
dolor`).html, '<p>Lorem<br>ipsum<br>dolor</p>')

// With the parse function
deepStrictEqual(parse(`Lorem

[\`Ipsum\`](Dolor)

_Sit_ __Amet__`), `<p>Lorem</p><p><a href="Dolor"><code>Ipsum</code></a></p><p><em>Sit</em> <strong>Amet</strong></p>`);

//
// Images
//

deepStrictEqual(parseImage('![label](image)'), '<figure role="img"><img src="image" alt="label"><figcaption>label</figcaption></figure>');
deepStrictEqual(parseImage('![Lorem _ipsum_ dolor](https://a.b/c_d)'),
    '<figure role="img"><img src="https://a.b/c_d" alt="Lorem <em>ipsum</em> dolor"><figcaption>Lorem <em>ipsum</em> dolor</figcaption></figure>');

// With the parse function
deepStrictEqual(parse(`Lorem

![_Ipsum_](Dolor)

Dolor`), `<p>Lorem</p><figure role="img"><img src="Dolor" alt="<em>Ipsum</em>"><figcaption><em>Ipsum</em></figcaption></figure><p>Dolor</p>`)

//
// Code blocks
//

deepStrictEqual(parseCodeBlock(
`\`\`\`
Lorem ipsum
\`\`\``), '<pre><code class="language-plaintext">Lorem ipsum</code></pre>');

deepStrictEqual(parseCodeBlock(
`\`\`\`
Lorem _ipsum_
 <Dolor></Dolor>
  Sit amet
\`\`\``),
`<pre><code class="language-plaintext">Lorem _ipsum_
 <Dolor></Dolor>
  Sit amet</code></pre>`);

deepStrictEqual(parseCodeBlock(
`\`\`\`D
Lorem ipsum
\`\`\``), '<pre><code class="language-d">Lorem ipsum</code></pre>');

deepStrictEqual(parseCodeBlock(
`\`\`\`doloR
Lorem _ipsum_
 <Dolor></Dolor>
  Sit amet
\`\`\``),
`<pre><code class="language-dolor">Lorem _ipsum_
 <Dolor></Dolor>
  Sit amet</code></pre>`);

// With the parse function
deepStrictEqual(parse(`Lorem

\`\`\`Ipsum
Dolor
Sit

Amet
\`\`\`

Consectur`), `<p>Lorem</p><pre><code class="language-ipsum">Dolor
Sit

Amet</code></pre><p>Consectur</p>`);

//
// Semantic breaks
//

deepStrictEqual(parseSemanticBreak('---'), '<hr>');

//
// Block quotes
//

deepStrictEqual(parseBlockQuote('>Lorem'), '<blockquote><p>Lorem</p></blockquote>');
deepStrictEqual(parseBlockQuote('>__Lorem__ [ipsum](href)'),
    '<blockquote><p><strong>Lorem</strong> <a href="href">ipsum</a></p></blockquote>');
deepStrictEqual(parseBlockQuote(`>Lorem

>__Ipsum__

>Dolor`),
    '<blockquote><p>Lorem</p><p><strong>Ipsum</strong></p><p>Dolor</p></blockquote>');
deepStrictEqual(parse(
`>Lorem

>[Ipsum](href)

>__Dolor__`
), '<blockquote><p>Lorem</p><p><a href="href">Ipsum</a></p><p><strong>Dolor</strong></p></blockquote>');

//
// Lists
//

deepStrictEqual(parseList(`- Lorem`, false), '<ul><li>Lorem</li></ul>');
deepStrictEqual(parseList(`- [__Lorem__](ipsum)`, false),
    '<ul><li><a href="ipsum"><strong>Lorem</strong></a></li></ul>');
deepStrictEqual(parseList(
`- Lorem
- Ipsum
- Dolor`, false
), '<ul><li>Lorem</li><li>Ipsum</li><li>Dolor</li></ul>');

deepStrictEqual(parseList(`1. Lorem`, true), '<ol><li>Lorem</li></ol>');
deepStrictEqual(parseList(`1. [__Lorem__](ipsum)`, true),
    '<ol><li><a href="ipsum"><strong>Lorem</strong></a></li></ol>');
deepStrictEqual(parseList(
`1. Lorem
2. Ipsum
3. Dolor`, true
), '<ol><li>Lorem</li><li>Ipsum</li><li>Dolor</li></ol>');

//
// Headings
//

deepStrictEqual(parseHeading('# Lorem'), '<h1>Lorem</h1>');
deepStrictEqual(parseHeading('## Ipsum'), '<h2>Ipsum</h2>');
deepStrictEqual(parseHeading('### Dolor sit amet'), '<h3>Dolor sit amet</h3>');

deepStrictEqual(parseHeading('# _Lorem_ [ipsum](dolor) `sit` amet'),
    '<h1><em>Lorem</em> <a href="dolor">ipsum</a> <code>sit</code> amet</h1>');
