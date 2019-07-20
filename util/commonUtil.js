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
	else if (typeof input === 'number') return INPUT_TYPE.FILE_DESCRIPTOR;
}

/**
 * Get lineSeparator index from buffer
 * @param buffer
 * @param lineSeparatorList
 */
function getLineSeparatorPosition(buffer, lineSeparatorList) {
	const result = {
		index: -1,
		length: 0,
		lineSeparator: null,
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
			result.lineSeparator = item;
		}
	}

	return result;
}

/**
 * Get one line from buffer
 * @param buffer
 * @param lineSeparatorList
 */
function getLineInfo(buffer, lineSeparatorList) {
	const position = getLineSeparatorPosition(buffer, lineSeparatorList);

	if (position.index === -1) {
		// If line separator not found
		return {
			line: buffer,
			rest: null,
			lineSeparator: null,
		};
	} else {
		// If line separator found
		return {
			line: buffer.slice(0, position.index),
			rest: buffer.slice(position.index + position.length),
			lineSeparator: position.lineSeparator,
		};
	}
}

/**
 * Make sure lineSeparator position is not changed even if more buffer appended
 * @param lineInfo
 * @param maxLineSeparatorLength
 */
function hasLineSeparatorSafe(lineInfo, maxLineSeparatorLength) {
	return lineInfo.rest !== null && lineInfo.rest.length >= maxLineSeparatorLength;
}

/**
 * Concatenate buffer with special null treatment
 * @param a
 * @param b
 */
function concatBuffer(a, b) {
	if (a === null && b === null) return null;

	const bufferA = a === null ? Buffer.alloc(0) : a;
	const bufferB = b === null ? Buffer.alloc(0) : b;

	return Buffer.concat([bufferA, bufferB]);
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
	for (const needle of param2.needleList) {
		const indexInfo = _findOne({ bufferList, needle, reverse, partial });

		if (
			result.index === -1 || //
			result.index > indexInfo.index ||
			(result.index === indexInfo.index && result.size < indexInfo.size)
		) {
			result.index = indexInfo.index;
			result.size = indexInfo.size;
			result.partial = indexInfo.size !== needle.length;
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
						return reverse ? { index: totalBufferLength - index - size, size } : { index, size };
					}
				} else {
					index = -1;
					size = 0;
				}
			}
			baseIndex += buffer.length;
		}

		if (!partial) return { index: -1, size: 0 };
		else return reverse && index !== -1 ? { index: totalBufferLength - index - size, size } : { index, size };
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
				const beforeBuffer = Buffer.allocUnsafe(beforeBufferSize);
				buffer.copy(beforeBuffer, 0, beforeBufferStart, beforeBufferEnd);
				result.before.push(beforeBuffer);
			}

			const afterBufferStart = indexInfo.index + indexInfo.size - baseIndex;
			const afterBufferEnd = buffer.length;
			const afterBufferSize = afterBufferEnd - afterBufferStart;
			if (afterBufferSize > 0) {
				const afterBuffer = Buffer.allocUnsafe(afterBufferSize);
				buffer.copy(afterBuffer, 0, afterBufferStart, afterBufferEnd);
				result.after.push(afterBuffer);
			}
		}

		baseIndex += buffer.length;
	}

	return result;
}

module.exports = {
	getInputType,
	getLineSeparatorPosition,
	getLineInfo,
	hasLineSeparatorSafe,
	concatBuffer,
	removeUndefined,
	findIndexFromBuffer,
	splitBufferList,
};
