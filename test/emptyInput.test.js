const assert = require('chai').assert;
const fs = require('fs-extra');
const path = require('path');
const nexline = require('../index');

describe('Empty input test', async () => {
  it('Empty file stream', async () => {
    const nl = nexline({
      input: fs.createReadStream(path.resolve(__dirname, './data/empty.txt')),
    });

    assert.strictEqual('', await nl.next());
    assert.strictEqual(null, await nl.next());
  });

  it('Empty file descriptor', async () => {
    const nl = nexline({
      input: await fs.open(path.resolve(__dirname, './data/empty.txt'), 'r'),
    });

    assert.strictEqual('', await nl.next());
    assert.strictEqual(null, await nl.next());
  });

  it('Empty file descriptor in reverse mode', async () => {
    const nl = nexline({
      input: await fs.open(path.resolve(__dirname, './data/empty.txt'), 'r'),
      reverse: true,
    });

    assert.strictEqual('', await nl.next());
    assert.strictEqual(null, await nl.next());
  });

  it('Empty lines', async () => {
    const nl = nexline({
      input: '\n\n\n\n\n\n',
    });

    for (let i = 1; i <= 7; i++) assert.strictEqual('', await nl.next());
    assert.strictEqual(null, await nl.next());
  });

  it('Empty lines in reverse mode', async () => {
    const nl = nexline({
      input: '\n\n\n\n\n\n',
      reverse: true,
    });

    for (let i = 1; i <= 7; i++) assert.strictEqual('', await nl.next());
    assert.strictEqual(null, await nl.next());
  });
});
