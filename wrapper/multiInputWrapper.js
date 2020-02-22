/**
 * Import
 */
const nexline = require('../nexline');
const commonUtil = require('../util/commonUtil');

/**
 * Nexline wrapper for supporting multiple inputs
 * @param param
 * @param param.input string, buffer, readable stream, file descriptor
 * @param [param.lineSeparator]
 * @param [param.encoding] input stream encoding using iconv-lite
 * @param [param.reverse] starting from last line
 * @param [param.autoCloseFile] close file descriptor automatically
 */
function multiInputWrapper(param) {
  // Verify input
  const inputList = commonUtil.toArray(param.input);
  if (inputList.length === 0) throw new Error('Invalid input');

  // Create nexlines for each input
  const nlList = [];
  for (const item of inputList) {
    nlList.push(
      nexline(
        commonUtil.removeUndefined({
          ...param,
          input: item,
        })
      )
    );
  }

  /**
   * Get next line
   */
  async function next() {
    // If nlList is empty, return null
    if (nlList.length === 0) return null;

    // Using first item in nlList
    const nl = nlList[0];

    // Get next line
    const result = await nl.next();

    // If it is null, move to next input
    if (result === null) {
      nlList.shift();
      return next();
    } else {
      return result;
    }
  }

  function close() {
    for (const nl of nlList) nl.close();
  }

  /**
   * Expose method
   */
  return {
    next,
    close,
  };
}

module.exports = multiInputWrapper;
