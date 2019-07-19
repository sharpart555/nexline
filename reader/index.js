/**
 * Import
 */
const code = require('../code/code');
const commonUtil = require('../util/commonUtil');
const bufferReader = require('./bufferReader');
const streamReader = require('./streamReader');

/**
 * Variable
 */
const { INPUT_TYPE } = code;

/**
 * Create inputReader
 * @param input
 */
function create(input) {
	const inputType = commonUtil.getInputType(input);
	if (inputType === INPUT_TYPE.STREAM) return streamReader.create(input);
	else if (inputType === INPUT_TYPE.STRING || inputType === INPUT_TYPE.BUFFER) return bufferReader.create(input);
	else throw new Error('Invalid input');
}

module.exports = {
	create,
};
