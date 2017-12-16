---
author: Christoph Michel
comments: true
date: 2017-02-07
disqus_identifier: javascript-void-keyword
layout: Post
route: /javascript-void-keyword/
slug: javascript-void-keyword
title: JavaScript void Keyword
featured: /javascript-void-keyword/javascript-void-keyword.png
categories:
- Tech
---

What language is this?

```javascript
void function foo()
{
    // ...
}
```

Yes, JavaScript - I know it's already in the title. Still, I 've only heard about the `void` keyword in JavaScript recently through the [consistent return](http://eslint.org/docs/rules/consistent-return) ESLint error.

## What does JS void do?
[`void`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/void) takes an expression, evaluates it and then returns `undefined`.
Pretty useless, I agree. Still you can save some writing.

Let's look at the [consistent return](http://eslint.org/docs/rules/consistent-return) ESLint rule again. It states that functions should either _always_ return values, or never (which means always undefined in JavaScript).
For instance, if you're in a middleware in **Express** and you want to call the next middleware with `next()`, then you don't want to execute any other code after it, so you might write `return next()`.

```javascript
function middleware(next) {
  somethingAsync((err, value) => {
    // call next and return from this callback on error
    if (err) return next(err)

    // otherwise do something with value
    database.save(value)

    // returns undefined implicitly here
    // => consistent-return violated, because no return here,
    // but in the error branch we return the (unknown) return value of next
  })
}
```

However, the error branch now (possibly) returns a value, whereas the normal execution of the callback does not. The reason why that's bad is because the caller of the callback might rely on the value it returns, making it inconsistent.
To avoid the confusion we can either write:

```javascript
if (err) {
    next(err)
    return
}
```

Or shorter using the `void` keyword:

```javascript
if (err) return void next(err)
```

This way there is no ambiguity as we always return `undefined`.

## Other use cases
There are other use cases for `void`. An interesting one is in combining it with IIFEs (immediately-invoked function expressions) to not leak unnecessary variables into the scope. You can treat the `function` keyword as an expression instead of a declaration, and immediately execute it by appending `()`.

```javascript
var foo = 1
void function() { foo = 2 } ()
console.log(foo) // 2
```

Which is nicer to read than:

```javascript
var foo = 1
(function() { foo = 2 }) ()
console.log(foo) // 2
```

## Should you use it?
In my opinion, no, it's a pretty useless keyword. It can be used to shorten the code at some points, but drastically decreases code readability for people that haven't heard about the `void` keyword in JavaScript before.
