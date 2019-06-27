/**
 * Import
 */
const stream = require('stream');
const commonUtil = require('./util/commonUtil');

/**
 * Create nextline
 * @param param
 * @param param.input text or buffer (it also can be array)
 * @param [param.lineSeperator] if not specified, auto detect crlf and lf
 */
function nextline(param) {
	/**
	 * Verify & sanitize parameter
	 */
	const param2 = {
		lineSeperator: undefined,
		...param,
	};

	// Verify input
	if (!param2.input) throw new Error('Empty input');

	// Make input to array
	const inputList = Array.isArray(param2.input) ? param2.input : [param2.input];
	if (inputList.length === 0) throw new Error('Empty input');

	for (const input of inputList) {
		if (typeof input !== 'string' && !(input instanceof stream.Readable)) throw new Error('Invalid input. Input must be string or readable stream');
	}

	// Sanitize readSize
	param2.readSize = commonUtil.sanitizeNumber({
		value: param2.readSize,
		default: 1024 * 1024,
		min: 1,
		max: 1024 * 1024 * 1024,
	});

	// Sanitize lineSeperator
	param2.lineSeperator = commonUtil.sanitizeEnum({
		value: param2.lineSeperator.toUpperCase(),
		list: LINE_SEPERATOR_LIST,
	});
}

/**
 * Export
 */
module.exports = nextline;
