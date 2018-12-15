---
title: Difference Boolean Constructor and Double Negation
date: 2018-12-15
featured: /difference-boolean-constructor-and-double-negation/featured.png
categories:
- Tech
medium:
- javascript
- Programming
- blockchain
- cryptocurrency
steem:
- utopian-io
- steemdev
- programming
- cryptocurrency
---

In JavaScript, double negation `!!` is often used to convert values to boolean values while keeping the same truth value.
For example:

```js
!!"" // false
!!null // false
!!{} // true
!![] // true

// want to return true or false
const hasElement = (array, element) => !!array.find(el => el === element)
// P.S. Array.includes or Array.some would be more appropriate here
```

But it looks a bit ugly and you can instead use the `Boolean` constructor which does the same as double negation:

```js
Boolean("") // false
Boolean(null) // false
Boolean({}) // true
Boolean([]) // true

const hasElement =
    (array, element) => Boolean(array.find(el => el === element))
```

It also allows you to write this short awesome-looking falsy value filter like `lodash.compact`:

```js
["", null, {}, [], true, false].filter(Boolean)
// [{}, [], true]
```

You can just pass in the `Boolean` constructor itself instead of having to create an anonymous function taking the element and returning the double negation of the element.
`Boolean` is thus better for functional programming as it is a function itself giving rise to the possibility of [η-reduction](https://wiki.haskell.org/Eta_conversion).
Meaning, in our example, instead of writing `filter(el => Boolean(el))` we can just write `filter(Boolean)` instead.

Here's the big **BUT** that you need to know when using `Boolean`:
**Always call the constructor like a function, never with the new keyword**.

If you invoke the `Boolean` constructor not as a function call but by using `new`, it returns **an object**.
In JavaScript, every object is a truthy value, which leads to these quirks in the language:

```js
new Boolean(true)
> Boolean {true}

true === new Boolean(true) // false 😞
false === new Boolean(false) // false 😞

// you can get the primitive boolean value with valueOf()
true === new Boolean(true).valueOf() // true, but 🤮
```

But calling `Boolean` as a function returns a **primitive boolean value** instead which is what we want.

```js
true === Boolean(true) // true 😃
false === Boolean(false) // true 😃
```

So a question one might ask is:
Why would one ever want to use the constructor with `new` and create boolean _objects_ instead of primitive values?
Please let me know if you have an answer.
Especially in modern JavaScript where the strict-equality operator `===` is used and the one with type coercion `==` is frowned upon.
