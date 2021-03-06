/**
 * Import
 */
const code = require('../code/code');
const commonUtil = require('../util/commonUtil');
const bufferReader = require('./bufferReader');
const streamReader = require('./streamReader');
const fileReader = require('./fileReader');

/**
 * Variable
 */
const { INPUT_TYPE } = code;

/**
 * Create inputReader
 * @param param
 * @param param.input
 * @param param.readSize for fileReader
 * @param param.reverse for fileReader
 */
function create(param) {
  const { input } = param;

  const inputType = commonUtil.getInputType(input);

  if (inputType === INPUT_TYPE.STREAM) return streamReader.create(param);
  else if (inputType === INPUT_TYPE.STRING || inputType === INPUT_TYPE.BUFFER) return bufferReader.create(param);
  else if (inputType === INPUT_TYPE.FILE_DESCRIPTOR) return fileReader.create(param);
  else throw new Error('Invalid input');
}

module.exports = {
  create,
};
