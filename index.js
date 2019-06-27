/**
 * Import
 */
const stream = require('stream');
const commonUtil = require('./util/commonUtil');

/**
 * Create nextline
 * @param param
 * @param param.input string or Readable stream
 * @param [param.lineSeperator] if not specified, auto detect crlf and lf
 */
function nextline(param) {
	/**
	 * Verify & sanitize parameter
	 */
	const param2 = {
		lineSeperator: ['\n', '\r\n'],
		...param,
	};

	// Verify input
	const input = param2.input;
	if (!input) throw new Error('Empty input');
	if (typeof input !== 'string' && !(input instanceof stream.Readable)) throw new Error('Invalid input. Input must be string or readable stream');

	// Verify lineSeperator
	const lineSeperatorList = Array.isArray(param2.lineSeperator) ? [...param2.lineSeperator] : [param2.lineSeperator];
	if (lineSeperatorList.length === 0) throw new Error('Invalid lineSeperator');
	for (const item of lineSeperatorList) {
		if (typeof item !== 'string' || item.length === 0) throw new Error('Invalid lineSeperator, lineSeperator must be string and must exceed one character');
	}
}

/**
 * Export
 */
module.exports = nextline;
