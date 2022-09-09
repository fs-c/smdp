const { parse, parseCodeBlock } = require('../src/');
const { deepStrictEqual } = require('assert/strict');

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
 &lt;Dolor&gt;&lt;/Dolor&gt;
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
 &lt;Dolor&gt;&lt;/Dolor&gt;
  Sit amet</code></pre>`);

// With the parse function
deepStrictEqual(parse(`Lorem

\`\`\`Ipsum
    Dolor
        <Sit />

Amet
\`\`\`

Consectur`), `<p>Lorem</p><pre><code class="language-ipsum">    Dolor
        &lt;Sit /&gt;

Amet</code></pre><p>Consectur</p>`);

deepStrictEqual(parse(`Lorem

\`\`\`Ipsum
Dolor
\`\`\`

Sit amet`), '<p>Lorem</p><pre><code class="language-ipsum">Dolor</code></pre><p>Sit amet</p>');