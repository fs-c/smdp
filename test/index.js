const path = require('path');
const { parse, getBlocks, parseParagraph } = require('../src/');
const { strictEqual, deepStrictEqual } = require('assert/strict');

deepStrictEqual(getBlocks(`

a

b


c`), [ 'a', 'b', 'c' ]);

deepStrictEqual(parseParagraph('a'), '<p>a</p>');
deepStrictEqual(parseParagraph('Lorem ipsum dolor'), '<p>Lorem ipsum dolor</p>');
deepStrictEqual(parseParagraph('_a_'), '<p><em>a</em></p>');
deepStrictEqual(parseParagraph('Lorem _ipsum_ dolor'), '<p>Lorem <em>ipsum</em> dolor</p>');
deepStrictEqual(parseParagraph('__a__'), '<p><strong>a</strong></p>');
deepStrictEqual(parseParagraph('Lorem __ipsum__ dolor'), '<p>Lorem <strong>ipsum</strong> dolor</p>');
