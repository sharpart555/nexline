/**
 * Stream Reader
 * @param param
 * @param param.input
 */
function create(param) {
	const rStream = param.input;
	let isFinished = false;

	/**
	 * Prepare stream to read
	 */
	async function prepareStream() {
		return new Promise((resolve, reject) => {
			rStream.once('readable', _handleReadable);
			rStream.once('end', _handleEnd);
			rStream.once('error', _handleError);

			function _handleReadable() {
				rStream.removeListener('end', _handleEnd);
				rStream.removeListener('error', _handleError);
				resolve(true);
			}

			function _handleEnd() {
				rStream.removeListener('readable', _handleReadable);
				rStream.removeListener('error', _handleError);
				resolve(false);
			}

			function _handleError(error) {
				rStream.removeListener('readable', _handleReadable);
				rStream.removeListener('end', _handleEnd);
				reject(error);
			}
		});
	}

	/**
	 * Read stream
	 */
	async function read() {
		if (isFinished) return null;

		const readBuffer = rStream.read();
		if (readBuffer === null) {
			const prepareStatus = await prepareStream();
			if (prepareStatus === false) isFinished = true;

			return read();
		}

		return readBuffer;
	}

	return {
		read,
	};
}

module.exports = {
	create,
};