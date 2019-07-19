/**
 * Buffer Reader
 * @param input
 */
function create(input) {
	let isFinished = false;

	/**
	 * Read stream
	 */
	async function read() {
		if (isFinished) return null;
		isFinished = true;
		return Buffer.isBuffer(input) ? input : Buffer.from(input);
	}

	return {
		read,
	};
}

module.exports = {
	create,
};
