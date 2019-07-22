/**
 * Import
 */
const iconv = require('iconv-lite');
const fs = require('fs-extra');

const code = require('./code/code');
const reader = require('./reader');
const commonUtil = require('./util/commonUtil');
const taskQueueUtil = require('./util/taskQueueUtil');

/**
 * Variables
 */
const { INPUT_TYPE } = code;

/**
 * Create nexline
 * @param param
 * @param param.input string, buffer, readable stream, file descriptor
 * @param [param.lineSeparator]
 * @param [param.encoding] input stream encoding using iconv-lite
 * @param [param.reverse] starting from last line
 * @param [param.autoCloseFile] close file descriptor automatically
 */
function nexline(param) {
	const param2 = {
		lineSeparator: '\n',
		encoding: 'utf8',
		reverse: false,
		autoCloseFile: false,
		...param,
	};

	/**
	 * Verify parameters
	 */
	const { input, encoding, reverse, autoCloseFile } = param2;

	// Verify input
	const inputType = commonUtil.getInputType(input);
	if (inputType === undefined) throw new Error('Invalid input. Input must be one of these: string, buffer, readable stream, file descriptor');

	// Verify lineSeparator
	const lineSeparatorStringList = commonUtil.toArray(param2.lineSeparator);
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
	if (reverse && inputType === INPUT_TYPE.STREAM) throw new Error('Stream cannot be read reversely. use other input like file descriptor');

	/**
	 * Variables
	 */
	const tq = taskQueueUtil.create();
	const inputReader = reader.create({ input, reverse });
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

					const outputBuffer = lineInfo.line.length === 1 ? lineInfo.line[0] : Buffer.concat(lineInfo.line);
					return iconv.decode(outputBuffer, encoding);
				}
			}

			// Read data from input until line separator is found or end of input reached
			await _readInput();

			// Parse line
			const lineInfo = commonUtil.parseLine({ bufferList: readBufferList, lineSeparatorList, reverse });
			if (lineInfo.rest.length === 0) close();

			readBufferList = lineInfo.rest;
			const outputBuffer = lineInfo.line.length === 1 ? lineInfo.line[0] : Buffer.concat(lineInfo.line);

			return iconv.decode(outputBuffer, encoding);
		});
	}

	/**
	 * Close nexline
	 */
	function close() {
		isFinished = true;
		if (autoCloseFile && inputType === INPUT_TYPE.FILE_DESCRIPTOR) fs.close(input);
	}

	/**
	 * Read data from input until line separator is found or end of input reached
	 * @private
	 */
	async function _readInput() {
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
		close,
	};
}

/**
 * Export
 */
module.exports = nexline;
