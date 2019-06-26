/**
 * Import
 */
const stream = require('stream');
const commonUtil = require('./util/commonUtil');

/**
 * Variables
 */
const LINE_SEPERATOR = {
	CRLF: '\r\n',
	LF: '\n',
	CR: '\r',
};
const LINE_SEPERATOR_LIST = Object.keys(LINE_SEPERATOR);

/**
 * Create nextline
 * @param param
 * @param param.input text or buffer (it also can be array)
 * @param param.readSize
 * @param param.lineSeperator
 */
function nextline(param) {
	/**
	 * Verify & sanitize parameter
	 */
	const param2 = {
		readSize: 1024 * 1024, // 1MB
		lineSeperator: 'CRLF',
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
