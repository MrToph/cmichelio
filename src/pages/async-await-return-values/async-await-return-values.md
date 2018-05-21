---
title: Async / Await - Return values
featured: /async-await-return-values/async-await-return-values.png
date: 2018-05-21
categories:
- Tech
- Node
medium:
- Programming
- javascript
- Nodejs
- es6
- Development
steem:
- utopian-io
- steemdev
- javascript
- programming
- react
---

When reading `async / await` code you come across different styles of `return`ing a value in an `async` function.

Some just return the plain value:

```js
async function test1() {
  return 5
}
```

Others return a promise:

```js
async function test2() {
  return Promise.resolve(5);
}
```

While the third group don't just use and return a `Promise`, they `await` it:

```js
async function test3() {
  return await Promise.resolve(5);
}
```

So, you might wonder what the correct way to do this is, or if there even is a difference.
But there is no right way to do it, in fact the behavior is exactly the same in all three cases. The important thing is that **`async` functions always return a `Promise`**`.

> the return value of an async function is implicitly wrapped in Promise.resolve. - [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

So if you chain a `then` on the Promise of any of these functions (or `await` these functions if you want to use `async/await`), it will only be called once the (implicitly wrapped) Promise is `resolved`.

```js
const delayedLog = message =>
  new Promise(resolve =>
    setTimeout(() => {
      console.log(message);
      resolve(message);
    }, 1000)
  );

async function test1() {
  await delayedLog(1);
  return 1;
}

async function test2() {
  return delayedLog(2);
}

async function test3() {
  return await delayedLog(3);
}

test1().then(val => console.log("finished ", val));
test2().then(val => console.log("finished ", val));
test3().then(val => console.log("finished ", val));

// Output after 1 second:
// 1
// finished 1 
// 2
// finished 2 
// 3
// finished 3 
```

Without needing to understand [how exactly async / await is transpiled to ES5](https://cmichel.io/how-is-async-await-transpiled-to-es5), intuitively, the second example `test2`, returning a Promise instead of just the value, looks more like this after conversion:

```js
function test2() {
  return Promise.resolve(Promise.resolve(5));
}
```

However the inner `Promise` is automatically unwrapped, so in the end it again returns just a single `Promise` resolving to `5`.
**The way to use any of these functions is the same.**
