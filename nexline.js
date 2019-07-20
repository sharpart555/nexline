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
		reverse: false,
		...param,
	};

	/**
	 * Verify parameters
	 */
	const { input, encoding, reverse } = param2;

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
	if (reverse && inputType === INPUT_TYPE.STREAM) throw new Error('Stream cannot be read reversely');

	/**
	 * Variables
	 */
	const tq = taskQueueUtil.create();
	const inputReader = reader.create(input);
	let isFinished = false;
	let readBufferList = [];

	/**
	 * Get next line
	 */
	async function next() {
		return tq.exec(async () => {
			// If finished, always return null
			if (isFinished) {
				return null;
			}

			// Scan readBufferList
			if (readBufferList.length) {
				// Parse line
				const lineInfo = commonUtil.parseLine({ bufferList: readBufferList, lineSeparatorList, reverse });

				// Check if bufferString contains line separator
				if (lineInfo.rest.length) {
					readBufferList = lineInfo.rest;
					return iconv.decode(Buffer.concat(lineInfo.line), encoding);
				}
			}

			// Read data from input until line separator is found or end of input reached
			await readInput();

			// Parse line
			const lineInfo = commonUtil.parseLine({ bufferList: readBufferList, lineSeparatorList, reverse });

			if (lineInfo.rest.length === 0) isFinished = true;

			readBufferList = lineInfo.rest;
			return iconv.decode(Buffer.concat(lineInfo.line), encoding);
		});
	}

	/**
	 * Read data from input until line separator is found or end of input reached
	 */
	async function readInput() {
		while (true) {
			// Try to get chunkBuffer
			const readBuffer = await inputReader.read();
			if (readBuffer === null) {
				return;
			} else {
				// Add chunkBuffer to result
				if (reverse) readBufferList.unshift(readBuffer);
				else readBufferList.push(readBuffer);

				// If partial lineSeparator is found, load more buffer
				const indexInfo = commonUtil.findIndexFromBuffer({
					bufferList: readBufferList,
					needleList: lineSeparatorList,
					partial: true,
					reverse,
				});

				if (indexInfo.partial === false) return;
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
