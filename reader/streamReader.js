/**
 * Stream Reader
 * @param param
 * @param param.input
 */
function create(param) {
  const { input } = param;
  let isFinished = false;

  /**
   * Prepare stream to read
   */
  async function prepareStream() {
    if (input.destroyed) return false;

    return new Promise((resolve, reject) => {
      input.once('readable', _handleReadable);
      input.once('end', _handleEnd);
      input.once('error', _handleError);

      function _handleReadable() {
        input.removeListener('end', _handleEnd);
        input.removeListener('error', _handleError);
        resolve(true);
      }

      function _handleEnd() {
        input.removeListener('readable', _handleReadable);
        input.removeListener('error', _handleError);
        resolve(false);
      }

      function _handleError(error) {
        input.removeListener('readable', _handleReadable);
        input.removeListener('end', _handleEnd);
        reject(error);
      }
    });
  }

  /**
   * Read stream
   */
  async function read() {
    if (isFinished) return null;

    const readBuffer = input.read();
    if (readBuffer === null) {
      const prepareStatus = await prepareStream();
      if (prepareStatus === false) isFinished = true;
      return read();
    } else {
      return readBuffer;
    }
  }

  return {
    read,
  };
}

module.exports = {
  create,
};
