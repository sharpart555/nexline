/**
 * Import
 */
const stream = require('stream');
const { INPUT_TYPE } = require('../code/code');

/**
 * Check and return inputType
 * @param input
 */
function getInputType(input) {
	if (typeof input === 'string') return INPUT_TYPE.STRING;
	else if (input instanceof stream.Readable) return INPUT_TYPE.STREAM;
	else if (Buffer.isBuffer(input)) return INPUT_TYPE.BUFFER;
}

/**
 * Get lineSeparator index
 * @param buffer
 * @param lineSeparatorList
 */
function getLineSeparatorPosition(buffer, lineSeparatorList) {
	const result = {
		index: -1,
		length: 0,
	};

	// Iterate over lineSeparatorList
	for (const item of lineSeparatorList) {
		const index = buffer.indexOf(item);
		if (index === -1) continue;

		if (
			result.index === -1 || //
			index < result.index ||
			(index === result.index && item.length > result.length)
		) {
			result.index = index;
			result.length = item.length;
		}
	}

	return result;
}

/**
 * Get one line from string
 * @param text
 * @param lineSeparatorList
 */
function getLineAndRest(text, lineSeparatorList) {
	const position = getLineSeparatorPosition(text, lineSeparatorList);

	if (position.index === -1) {
		// If line separator not found
		return {
			line: text,
			rest: null,
		};
	} else {
		// If line separator found
		return {
			line: text.slice(0, position.index),
			rest: text.slice(position.index + position.length),
		};
	}
}

/**
 * Check text has line separator
 * @param text
 * @param lineSeparatorList
 */
function hasLineSeparator(text, lineSeparatorList) {
	const lineInfo = getLineSeparatorPosition(text, lineSeparatorList);
	return lineInfo.index !== -1;
}

/**
 * Concatenate string with special null treatment
 * @param a
 * @param b
 */
function concat(a, b) {
	if (a === null && b === null) return null;

	const textA = a === null ? '' : a;
	const textB = b === null ? '' : b;
	return textA + textB;
}

/**
 * Remove undefined key in object
 * @param object
 */
function removeUndefined(object) {
	for (const k in object) {
		if (Object.prototype.hasOwnProperty.call(object, k) && object[k] === undefined) delete object[k];
	}

	return object;
}

module.exports = {
	getInputType,
	getLineSeparatorPosition,
	getLineAndRest,
	hasLineSeparator,
	concat,
	removeUndefined,
};
