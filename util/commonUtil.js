/**
 * Get lineSeparator index
 * @param text
 * @param lineSeparatorList
 */
function getLineSeparatorPosition(text, lineSeparatorList) {
	const result = {
		index: -1,
		length: 0,
	};

	// Iterate over lineSeparatorList
	for (const item of lineSeparatorList) {
		const index = text.indexOf(item);
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
	if (a === null) a = '';
	if (b === null) b = '';
	return a + b;
}

module.exports = {
	getLineSeparatorPosition,
	getLineAndRest,
	hasLineSeparator,
	concat,
};
