/**
 * Import
 */
const iconv = require('iconv-lite');

const code = require('./code/code');
const commonUtil = require('./util/commonUtil');

/**
 * Variables
 */
const { INPUT_STATUS, INPUT_TYPE } = code;

/**
 * Create nexline
 * @param param
 * @param param.input string or buffer or Readable stream
 * @param [param.lineSeparator] if not specified, auto detect crlf and lf
 * @param [param.encoding] input stream encoding using iconv-lite
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
	if (inputType === undefined) throw new Error('Invalid input. Input must be readable stream or string or buffer');

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

	/**
	 * Variables
	 */
	const nextQueue = [];
	let inputStatus = inputType === INPUT_TYPE.STREAM ? INPUT_STATUS.BEFORE_READY : INPUT_STATUS.READY;
	let isBusy = false;
	let isFinished = false;
	let internalBuffer = Buffer.alloc(0);

	/**
	 * Get next line
	 */
	async function next() {
		return new Promise((resolve, reject) => {
			nextQueue.push({ resolve, reject });
			if (!isBusy) processNextQueue();
		});
	}

	/**
	 * Process nextQueue
	 */
	async function processNextQueue() {
		// Set isBusy flag
		isBusy = true;

		// Get nextQueue item
		const item = nextQueue.shift();

		// If finished, always return null
		if (isFinished) {
			item.resolve(null);
			return;
		}

		// Prepare stream
		if (inputType === INPUT_TYPE.STREAM && inputStatus === INPUT_STATUS.BEFORE_READY) {
			await prepareStream();
		}

		// If bufferString contains lineSeparator
		if (internalBuffer !== null) {
			const lineInfo = commonUtil.getLineInfo(internalBuffer, lineSeparatorList);
			if (commonUtil.hasLineSeparatorSafe(lineInfo, maxLineSeparatorLength)) {
				item.resolve(iconv.decode(lineInfo.line, encoding));
				internalBuffer = lineInfo.rest;

				// If nextQueue is not empty. continue processing
				if (nextQueue.length) process.nextTick(processNextQueue);
				else isBusy = false;
				return;
			}
		}

		// Read more string from stream
		const moreBuffer = await readInput();
		internalBuffer = commonUtil.concatBuffer(internalBuffer, moreBuffer);

		// Get lineInfo
		const lineInfo = commonUtil.getLineInfo(internalBuffer, lineSeparatorList);

		// Resolve
		item.resolve(iconv.decode(lineInfo.line, encoding));
		internalBuffer = lineInfo.rest;

		// Check finished
		if (internalBuffer === null && inputStatus === INPUT_STATUS.END) isFinished = true;

		// If nextQueue is not empty. continue processing
		if (nextQueue.length) process.nextTick(processNextQueue);
		else isBusy = false;
	}

	/**
	 * Prepare stream ready to read
	 */
	async function prepareStream() {
		return new Promise((resolve, reject) => {
			input.once('readable', _handleReadable);
			input.once('end', _handleEnd);
			input.once('error', _handleError);

			function _handleReadable() {
				inputStatus = INPUT_STATUS.READY;
				input.off('end', _handleEnd);
				input.off('error', _handleError);
				resolve(true);
			}

			function _handleEnd() {
				inputStatus = INPUT_STATUS.END;
				input.off('readable', _handleReadable);
				input.off('error', _handleError);
				resolve(false);
			}

			function _handleError(error) {
				inputStatus = INPUT_STATUS.END;
				input.off('readable', _handleReadable);
				input.off('end', _handleEnd);
				reject(error);
			}
		});
	}

	/**
	 * Read data from input
	 */
	async function readInput() {
		if (inputStatus === INPUT_STATUS.END) return null;

		if (inputType === INPUT_TYPE.STRING) {
			// If input is string, return string at first, return null at second
			inputStatus = INPUT_STATUS.END;
			return input;
		} else if (inputType === INPUT_TYPE.BUFFER) {
			// If input is buffer, return decoded string at first, return null at second
			inputStatus = INPUT_STATUS.END;
			return iconv.decode(input, encoding);
		} else {
			// If input is stream
			let result = null;
			while (true) {
				if (inputStatus === INPUT_STATUS.END) {
					return result;
				}

				// Try to get chunkBuffer
				const chunkBuffer = input.read();
				if (chunkBuffer === null) {
					await prepareStream();
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
