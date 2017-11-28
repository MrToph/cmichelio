---
author: Christoph Michel
comments: true
date: 2016-08-31 10:35:18+00:00
disqus_identifier: 390 http://cmichel.io/?p=390
layout: Post
route: /using-actions-in-redux-the-correct-way/
slug: using-actions-in-redux-the-correct-way
title: Using Actions in Redux the Correct Way
categories:
- Tech
- Redux
---

I'll show you how to use ES6 Proxies to make working with actions less error prone.
In Redux you dispatch actions from within some components, and listen to them in your reducer which alters the state accordingly. Usually, it looks something like this.
```javascript
// SomeComponent.js
const mapDispatchToProps = dispatch => {
  return {
    dispatchPostsRequest: value => dispatch({
      type: 'FETCH_POSTS_REQUEST', payload: value
    }),
    dispatchPostsSuccess: value => dispatch({
      type: 'FETCH_POSTS_SUCCESS', payload: value
    })
  };
};

// reducer. js
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_POSTS_REQUEST':
    case 'FETCH_POSTS_FAILURE':
    case 'FETCH_POSTS_SUCCESS':
  }
  return state;
};
export default reducer;
```

### Redundancy with hardcoded strings
You have hardcoded strings all over the application which can easily introduce errors, when you don't remember if your action type was `FETCH_POSTS_REQUEST`, `FETCH_POST_REQUESTS`, `FETCH_REQUEST_POSTS`, or `I_REGRET_CHOOSING_LONG_STRING_NAMES`. The underlying problem is data redundancy, the same strings are scattered at different locations throughout your application. This problem appears often and is easy to fix by refactoring the action names into a new class.
```javascript
// ActionNames.js
export default {
  fetchPostsRequest: 'FETCH_POSTS_REQUEST',
  fetchPostsFailure: 'FETCH_POSTS_FAILURE',
  fetchPostsSuccess: 'FETCH_POSTS_SUCCESS'
};

// reducer.js (and everyWhereElseTheStringsWereUsed.js)
import ACTIONS from '../constants/ActionNames';
const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.fetchPostsRequest:
    case ACTIONS.fetchPostsFailure:
    case ACTIONS.fetchPostsSuccess:
  }
  return state;
};
export default reducer;
```

### What's the real problem
Did this solve the problem? Only partly, you now need to know if it was `ACTIONS.fetchPostsRequest`, or `ACTIONS.fetchPostRequests`, etc.
The difference is you can now look it up at a central location in ActionNames.js. The real problem however is not that you have to look up object field names, rather that failures stay unrecognized and make the application hard to debug, because of the way JavaScript works.
In the reducer, if you check for `ACTIONS.badKey`, it evaluates to undefined and your corresponding switch case will just silently fail when the action.type string gets compared with undefined.

### ES6 Proxies to the rescue
![Behind 7 ES6 Proxies](http://i0.kym-cdn.com/entries/icons/original/000/001/461/Good_Luck_I_m_Behind_7_Proxies.jpg)

The ES6 standard introduced [Proxies](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Proxy), which act kind of like the Proxies you know from the internet. Previously, JS had no way to apply some logic when accessing an object's properties. With ES6 Proxies, you have a standard JS object (called target) and can create a Proxy out of it. You specify a handler function that gets called everytime proxy.someProperty gets called.

In our Redux Actions setting, if ACTIONS.fetchPostsRequest, ACTIONS.fetchPostsFailure, ACTIONS.fetchPostsSuccess gets accessed, we want to route the access to the corresponding property of the target object, otherwise we want to throw an error. For that, in the handler function we check if the key that gets accessed exists or not via [Object.hasOwnProperty](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty). The code is pretty self-explanatory.
```javascript
// ActionNames.js
let target = {
  fetchPostsRequest: 'FETCH_POSTS_REQUEST',
  fetchPostsFailure: 'FETCH_POSTS_FAILURE',
  fetchPostsSuccess: 'FETCH_POSTS_SUCCESS'
};
let handler = {
  get: (target, key) => {
    if (target.hasOwnProperty(key)) return target[key];
    else throw new Error(`Fired a wrong actionname: ${key}. Available Actions: ${Object.keys(target)}`);
  }
};
const proxy = new Proxy(target, handler);
export default proxy;

// reducer.js
import ACTIONS from '../constants/ActionNames';
const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.fetchPostsRequest:
    case ACTIONS.fetchPostsFailure:
    case ACTIONS.fetchPostsSuccess:
    case ACTIONS.badKey: // throws an Error now
  }
  return state;
};
export default reducer;

// SomeComponent.js
import ACTIONS from '../constants/ActionNames';
const mapDispatchToProps = dispatch => {
  return {
    dispatchPostsRequest: value => dispatch({
      type: ACTIONS.fetchPostsRequest, payload: value
    }),
    dispatchPostsSuccess: value => dispatch({
      type: ACTIONS.otherBadKey, payload: value // // throws an Error now
    })
  };
};
```

As the proxy just acts as a wrapper, the code in the reducer or components where you dispatch that action stays the same. If we ever access ACTIONS.badKey now, the proxy will throw an error, it will be displayed in your console, instead of just failing silently and you wondering why your actions are not firing.
