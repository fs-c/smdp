const path = require('path');
const { parse, getBlocks, parseParagraph } = require('../src/');
const { strictEqual, deepStrictEqual } = require('assert/strict');

// Apparently \r\n automatically gets converted to \n here, internally, so force
// parser to use it even on Windows
deepStrictEqual(getBlocks(`

a

b


c`, { lineEnding: '\n' }), [ 'a', 'b', 'c' ]);

deepStrictEqual(parseParagraph('a'), '<p>a</p>');
deepStrictEqual(parseParagraph('Lorem ipsum dolor'), '<p>Lorem ipsum dolor</p>');
deepStrictEqual(parseParagraph('_a_'), '<p><em>a</em></p>');
deepStrictEqual(parseParagraph('*a*'), '<p><em>a</em></p>');
deepStrictEqual(parseParagraph('Lorem _ipsum_ dolor'), '<p>Lorem <em>ipsum</em> dolor</p>');
deepStrictEqual(parseParagraph('__a__'), '<p><strong>a</strong></p>');
deepStrictEqual(parseParagraph('**a**'), '<p><strong>a</strong></p>');
deepStrictEqual(parseParagraph('Lorem __ipsum__ dolor'), '<p>Lorem <strong>ipsum</strong> dolor</p>');
