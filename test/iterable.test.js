const assert = require('chai').assert;
const nexline = require('../index');

describe('Iterable test', async () => {
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
