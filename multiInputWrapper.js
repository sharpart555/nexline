/**
 * Import
 */
const nexline = require('./nexline');
const commonUtil = require('./util/commonUtil');

/**
 * Nexline wrapper for supporting multiple inputs
 * @param param
 * @param param.input
 * @param [param.lineSeparator]
 * @param [param.encoding]
 */
function multiInputWrapper(param) {
	// Verify input
	const inputList = Array.isArray(param.input) ? [...param.input] : [param.input];
	if (inputList.length === 0) throw new Error('Invalid input');

	// Create nexlines for each input
	const nlList = [];
	for (const item of inputList) {
		nlList.push(
			nexline(
				commonUtil.removeUndefined({
					input: item,
					lineSeparator: param.lineSeparator,
					encoding: param.encoding,
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

	/**
	 * Expose method
	 */
	return {
		next,
	};
}

module.exports = multiInputWrapper;
