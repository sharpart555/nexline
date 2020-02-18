const assert = require('chai').assert;
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const nexline = require('../index');

describe('Various input types test', async () => {
  it('Text input', async () => {
    const nl = nexline({
      input: '123\n456\n789',
    });

    assert.strictEqual('123', await nl.next());
    assert.strictEqual('456', await nl.next());
    assert.strictEqual('789', await nl.next());
    assert.strictEqual(null, await nl.next());
  });

  it('Text input reverse mode', async () => {
    const nl = nexline({
      input: '123\n456\n789',
      reverse: true,
    });

    assert.strictEqual('789', await nl.next());
    assert.strictEqual('456', await nl.next());
    assert.strictEqual('123', await nl.next());
    assert.strictEqual(null, await nl.next());
  });

  it('Buffer input', async () => {
    const nl = nexline({
      input: Buffer.from('123\n456\n789'),
    });

    assert.strictEqual('123', await nl.next());
    assert.strictEqual('456', await nl.next());
    assert.strictEqual('789', await nl.next());
    assert.strictEqual(null, await nl.next());
  });

  it('Buffer input reverse mode', async () => {
    const nl = nexline({
      input: Buffer.from('123\n456\n789'),
      reverse: true,
    });

    assert.strictEqual('789', await nl.next());
    assert.strictEqual('456', await nl.next());
    assert.strictEqual('123', await nl.next());
    assert.strictEqual(null, await nl.next());
  });

  it('Stream input', async () => {
    const nl = nexline({
      input: fs.createReadStream(path.resolve(__dirname, './data/large.txt')),
    });

    for (let i = 1; i <= 2000; i++) assert.strictEqual(true, (await nl.next()).startsWith(`Line ${i},`));
    assert.strictEqual(null, await nl.next(), 'After 2000 lines read, returns null');
  });

  it('File input', async () => {
    const nl = nexline({
      input: await fs.open(path.resolve(__dirname, './data/large.txt'), 'r'),
      autoCloseFile: true,
    });

    for (let i = 1; i <= 2000; i++) assert.strictEqual(true, (await nl.next()).startsWith(`Line ${i},`));
    assert.strictEqual(null, await nl.next(), 'After 2000 lines read, returns null');
  });

  it('File input reverse mode', async () => {
    const nl = nexline({
      input: await fs.open(path.resolve(__dirname, './data/large.txt'), 'r'),
      reverse: true,
      autoCloseFile: true,
    });

    for (let i = 2000; i >= 1; i--) assert.strictEqual(true, (await nl.next()).startsWith(`Line ${i},`));
    assert.strictEqual(null, await nl.next(), 'After 2000 lines read, returns null');
  });

  it('Multiple input', async () => {
    const nl = nexline({
      input: [
        fs.createReadStream(path.resolve(__dirname, './data/simple.txt')), //
        fs.createReadStream(path.resolve(__dirname, './data/empty.txt')),
        '123\r\n456\n789',
        Buffer.from('123\r\n456\n789'),
      ],
      lineSeparator: [';', '\n', '\r\n'],
    });

    assert.strictEqual('Test Line 1', await nl.next());
    assert.strictEqual('Test Line 2', await nl.next());
    assert.strictEqual('Test Line 3', await nl.next());
    assert.strictEqual('Test Line 4', await nl.next());
    assert.strictEqual('Test Line 5', await nl.next());
    assert.strictEqual('', await nl.next());
    assert.strictEqual('123', await nl.next());
    assert.strictEqual('456', await nl.next());
    assert.strictEqual('789', await nl.next());
    assert.strictEqual('123', await nl.next());
    assert.strictEqual('456', await nl.next());
    assert.strictEqual('789', await nl.next());
    assert.strictEqual(null, await nl.next());
  });

  it('Broken buffer stream', async () => {
    const nl = nexline({
      input: fs.createReadStream(path.resolve(__dirname, './data/brokenBuffer.txt'), { highWaterMark: 128 }),
      lineSeparator: os.EOL,
    });

    while (true) {
      const line = await nl.next();
      if (line === null) break;
      assert.strictEqual(line.length, 70, 'Length of each line is 70');
    }
  });

  it('Other Encoding', async () => {
    const nl = nexline({
      input: fs.createReadStream(path.resolve(__dirname, './data/cp949.txt')),
      encoding: 'cp949',
      lineSeparator: os.EOL,
    });

    assert.strictEqual('가나다라', await nl.next());
    assert.strictEqual('마바사아', await nl.next());
    assert.strictEqual('자차카아', await nl.next());
    assert.strictEqual(null, await nl.next());
  });
});
