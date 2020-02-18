const assert = require('chai').assert;
const nexline = require('../index');

describe('Separator test', async () => {
  it('Using custom separator', async () => {
    const nl = nexline({
      input: '123;456;789;',
      lineSeparator: ';',
    });

    assert.strictEqual('123', await nl.next());
    assert.strictEqual('456', await nl.next());
    assert.strictEqual('789', await nl.next());
    assert.strictEqual('', await nl.next());
    assert.strictEqual(null, await nl.next());
  });

  it('Using multiple separator', async () => {
    const nl = nexline({
      input: '123;456\r\n789\n000;',
      lineSeparator: [';', '\n', '\r\n'],
    });

    assert.strictEqual('123', await nl.next());
    assert.strictEqual('456', await nl.next());
    assert.strictEqual('789', await nl.next());
    assert.strictEqual('000', await nl.next());
    assert.strictEqual('', await nl.next());
    assert.strictEqual(null, await nl.next());
  });

  it('Using multiple separator in reverse mode', async () => {
    const nl = nexline({
      input: '123;456\r\n789\n000;',
      lineSeparator: [';', '\n', '\r\n'],
      reverse: true,
    });

    assert.strictEqual('', await nl.next());
    assert.strictEqual('000', await nl.next());
    assert.strictEqual('789', await nl.next());
    assert.strictEqual('456', await nl.next());
    assert.strictEqual('123', await nl.next());
    assert.strictEqual(null, await nl.next());
  });
});
