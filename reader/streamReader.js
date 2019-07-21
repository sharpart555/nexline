/**
 * Stream Reader
 * @param param
 * @param param.input
 * @param param.readSize
 * @param param.readTimeout
 */
function create(param) {
	const param2 = {
		readTimeout: 15000,
		...param,
	};
	const { input, readTimeout } = param2;
	let isFinished = false;

	/**
	 * Prepare stream to read
	 */
	async function prepareStream() {
		return new Promise((resolve, reject) => {
			input.once('readable', _handleReadable);
			input.once('end', _handleEnd);
			input.once('error', _handleError);

			// If it takes too long...
			if (readTimeout < Infinity) {
				setTimeout(() => {
					input.removeListener('readable', _handleReadable);
					input.removeListener('end', _handleEnd);
					input.removeListener('error', _handleError);
					reject(new Error('Stream read timeout!'));
				}, readTimeout);
			}

			function _handleReadable() {
				input.removeListener('end', _handleEnd);
				input.removeListener('error', _handleError);
				resolve(true);
			}

			function _handleEnd() {
				input.removeListener('readable', _handleReadable);
				input.removeListener('error', _handleError);
				resolve(false);
			}

			function _handleError(error) {
				input.removeListener('readable', _handleReadable);
				input.removeListener('end', _handleEnd);
				reject(error);
			}
		});
	}

	/**
	 * Read stream
	 */
	async function read() {
		if (isFinished) return null;

		const readBuffer = input.read();
		if (readBuffer === null) {
			const prepareStatus = await prepareStream();
			if (prepareStatus === false) isFinished = true;
			return read();
		} else {
			return readBuffer;
		}
	}

	return {
		read,
	};
}

module.exports = {
	create,
};
