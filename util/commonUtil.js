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

module.exports = {
	sanitizeNumber,
	sanitizeEnum,
};
