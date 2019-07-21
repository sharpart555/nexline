# Nexline
[![npm](https://img.shields.io/npm/v/nexline.svg)](https://www.npmjs.com/package/nexline)
[![npm](https://img.shields.io/node/v/nexline.svg)](https://www.npmjs.com/package/nexline)
[![npm](https://img.shields.io/npm/dt/nexline.svg)](https://www.npmjs.com/package/nexline)
[![GitHub license](https://img.shields.io/github/license/sharpart555/nexline.svg)](https://github.com/sharpart555/nexline/blob/master/LICENSE)
[![CircleCI](https://circleci.com/gh/sharpart555/nexline.svg?style=svg)](https://circleci.com/gh/sharpart555/nexline)


Reading file, string, buffer line by line.\
Great for execute async job over line by line in large file.

* Lightweight
* Handle large file with small memory footprint
* Support various encodings
* Support custom line separators
* Support multiple line separators
* Support multiple inputs
* Support reverse mode 

## Why I made this?
Node.js's default readline module is great but it's `pause()` method does not work immediately.\
I made wrapper to fix that issue before, but it was not enough.\
Even if `pause()` works immediately, it is still inconvenient.\
If I want to execute async function over line by line in large file, I have to call `pause()` and `resume()` at every line.\
I needed better way to do that without putting them all in memory.

## Breaking changes in 1.0.0
* Support reverse mode.
* Support file descriptor as input
* Change line separator default value from `['\n', '\r\n']` to `'\n'` for performance
  * Still support both CRLF and LF, just set `lineSeparator: ['\n', '\r\n']`
* Optimize performance and memory usage

## Install with npm
Required Node.js version >= 8.0.0.
```
npm install nexline
```
 
## How to use
### Use file as input
```js
const nexline = require('nexline');
const fs = require('fs');

async function main () {
  const nl = nexline({
    input: fs.openSync(path_to_file, 'r'), // input can be file, stream, string and buffer 
  });
  
  while(true) {
    const line = await nl.next();
    console.log(line);
    if (line === null) break; // If all data is read, returns null
  }
}

```
### Use stream as input
```js
const nl = nexline({
  input: fs.createReadStream(path_to_file),
});
```

### Use string as input
```js
const nl = nexline({
  input: 'foo\nbar\nbaz',
});
```

### Use buffer as input
```js
const nl = nexline({
  input: Buffer.from('foo\nbar\nbaz'),
});
```

### Use multiple input
```js
const nl = nexline({
  input: [
    fs.openSync(path_to_file1, 'r'),
    fs.createReadStream(path_to_file2),
    'foo\nbar\nbaz',
    Buffer.from('foo\nbar\nbaz'),
  ],
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
  input: 'foo;bar;baz', 
  lineSeparator: ';',
});
```

### Use multiple lineSeparator
```js
const nl = nexline({
  input: 'foo\r\nbar\nbaz', 
  lineSeparator: ['\n', '\r\n'], // You can support both LF and CRLF like this.
});
```

### Reverse mode
```js
const nl = nexline({
  input: fs.openSync(path_to_file, 'r'), // NOTE: You cannot use stream in reverse mode. 
  reverse: true, 
});
```

## Methods
| Name          |  Description    |
| ------------- | --------------- |
| next()        | **async**, It returns line until all data is read, after then returns `null`  |

## Options
| Name          | Default                     |  Description    |
| ------------- | --------------------------- | --------------- |
| input         | undefined                   | **Required.** File descriptor, stream, string, buffer, You can provide multiple inputs using array |
| lineSeparator | '\n'                         | Any string more than one character. You can provide multiple line separator using array |
| encoding      | 'utf8'                      | [See encodings supported by iconv-lite](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings) |
| reverse       | false                       | Reverse mode, **Cannot use this option with stream input** because stream cannot be read from end |

## Contribution
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/sharpart555/nexline/issues/new)

## License
Copyright &copy; 2019 Youngho Jin. Released under the [MIT License](https://github.com/sharpart555/nexline/blob/master/LICENSE)
