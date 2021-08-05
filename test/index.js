const { parse, parseImage, parseSemanticBreak, parseBlockQuote, parseList,
    parseHeading } = require('../src/');
const { deepStrictEqual } = require('assert/strict');

require('./blocks');
require('./paragraphs');
require('./code-blocks');

//
// Main parse function
//

deepStrictEqual(parse(`

# Lorem _ipsum_

Dolor sit.

Amet.`), '<h1>Lorem <em>ipsum</em></h1><p>Dolor sit.</p><p>Amet.</p>');

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
// Images
//

deepStrictEqual(parseImage('![label](image)'),
    '<figure role="img"><img src="image" alt="label"><figcaption>label</figcaption></figure>');
deepStrictEqual(parseImage('![Lorem _ipsum_ dolor](https://a.b/c_d)'),
    '<figure role="img"><img src="https://a.b/c_d" alt="Lorem <em>ipsum</em> dolor"><figcaption>Lorem <em>ipsum</em> dolor</figcaption></figure>');

// With the parse function
deepStrictEqual(parse(`Lorem

![_Ipsum_](Dolor)

Dolor`), `<p>Lorem</p><figure role="img"><img src="Dolor" alt="<em>Ipsum</em>"><figcaption><em>Ipsum</em></figcaption></figure><p>Dolor</p>`)

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

// With the parse function
deepStrictEqual(parse(`# Level 1

Lorem ipsum

## Level 2

Dolor sit amet

### Level 3

Consecitur`), '<h1>Level 1</h1><p>Lorem ipsum</p><h2>Level 2</h2><p>Dolor sit amet</p><h3>Level 3</h3><p>Consecitur</p>')

//
// Semantic breaks
//

deepStrictEqual(parseSemanticBreak('---'), '<hr>');

