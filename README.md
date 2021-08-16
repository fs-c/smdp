# smdp

A <b>s</b>imple <b>m</b>ark<b>d</b>own <b>p</b>arser. No dependencies and ~300 LOC. [Not trying to be 100% complete.](#about)

```bash
$ npm i @fsoc/smdp
```

```js
// This example can be found in example/readme.js, assuming you run it from the 
// root of the repository it converts this file (README.md) into HTML. 

const { parse } = require('@fsoc/smdp');
const { readFileSync, writeFileSync } = require('fs');

const markdown = readFileSync('README.md');

const html = parse(markdown);

writeFileSync('README.html', html);
```

The `parse` function accepts a string of markdown as its only argument and outputs a string of HTML. This is the only documented export, other exports are for testing and shouldn't be considered stable.

There's a pretty thorough testing setup, run it with `npm run test`.

## About

I wrote this for use in another project of mine, that's why it's in the `@fsoc` namespace. I don't want to pollute the global namespace with what is essentially in-house tooling.

Because I wrote this for myself first and foremost, I prioritized making it good enough for me and didn't waste my time on handling obscure edge-cases or rarely-used features (that is, rarely used by myself). For example, tables and reference-style links aren't implemented. Take a look at the files in `test/` to see what _is_ implemented. Or just try it out, there's a good chance you don't use the stuff that's not supported anyways. 

In any case, if you're missing something, please feel free to open an issue.
