const assert = require('chai').assert;
const fs = require('fs-extra');
const path = require('path');
const nexline = require('../index');

describe('Nexline common test', async () => {
  it('Close nexline ', async () => {
    const nl = nexline({
      input: await fs.open(path.resolve(__dirname, './data/large.txt'), 'r'),
      autoCloseFile: true,
    });

    assert.strictEqual(true, (await nl.next()).startsWith('Line 1,'));
    nl.close();
    assert.strictEqual(null, await nl.next(), 'Returns null after close');
  });

  it('Check parameter', async () => {
    assert.throws(
      () => {
        nexline();
      },
      undefined,
      undefined,
      'Throws error when parameter is empty'
    );

    assert.throws(
      () => {
        nexline({
          input: undefined,
        });
      },
      undefined,
      undefined,
      'Throws error when input is invalid'
    );

    assert.throws(
      () => {
        nexline({
          input: '123',
          lineSeparator: true,
        });
      },
      undefined,
      undefined,
      'Throws error when line separator is invalid'
    );

    assert.throws(
      () => {
        nexline({
          input: '123',
          encoding: 'notSupportedEncoding',
        });
      },
      undefined,
      undefined,
      'Throws error when encoding is invalid'
    );

    assert.throws(
      () => {
        nexline({
          input: fs.createReadStream(path.resolve(__dirname, './data/simple.txt')),
          reverse: true,
        });
      },
      undefined,
      undefined,
      'Throws error when using reverse mode in with stream input'
    );
  });

  it('Nexline is iterable', async () => {
    const inputList = ['123', '456', '789'];
    const nl = nexline({
      input: inputList.join('\n'),
    });

    let count = 0;
    for await (const line of nl) {
      assert.strictEqual(line, inputList[count++]);
    }
    assert.strictEqual(await nl.next(), null, 'After iterator is end, returns null');
  });
});
