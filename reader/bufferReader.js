/**
 * Buffer Reader
 * @param param
 * @param param.input
 */
function create(param) {
  const { input } = param;
  let isFinished = false;

  /**
   * Read stream
   */
  async function read() {
    if (isFinished) return null;
    isFinished = true;
    return Buffer.isBuffer(input) ? input : Buffer.from(input);
  }

  return {
    read,
  };
}

module.exports = {
  create,
};
