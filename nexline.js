/**
 * Import
 */
const iconv = require('iconv-lite');

const code = require('./code/code');
const reader = require('./reader');
const commonUtil = require('./util/commonUtil');
const taskQueueUtil = require('./util/taskQueueUtil');

/**
 * Variables
 */
const { INPUT_STATUS, INPUT_TYPE } = code;

/**
 * Create nexline
 * @param param
 * @param param.input string, buffer, readable stream, file descriptor
 * @param [param.lineSeparator] if not specified, auto detect crlf and lf
 * @param [param.encoding] input stream encoding using iconv-lite
 * @param [param.reverse] starting from last line
 */
function nexline(param) {
	const param2 = {
		lineSeparator: ['\n', '\r\n'],
		encoding: 'utf8',
		...param,
	};

	/**
	 * Verify parameters
	 */
	const { input, encoding } = param2;

	// Verify input
	const inputType = commonUtil.getInputType(input);
	if (inputType === undefined) throw new Error('Invalid input. Input must be one of these: string, buffer, readable stream, file descriptor');

	// Verify lineSeparator
	const lineSeparatorStringList = Array.isArray(param2.lineSeparator) ? [...param2.lineSeparator] : [param2.lineSeparator];
	if (lineSeparatorStringList.length === 0) throw new Error('Invalid lineSeparator');

	//Convert lineSeparator to buffer
	const lineSeparatorList = [];
	let maxLineSeparatorLength = 0;
	for (const item of lineSeparatorStringList) {
		if (typeof item !== 'string' || item.length === 0) throw new Error('Invalid lineSeparator, lineSeparator must be string and must exceed one character');

		const buffer = iconv.encode(item, encoding);
		maxLineSeparatorLength = Math.max(maxLineSeparatorLength, buffer.length);
		lineSeparatorList.push(buffer);
	}

	// Verify encoding
	if (!iconv.encodingExists(encoding)) throw new Error('Invalid encoding. Check encodings supported by iconv-lite');

	// Verify option
	if (param2.reverse && inputType === INPUT_TYPE.STREAM) throw new Error('Stream cannot be read reversely');

	/**
	 * Variables
	 */
	const tq = taskQueueUtil.create();
	let inputStatus = inputType === INPUT_TYPE.STREAM ? INPUT_STATUS.BEFORE_READY : INPUT_STATUS.READY;
	let isFinished = false;
	let internalBuffer = Buffer.alloc(0);

	const inputReader = reader.create(input);

	/**
	 * Get next line
	 */
	async function next() {
		return tq.exec(async () => {
			// If finished, always return null
			if (isFinished) {
				return null;
			}

			// If bufferString contains lineSeparator
			if (internalBuffer !== null) {
				const lineInfo = commonUtil.getLineInfo(internalBuffer, lineSeparatorList);
				if (commonUtil.hasLineSeparatorSafe(lineInfo, maxLineSeparatorLength)) {
					internalBuffer = lineInfo.rest;
					return iconv.decode(lineInfo.line, encoding);
				}
			}

			// Read more string from stream
			const moreBuffer = await readInput();
			internalBuffer = commonUtil.concatBuffer(internalBuffer, moreBuffer);

			// Get lineInfo
			const lineInfo = commonUtil.getLineInfo(internalBuffer, lineSeparatorList);

			// Check finished
			internalBuffer = lineInfo.rest;
			if (internalBuffer === null && inputStatus === INPUT_STATUS.END) isFinished = true;

			return iconv.decode(lineInfo.line, encoding);
		});
	}

	/**
	 * Read data from input until line separator is found or end of input reached
	 */
	async function readInput() {
		if (inputStatus === INPUT_STATUS.END) return null;

		if (inputType === INPUT_TYPE.STRING) {
			// If input is string, return string at first, return null at second
			inputStatus = INPUT_STATUS.END;
			return Buffer.from(input);
		} else if (inputType === INPUT_TYPE.BUFFER) {
			// If input is buffer, return decoded string at first, return null at second
			inputStatus = INPUT_STATUS.END;
			return input;
		} else {
			// If input is stream
			let result = null;
			while (true) {
				if (inputStatus === INPUT_STATUS.END) {
					return result;
				}

				// Try to get chunkBuffer
				const chunkBuffer = await inputReader.read();
				if (chunkBuffer === null) {
					inputStatus = INPUT_STATUS.END;
				} else {
					// Add chunkBuffer to result
					result = commonUtil.concatBuffer(result, chunkBuffer);

					// If lineSeparator is located in end of line, then load one more chunk
					const lineInfo = commonUtil.getLineInfo(result, lineSeparatorList);
					if (commonUtil.hasLineSeparatorSafe(lineInfo, maxLineSeparatorLength)) {
						return result;
					}
				}
			}
		}
	}

	/**
	 * Expose method
	 */
	return {
		next,
	};
}

/**
 * Export
 */
module.exports = nexline;
