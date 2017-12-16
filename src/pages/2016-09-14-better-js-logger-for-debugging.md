---
author: Christoph Michel
comments: true
date: 2016-09-14 15:40:11+00:00
disqus_identifier: 524 http://cmichel.io/?p=524
layout: Post
route: /better-js-logger-for-debugging/
slug: better-js-logger-for-debugging
title: Better JS Logger for Debugging
featured: /assets/2016/09/stacklogger-console-chrome.png
categories:
- Tech
---
As web developers we really like putting `console.log` all over the place when debugging our applications, although the Chrome dev tools come with an actual debugger that can be started by simply writing `debugger` in your code. This gets messy rather fast, especially if you simply log the objects without an accompanying message. What I like to do is prepend the message with the class and function name so I can easily filter the message I'm looking for.
It turns out you can actually automate that when using Chrome or Firefox and use colors on top!

![stacklogger console chrome](http://cmichel.io/assets/2016/09/stacklogger-console-chrome.png)

# Stacklogger
I created an [npm package called Stacklogger](https://www.npmjs.com/package/stacklogger) for everyone to use by running `npm install stacklogger --save`. You just import it, and call its own `log` function as you would with `console.log`. If you already have logging with `console.log` in place, just call its `hookConsoleLog` function and every `console.log` is redirected to _stacklogger_'s custom `log` function. Check the [npm readme](https://www.npmjs.com/package/stacklogger) if you want to use it, or see its source code on [GitHub](https://github.com/MrToph/stacklogger)
I included a small example that produces the above output in chrome:
```javascript
import log, { hookConsoleLog } from 'stacklogger'

class ExampleLog {
  constructor () {
    this.obj = {hello: 'world', anotherKey: [0, 1]}
    this.arr = [1, 3, 5, 7, 9]
  }
  hello () {
    log('Logging some text with log()', this.obj, this.arr)
  }
}

class ExampleConsoleLog {
  hello () {
    console.log('Called with console.log')
  }
}

let e1 = new ExampleLog()
let e2 = new ExampleConsoleLog()

e1.hello()
console.log('standard console.log without the hook')
hookConsoleLog()
console.log('console.log hooked now')
e2.hello()
```
## How does it work?
### Stack trace
Remember how when you throw an `Error` in JS, it prints the whole stack trace? What we do in the `log` function is to simply create a new `Error` object. Unfortunately, the stacktrace is not a well structured object, but just a string. The concrete stack trace string is even different for each JS engine, so I created two regex(es?) to parse them in Chrome's V8 engine and in Firefox. If you use Firefox be aware that it uses the file name as its class name as that's the only available information there.
![stacklogger console firefox](http://cmichel.io/assets/2016/09/stacklogger-console-firefox.png)

### Hooking console.log()
Redirecting the calls from `console.log` to `log` is really easy in JS as it allows you to just overwrite every property of objects. First we save a reference to the original `console.log` and then redefine `console.log`:
```javascript
const consoleLog = console.log.bind(console)
function log () {
  consoleLog('Hooked.', ...arguments)
}
function hookConsoleLog () {
  console.log = log
}

```

(Firefox is sad when a logging function doesn't run in the `console` context, so we `bind(console)` the reference.)

### Unique colors for each class
You can use **CSS properties** in the log to change the foreground/background color by simply passing them as an additional argument to `console.log`. It would also be nice if each class had its own color, so when looking for a specific debug message of a class, you only have to quickly look through the console's output and pattern match with that color. For this, I implemented a simple function to hash a string to an integer and use that hash as an index in a color array.

## Source Code in 27 lines
The [source code](https://github.com/MrToph/stacklogger/blob/master/source/index.js) of the whole stacklogger is really short:
```javascript
const consoleLog = console.log.bind(console)

const chromeRegex = new RegExp('^\\s*?at\\s*(\\S*?)\\s')
const firefoxRegex = new RegExp('^\\s*(\\S*?)@\\S*\\/(\\S*)\\.')
export default function log () {
  let stackframe = (new Error()).stack.split('\n')
  // try to match chrome first
  let match = chromeRegex.exec(stackframe[2])
  let callee = match ? match[1] : null
  if (!callee) { // try firefox
    match = firefoxRegex.exec(stackframe[1])
    callee = match ? `${match[2]}.${match[1]}` : ''
  }
  let className = callee.split('.')[0]
  // make a certain className always have the same background color by computing a hash on it
  let hash = getHashCode(className) % colors.length
  consoleLog(`%c${callee}`, `color: #000; background: ${colors[hash]}`, ...arguments)
}

const getHashCode = s => s.split('').reduce((prevHash, curChar) => prevHash * 31 + curChar.charCodeAt(0), 0)

export function hookConsoleLog () {
  console.log = log
}

// colors created by enumerating HSL color wheel from 0...360 in 30 degree steps, with luminosity 75 and 90
const colors = ['#ff8080', '#ffcccc', '#ffbf80', '#ffe6cc', '#ffff80', '#ffffcc', '#bfff80', '#e6ffcc', '#80ff80', '#ccffcc', '#80ffbf', '#ccffe6', '#80ffff', '#ccffff', '#80bfff', '#cce5ff', '#8080ff', '#ccccff', '#bf80ff', '#e5ccff', '#ff80ff', '#ffccff', '#ff80bf', '#ffcce6']
```

