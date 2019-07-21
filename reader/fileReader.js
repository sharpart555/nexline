/**
 * Import
 */
const fs = require('fs-extra');

/**
 * File Reader
 * @param param
 * @param param.input
 * @param param.readSize
 * @param param.reverse
 */
function create(param) {
	const param2 = {
		readSize: 65536,
		reverse: false,
		...param,
	};

	const { input, reverse } = param2;

	/**
	 * Variable
	 */
	let isFinished = false;
	let fileSize;
	let offset = 0;

	/**
	 * Read stream
	 */
	async function read() {
		if (isFinished) return null;

		// Get file size at first run
		if (fileSize === undefined) {
			const fileStat = await fs.fstat(input);
			fileSize = fileStat.size;
		}

		const readSize = Math.min(param2.readSize, fileSize - offset);
		const readBuffer = Buffer.allocUnsafe(readSize);

		if (reverse) {
			await fs.read(input, readBuffer, 0, readSize, fileSize - offset - readSize);
		} else {
			await fs.read(input, readBuffer, 0, readSize, offset);
		}

		offset = offset + readSize;
		if (offset >= fileSize) isFinished = true;

		return readBuffer;
	}

	return {
		read,
	};
}

module.exports = {
	create,
};
