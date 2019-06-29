/**
 * Import
 */
const stream = require('stream');
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
	/**
	 * Verify parameter
	 */
	const param2 = {
		lineSeparator: ['\n', '\r\n'],
		encoding: 'utf8',
		...param,
	};

	const { input, encoding } = param2;

	// Verify input
	let inputType;
	if (typeof input === 'string') inputType = INPUT_TYPE.STRING;
	else if (input instanceof stream.Readable) inputType = INPUT_TYPE.STREAM;
	else if (Buffer.isBuffer(input)) inputType = INPUT_TYPE.BUFFER;

	if (inputType === undefined) throw new Error('Invalid input. Input must be readable stream or string or buffer');

	// Verify lineSeparator
	const lineSeparatorList = Array.isArray(param2.lineSeparator) ? [...param2.lineSeparator] : [param2.lineSeparator];
	if (lineSeparatorList.length === 0) throw new Error('Invalid lineSeparator');
	for (const item of lineSeparatorList) {
		if (typeof item !== 'string' || item.length === 0) throw new Error('Invalid lineSeparator, lineSeparator must be string and must exceed one character');
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
	let bufferString = '';

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
		if (bufferString !== null) {
			const lineInfo = commonUtil.getLineAndRest(bufferString, lineSeparatorList);
			if (lineInfo.rest !== null) {
				item.resolve(lineInfo.line);
				bufferString = lineInfo.rest;

				// If nextQueue is not empty. continue processing
				if (nextQueue.length) process.nextTick(processNextQueue);
				else isBusy = false;
				return;
			}
		}

		// Read more string from stream
		const moreString = await readInput();

		// Concat to bufferString
		bufferString = commonUtil.concat(bufferString, moreString);

		// Get lineInfo
		const lineInfo = commonUtil.getLineAndRest(bufferString, lineSeparatorList);
		item.resolve(lineInfo.line);
		bufferString = lineInfo.rest;

		// Check finished
		if (bufferString === null && inputStatus === INPUT_STATUS.END) isFinished = true;

		// If nextQueue is not empty. continue processing
		if (nextQueue.length) process.nextTick(processNextQueue);
		else isBusy = false;
	}

	/**
	 * Prepare stream ready to read
	 */
	async function prepareStream() {
		return new Promise((resolve) => {
			input.once('readable', () => {
				inputStatus = INPUT_STATUS.READY;
				resolve(true);
			});

			input.once('end', (data) => {
				inputStatus = INPUT_STATUS.END;
				resolve(false);
			});

			input.once('error', (error) => {
				inputStatus = INPUT_STATUS.END;
				reject(error);
			});
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
				if (inputStatus === INPUT_STATUS.END) return result;

				const chunkBuffer = input.read();
				if (chunkBuffer === null) {
					await prepareStream();
				} else {
					const chunkText = iconv.decode(chunkBuffer, encoding);
					result = commonUtil.concat(result, chunkText);
					if (commonUtil.hasLineSeparator(chunkText, lineSeparatorList)) return result;
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
