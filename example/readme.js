const { parse } = require('../src/');

const { readFileSync, writeFileSync } = require('fs');

const markdown = readFileSync('README.md', 'utf-8');

const html = parse(markdown);

writeFileSync('README.html', html);
