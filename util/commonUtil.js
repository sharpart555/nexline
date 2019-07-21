/**
 * Import
 */
const stream = require('stream');
const { INPUT_TYPE } = require('../code/code');

/**
 * Convert to Array
 * @param input
 * @param keepUndefined
 */
function toArray(input, keepUndefined) {
	if (keepUndefined && input === undefined) return;

	if (Array.isArray(input)) return input;
	else if (input === undefined) return [];
	else return [input];
}

/**
 * Check and return inputType
 * @param input
 */
function getInputType(input) {
	if (typeof input === 'string') return INPUT_TYPE.STRING;
	else if (input instanceof stream.Readable) return INPUT_TYPE.STREAM;
	else if (Buffer.isBuffer(input)) return INPUT_TYPE.BUFFER;
	else if (typeof input === 'number') return INPUT_TYPE.FILE_DESCRIPTOR;
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

/**
 * Find index from array of buffer
 * @param param
 * @param param.bufferList
 * @param param.needleList
 * @param [param.reverse]
 * @param [param.partial]
 */
function findIndexFromBuffer(param) {
	const param2 = {
		bufferList: [],
		needleList: [],
		reverse: false,
		partial: false,
		...param,
	};
	const { bufferList, needleList, reverse, partial } = param2;
	const result = { index: -1, size: 0, partial: false };

	// Iterate over needleList
	for (const needle of needleList) {
		const indexInfo = _findOne({ bufferList, needle, reverse, partial });

		if (reverse) {
			// Find largest index + size. If same, choose large size one.
			if (
				result.index === -1 || //
				result.index + result.size < indexInfo.index + indexInfo.size ||
				(result.index + result.size === indexInfo.index + indexInfo.size && result.size < indexInfo.size) ||
				(result.index + result.size === indexInfo.index + indexInfo.size && result.size === indexInfo.size && result.partial === false && indexInfo.partial === true)
			) {
				result.index = indexInfo.index;
				result.size = indexInfo.size;
				result.partial = !!indexInfo.partial;
			}
		} else {
			// Find smallest index, if same, choose large size one.
			if (
				result.index === -1 || //
				(result.index > indexInfo.index && indexInfo.index !== -1) ||
				(result.index === indexInfo.index && result.size < indexInfo.size) ||
				(result.index === indexInfo.index && result.size === indexInfo.size && result.partial === false && indexInfo.partial === true)
			) {
				result.index = indexInfo.index;
				result.size = indexInfo.size;
				result.partial = !!indexInfo.partial;
			}
		}
	}

	return result;

	/**
	 * Find index for one needle
	 * @param param
	 * @param param.bufferList
	 * @param param.needle
	 * @param [param.reverse]
	 * @param [param.partial]
	 * @private
	 */
	function _findOne(param) {
		const { bufferList, needle, reverse, partial } = param;

		let totalBufferLength = 0;
		for (const buffer of bufferList) totalBufferLength += buffer.length;

		let baseIndex = 0;
		let index = -1;
		let size = 0;

		for (let i = 0; i < bufferList.length; i++) {
			const bufIdx = reverse ? bufferList.length - 1 - i : i;
			const buffer = bufferList[bufIdx];

			for (let j = 0; j < buffer.length; j++) {
				const byteIdx = reverse ? buffer.length - 1 - j : j;
				const needleIdx = reverse ? needle.length - 1 - size : size;

				const bufferByte = buffer[byteIdx];
				const needleByte = needle[needleIdx];

				if (bufferByte === needleByte) {
					if (size === 0) index = baseIndex + j;
					size++;
					if (size >= needle.length) {
						const result = reverse ? { index: totalBufferLength - index - size, size } : { index, size };
						if (partial && result.size !== needle.length) result.partial = true;
						return result;
					}
				} else {
					index = -1;
					size = 0;
				}
			}
			baseIndex += buffer.length;
		}

		if (!partial) {
			return { index: -1, size: 0 };
		}

		const result = reverse && index !== -1 ? { index: totalBufferLength - index - size, size } : { index, size };
		if (partial && result.size !== needle.length) result.partial = true;
		return result;
	}
}

/**
 * Split bufferList using indexInfo
 * @param param
 * @param param.bufferList
 * @param param.indexInfo
 */
function splitBufferList(param) {
	const { bufferList, indexInfo } = param;
	const result = { before: [], after: [] };

	if (indexInfo.index === -1) {
		return { before: bufferList, after: [] };
	}

	// Iterate over bufferList
	let baseIndex = 0;
	for (const buffer of bufferList) {
		if (baseIndex + buffer.length <= indexInfo.index) {
			result.before.push(buffer);
		} else if (baseIndex >= indexInfo.index + indexInfo.size) {
			result.after.push(buffer);
		} else {
			const beforeBufferStart = 0;
			const beforeBufferEnd = indexInfo.index - baseIndex;
			const beforeBufferSize = beforeBufferEnd - beforeBufferStart;
			if (beforeBufferSize > 0) {
				result.before.push(buffer.slice(beforeBufferStart, beforeBufferEnd));
			}

			const afterBufferStart = indexInfo.index + indexInfo.size - baseIndex;
			const afterBufferEnd = buffer.length;
			const afterBufferSize = afterBufferEnd - afterBufferStart;
			if (afterBufferSize > 0) {
				result.after.push(buffer.slice(afterBufferStart, afterBufferEnd));
			}
		}

		baseIndex += buffer.length;
	}

	return result;
}

/**
 * Split bufferList to line and Rest
 * @param param
 * @param param.bufferList
 * @param param.lineSeparatorList
 * @param [param.reverse]
 */
function parseLine(param) {
	const { bufferList, lineSeparatorList, reverse } = param;

	// Find line separator
	const indexInfo = findIndexFromBuffer({
		bufferList,
		needleList: lineSeparatorList,
		reverse,
	});

	// If line separator not found
	if (indexInfo.index === -1) return { line: bufferList, rest: [] };

	// Get one line
	const splitedBuffer = splitBufferList({
		bufferList,
		indexInfo,
	});

	// Get result
	const result = reverse ? { line: splitedBuffer.after, rest: splitedBuffer.before } : { line: splitedBuffer.before, rest: splitedBuffer.after };

	// If line separator found and result.rest is empty, put zero size buffer to result.rest
	if (result.rest.length === 0) result.rest.push(Buffer.alloc(0));

	return result;
}

module.exports = {
	toArray,
	getInputType,
	removeUndefined,
	findIndexFromBuffer,
	splitBufferList,
	parseLine,
};
