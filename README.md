# Nexline
[![npm](https://img.shields.io/npm/v/nexline.svg)](https://www.npmjs.com/package/nexline)
[![npm](https://img.shields.io/node/v/nexline.svg)](https://www.npmjs.com/package/nexline)
[![npm](https://img.shields.io/npm/dt/nexline.svg)](https://www.npmjs.com/package/nexline)
[![GitHub license](https://img.shields.io/github/license/sharpart555/nexline.svg)](https://github.com/sharpart555/nexline/blob/master/LICENSE)


Reading stream, string, buffer line by line.\
Great for execute async job over line by line in large file.

* Lightweight
* Handle large file with small memory foot print
* Support various encodings
* Support custom line separators
* Support multiple line separators

## Why I made this?
Node.js's default readline module is great but it's `pause()` method does not work immediately.\
I made some wrapper to fix that issue before, but it was not enough.\
Even if `pause()` works immediately, it is still inconvenient.\
If I want to execute async function over line by line, I have to call `pause()` and `resume()` at every line\ 
I needed better way to do that.

## Install with npm
Required Node.js version >= 8.0.0.
```
npm install nexline
```
 
## How to use
### Basic Usage
```js
const nexline = require('nexline');
const fs = require('fs');

async function main () {
  const nl = nexline({
    input: fs.createReadStream(path_to_file), // input can be stream, string and buffer 
  });
  
  while(true) {
    const line = await nl.next();
    console.log(line);
    if (line === null) break; // If all data is read, returns null
  }
}
```

### Use string in input
```js
const nl = nexline({
  input: '123\n456\r\n789', 
});
```

### Use Buffer in input
```js
const nl = nexline({
  input: Buffer.from('123\n456\r\n789'),
});
```

### Use other encodings
[See encodings supported by iconv-lite](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings)
```js
const nl = nexline({
  input: fs.createReadStream(path_to_file), 
  encoding: 'cp949',
});
```

### Use other lineSeparator
```js
const nl = nexline({
  input: '123;456;789', 
  lineSeparator: ';',
});
```

### Use multiple lineSeparator
```js
const nl = nexline({
  input: '123;456\n789', 
  lineSeparator: [';', '\n'],
});
```

## Methods
| Name          |  Description    |
| ------------- | --------------- |
| next()        | **async**, It returns line until all data is read. If all data is read, returns `null`  |

## Options
| Name          | Default                     |  Description    |
| ------------- | --------------------------- | --------------- |
| input         | undefined                   | **Required.** Readable stream, string, buffer |
| lineSeparator | \['\n', '\r\n'\]            | Any string more than one character. You can use multiple line separator |
| encoding      | 'utf8'                      | [See encodings supported by iconv-lite](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings) |