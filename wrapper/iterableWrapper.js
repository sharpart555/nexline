const multiInputWrapper = require('./multiInputWrapper');

/**
 * Make nexline iterable
 * @param param
 * @param param.input string, buffer, readable stream, file descriptor
 * @param [param.lineSeparator]
 * @param [param.encoding] input stream encoding using iconv-lite
 * @param [param.reverse] starting from last line
 * @param [param.autoCloseFile] close file descriptor automatically
 * @returns {{next: next, close: close}}
 */
function iterableWrapper(param) {
  const instance = multiInputWrapper(param);

  if (Symbol.asyncIterator) {
    instance[Symbol.asyncIterator] = () => ({
      async next() {
        const line = await instance.next();
        if (line === null) return { done: true };
        else return { done: false, value: line };
      },
    });
  }

  return instance;
}

module.exports = iterableWrapper;
