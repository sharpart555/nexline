const assert = require('assert');
const fs = require('fs');
const path = require('path');
const nexline = require('../index');

describe('Nexline test', async () => {
	it('Stream input test', async () => {
		const nl = nexline({
			input: fs.createReadStream(path.resolve(__dirname, './data/simple.txt')),
		});

		assert.strictEqual('Test Line 1', await nl.next());
		assert.strictEqual('Test Line 2', await nl.next());
		assert.strictEqual('Test Line 3', await nl.next());
		assert.strictEqual('Test Line 4', await nl.next());
		assert.strictEqual('Test Line 5', await nl.next());
		assert.strictEqual(null, await nl.next());
	});
});