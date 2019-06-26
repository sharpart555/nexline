/**
 * Sanitize Number
 * @param param
 * @param param.value
 * @param param.default
 * @param [param.min]
 * @param [param.max]
 */
function sanitizeNumber(param) {
	let result = Number(param.value);
	if (Number.isNaN(result)) result = param.default;

	if (param.min !== undefined && result < param.min) result = param.min;
	else if (param.max !== undefined && result > param.max) result = param.max;

	return result;
}

/**
 * Sanitize ENUM
 * @param param
 * @param param.value
 * @param param.list
 * @param [param.default] if not provided, it returns first item in list
 */
function sanitizeEnum(param) {
	const { value, list } = param;
	if (list.indexOf(value) !== -1) return value;
	else if (param.default !== undefined) return param.default;
	else return list[0];
}

/**
 * Returns first line and rest from string
 * @param str
 * @param lineSeperator
 */
function getLineSeperatorPosition(str, lineSeperator) {
	const sep = (typeof lineSeperator === 'string') ? lineSeperator : '\n';
	const isAuto = lineSeperator === undefined;
	let index = str.indexOf(sep);
	let size = 0;

	// If line seperator found
	if (index !== -1) {
		// If crlf auto checking enabled
		if (isAuto && str.charAt(index-1) === '\r') {
			index -= 1;
			size = 2;
		} else {
			size = 1;
		}
	}

	return {
		index,
		size,
	};
}

/**
 * Parse string with linePosition
 * @param str
 * @param lineSeperatorPosition
 */
function parseWithLineSeperatorPosition(str, lineSeperatorPosition) {
	const { index, size } = lineSeperatorPosition;

	if (index === -1) {
		return {
			line: str,
			rest: '',
		};
	} else {
		return {
			line: str.slice(0, index),
			rest: str.slice(index+size),
		};
	}
}

module.exports = {
	sanitizeNumber,
	sanitizeEnum,
	getLineSeperatorPosition,
	parseWithLineSeperatorPosition,
};
