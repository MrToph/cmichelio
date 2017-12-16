---
author: Christoph Michel
comments: true
date: 2016-09-09 15:19:00+00:00
disqus_identifier: 497 http://cmichel.io/?p=497
layout: Post
route: /limitations-of-the-react-native-js-engine/
slug: limitations-of-the-react-native-js-engine
title: Limitations of the react-native JS engine
featured: /assets/2016/09/es6-proxies-react-native.png
categories:
- Tech
- React Native
---
If you're already used to writing ES6 JavaScript, you might get a bad surprise at some point while programming for react-native. Say you want to use [ES6 Proxies to find errors more easily while developing](http://cmichel.io/using-actions-in-redux-the-correct-way/), and everything works fine until you disable the remote JS debugging, and you encounter this:

`Can't find variable: Proxy`

![es6 proxies react native](http://cmichel.io/assets/2016/09/es6-proxies-react-native.png)

What's going on here? While remote debugging, your react-native code runs in Chrome's V8 JS engine which supports ES6. In production however your code runs in [Safari's "JavaScriptCore" JS engine](https://facebook.github.io/react-native/docs/javascript-environment.html#javascript-runtime) which apparently doesn't understand ES6. Behind the hood, react-native already runs babel to transform the most used ES6 features to ES5, but not all of them.

## What features of ES6 can I use in react?
The documentation provides an [official answer here](https://facebook.github.io/react-native/docs/javascript-environment.html#content). Having said that, you can theoretically use everything that can be implemented in ES5 by providing polyfills for the unsupported features you want to use. So, for most things you can tell react-native to [use your custom babel config](https://www.npmjs.com/package/babel-preset-react-native) with additional babel-plugins to spit out ES5. On the [babel website](http://babeljs.io/docs/learn-es2015/) is a list of features that can be transpiled to ES5 with polyfills, unfortunately, [Proxies](https://babeljs.io/docs/learn-es2015/#proxies) are an "unsupported feature" and there is no (efficient) polyfill for them. Let's hope react-native upgrades to some better JS engine to get full ES6 support.
