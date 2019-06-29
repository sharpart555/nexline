/**
 * Import
 */
const nexline = require('./nexline');

/**
 * Nexline wrapper for supporting multiple inputs
 * @param param
 * @param param.input
 * @param [param.lineSeparator]
 * @param [param.encoding]
 */
function nexlineMultiInput(param) {
	// Setup default parameter
	const param2 = {
		lineSeparator: ['\n', '\r\n'],
		encoding: 'utf8',
		...param,
	};

	// Verify input
	const inputList = Array.isArray(param2.input) ? [...param2.input] : [param2.input];
	if (inputList.length === 0) throw new Error('Invalid input');

	// Create nexlines for each input
	const nlList = [];
	for (const item of inputList) {
		nlList.push(
			nexline({
				input: item,
				lineSeparator: param2.lineSeparator,
				encoding: param2.encoding,
			})
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

module.exports = nexlineMultiInput;
