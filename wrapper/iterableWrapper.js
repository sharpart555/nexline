const multiInputWrapper = require('./multiInputWrapper');

/**
 * Make nexline iterable
 * @param param
 * @param param.input string, buffer, readable stream, file descriptor
 * @param [param.lineSeparator]
 * @param [param.encoding] input stream encoding using iconv-lite
 * @param [param.reverse] starting from last line
 * @param [param.autoCloseFile] close file descriptor automatically
 */
function iterableWrapper(param) {
  const instance = multiInputWrapper(param);

  const result = {
    next: instance.next,
    close: instance.close,
  };

  if (Symbol.asyncIterator) {
    result[Symbol.asyncIterator] = async function*() {
      while (true) {
        const line = await instance.next();
        if (line === null) break;
        yield line;
      }
    };
  }

  return result;
}

module.exports = iterableWrapper;
