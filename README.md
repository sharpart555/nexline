# Nextline
Reading stream or string line by line 

## Why I made this?
Node.js's default readline module is great but it's pause() method does not work immediately.

Even if it works immediately, it is still inconvenient.

If I execute async function over line by line, I need to using `pause()` and `resume()` at every line 

I wanted better way to do that.

## Install with npm
```
npm install nextline
```
 
## Usage
```js
const nextline = require('nextline');

async function main () {
	const inputStream = fs.createReadStream(path_to_file);
	const nl = nextline({
		input: inputStream, // input can be either string and readable stream
		encoding: 'utf8', // See encodings supported by iconv-lite 
	});
	
	while(true) {
		const line = await nl.next();
		if (line === null) break; // If all data is read, returns null
		console.log(line);
	}
}
```

## Options
| Name          | Default                     |  Description    |
| ------------- | --------------------------- | --------------- |
| input         | undefined                   | **Required**, Readable stream or string    |
| lineSeperator | \['\n', '\r\n'\]            | Any string more than one character. You can use multiple line seperator |
| encoding      | 'utf8'                      | [See encodings supported by iconv-lite](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings) |