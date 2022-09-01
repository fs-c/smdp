# smdp

A <b>s</b>imple <b>m</b>ark<b>d</b>own <b>p</b>arser. No dependencies and ~300 LOC. Not trying to be fully complete or spec compliant; can parse everything in this README but not much else.

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

This was written to parse simple blog posts, so it handles everything you would likely expect to see in one. Obscure edge cases and rarely used (that is, rarely used or seen by me) features like references and tables aren't implemented.

Take a look at the files in `test/` to see what _is_ implemented. Or just try it out, there's a good chance you don't use the stuff that's not supported anyways.

In any case, if you've discovered a bug or are missing a feature, please feel free to open an issue.
