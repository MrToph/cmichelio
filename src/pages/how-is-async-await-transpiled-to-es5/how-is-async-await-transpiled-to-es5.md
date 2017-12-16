---
author: Christoph Michel
comments: true
date: 2016-12-27
disqus_identifier: how-is-async-await-transpiled-to-es5
layout: Post
route: /how-is-async-await-transpiled-to-es5/
slug: how-is-async-await-transpiled-to-es5
title: How is async/await transpiled to ES5
featured: /how-is-async-await-transpiled-to-es5/how-is-async-await-transpiled.png
categories:
- Tech
---

In short, ES7's `async/await` syntax is used to turn asynchronous code flows with `Promises` into synchronous ones.
The proposal and examples can be seen [here](https://tc39.github.io/ecmascript-asyncawait/).

We will look at the implementation details of ES7's `async/await` to get a better understanding of it.
You can use [`babel-preset-stage-3`](https://babeljs.io/docs/plugins/preset-stage-3/) with its [transform-async-generator-functions plugin](https://babeljs.io/docs/plugins/transform-async-generator-functions/) to transpile the `async/await` syntax ES6's `generator` functions.
Then the `generators` are again transformed to ES5 functions with state, the process is described [in this blog post](http://cmichel.io/how-are-generators-transpiled-to-es5/).
All there is left to understand is how to reduce `async` functions to `generators`.

## async/await to generators
Suppose we have an `async` function - let's take the [example from the proposal](https://tc39.github.io/ecmascript-asyncawait/):

```javascript
async function chainAnimationsAsync(elem, animations) {
    let ret = null;
    try {
        for(const anim of animations) {
            ret = await anim(elem);
        }
    } catch(e) { /* ignore and keep going */ }
    return ret;
}
```

Rewriting it with generators requires the following high-level ideas:
1. Turn the `async` function into a generator function and make it return a `Promise`
2. Replace each `await` in the function's code with a `yield`

We accomplish the first goal by creating an iterator for the generator function
and iterating it until the function is finished or an error occurred.
We wrap this behavior into a function called `spawn`.

```javascript
function chainAnimationsGenerator(elem, animations) {
    // spawn will return a Promise
    return spawn(function*() {
        let ret = null;
        try {
            for(const anim of animations) {
                ret = yield anim(elem);
            }
        } catch(e) { /* ignore and keep going */ }
        return ret;
    });
}
```

In essence, the `spawn` function **wraps the result (coming from the generator's yield) into a promise and keeps iterating the generator in the promise's resolve callback (while passing the resolved value as the new argument to yield)**. This chaining of the code execution through promises is what makes it possible to execute asynchronous code as it was synchronous code:

```javascript
function spawn(genFunc, self) {
    return new Promise(function(resolve, reject) {
        // start iterating the original function and set correct this pointer
        var iterator = genFunc.call(self);  
        function step(nextFunc) {
            var next;
            try {
                next = nextFunc();
            } catch(e) {
                // finished with failure, reject the promise
                reject(e);
                return;
            }
            if(next.done) {
                // finished with success, resolve the promise
                resolve(next.value);
                return;
            }
            // not finished, chain off the yielded promise and `step` again
            Promise.resolve(next.value).then(function(v) {
                // keep stepping until next yield (original await) passing new value to yield
                step(function() { return iterator.next(v); });
            }, function(e) {
                step(function() { return iterator.throw(e); });
            });
        }
        // keep stepping until next yield (original await)
        step(function() { return iterator.next(); });
    });
}
```

**Update:**
I highly recommend reading [Ben Nadel's article](https://www.bennadel.com/blog/3123-using-es6-generators-and-yield-to-implement-asynchronous-workflows-in-javascript.htm) for a more in depth explanation.
