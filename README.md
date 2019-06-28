# Nexline
Reading stream or string line by line 
* Lightweight
* Small memory foot print

## Why I made this?
Node.js's default readline module is great but it's `pause()` method does not work immediately.

I made some wrapper to fix that issue before, but it was not enough.

Even if it works immediately, it is still inconvenient.

If I execute async function over line by line, I need to using `pause()` and `resume()` at every line 

I wanted better way to do that.

## Install with npm
Required Node.js version >= 8.0.0.
```
npm install nexline
```
 
## Usage
```js
const nexline = require('nexline');

async function main () {
	const inputStream = fs.createReadStream(path_to_file);
	const nl = nexline({
		input: inputStream, // input can be either string and readable stream
		lineSeparator: ['\n', '\r\n'], // You can use multiple lineSeparator 
		encoding: 'utf8', // See encodings supported by iconv-lite 
	});
	
	while(true) {
		const line = await nl.next();
		if (line === null) break; // If all data is read, returns null
		console.log(line);
	}
}
```

## Methods
| Name          |  Description    |
| ------------- | --------------- |
| next()        | **async**, It returns line until all data is read. If all data is read, returns `null`  |

## Options
| Name          | Default                     |  Description    |
| ------------- | --------------------------- | --------------- |
| input         | undefined                   | **Required**, Readable stream or string    |
| lineSeparator | \['\n', '\r\n'\]            | Any string more than one character. You can use multiple line seperator |
| encoding      | 'utf8'                      | [See encodings supported by iconv-lite](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings) |