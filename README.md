# smdp

A <b>s</b>imple <b>m</b>ark<b>d</b>own <b>p</b>arser. No dependencies and ~300 LOC. [Not trying to be 100% complete.](#about)

```bash
$ npm i @fsoc/smdp
```

```js
// example/readme.js
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

Because I wrote this for myself first and foremost, very little effort went into following the standard (none, in fact, since I never even read it). It parses all the markdown I ever wrote so it's good enough for me.

If you're missing something, please feel free to open an issue.
