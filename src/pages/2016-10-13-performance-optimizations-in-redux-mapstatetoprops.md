---
author: Christoph Michel
comments: true
date: 2016-10-13 14:26:50+00:00
disqus_identifier: 659 http://cmichel.io/?p=659
layout: Post
route: /performance-optimizations-in-redux-mapstatetoprops/
slug: performance-optimizations-in-redux-mapstatetoprops
title: Performance Optimizations in Redux' mapStateToProps
featured: 
categories:
- Tech
- Redux
---

I already talked about issues with Redux' `connect/mapStateToProps` in [my post last week](http://cmichel.io/why-you-should-not-use-mapstatetoprops-too-often/), let's address the performance issues in this post. In Redux, you connect a component to the store via `connect` by providing a `mapStateToProps` function. The problem is that this function gets called on _every_ state update, even if the connected component is currently invisible, or the part of the state tree that got updated has no relevance for this component.
For example, you're doing Navigation in **React Native** and [push routes onto a route stack](https://facebook.github.io/react-native/docs/navigator.html). You will end up with many _mounted_ components that are currently _not visible_, but their `mapStateToProps` will still get called every time the user triggers a state change. This is fine as long as your selectors in `mapStateToProps` only do easy computations on the state. If the result is however not easily derivable from the state, doing the computations all over again, every time, slows down your performance, and is simply just not necessary.

## Caching the result

The solution seems pretty simple: You store the active route somewhere in your state tree, and in `mapStateToProps` you simply check _if the active route is equal to this component_, to prevent unnecessary calculations when the mounted component is not rendered, **and** in the _selector_ you check _if the relevant part of the state tree changed_, to prevent unnecessary **re**computations. This is easier said than done, as in `mapStateToProps(state, ownProps)` you **must** return the new **injected properties**, while only having access to the state and the properties passed down from the parent, but not to the old **injected properties**. So you have to **memoize** -cache the result of- `mapStateToProps` (or the _selector_). There is a nice library for this task, **[reselect](https://github.com/reactjs/reselect)**, and I encourage you to read through their example and see if it can be applied to your setting. To mine it couldn't, because their selectors only allow access to the state, whereas I need them to also take dynamic arguments. So let's create our own simpler **reselect** from scratch as it's a good learning experience and helps you understand how exactly the **memoization** works.

### Memoizing the selector

We store the _arguments_ and the _result_ from the last call and if the _new arguments_ match the last arguments, we simply return the last result. Otherwise, we recompute.

```javascript
// reducer.js
const createMemoizedSelector = () => {
  let lastArgs
  let lastResult
  return (state, dynamicArg) => {
    if (lastArgs) {
      let [lastRelevantState, lastDynamicArg] = lastArgs
      if (getRelevantState(state, dynamicArg) === lastRelevantState
          && dynamicArg === lastDynamicArg) return lastResult
    }
    // first call or relevant part changed, recompute it
    lastResult = expensiveComputation(state, dynamicArg)
    lastArgs = [getRelevantState(state, dynamicArg), dynamicArg]
    return lastResult
  }
}

const selector = createMemoizedSelector()
export selector
```

### Memoizing mapStateToProps

Here, we only call the selector if the component is actually rendered to save on performance. When the component becomes the active route, this will be reflected in a state change and `mapStateToProps` will be called, and only then we do the computation.

```javascript
// Component.js
import { selector } from 'reducer'
import { connect } from 'react-redux'

class MyComponent extends Component {
  ...
}

var lastInjectedProps
const mapStateToProps = (state, ownProps) => {
  // if we are not getting rendered, don't do computations
  if(getActiveRoute(state) === 'MyComponent') {
    lastInjectedProps = {
      foo: selector(state, ownProps.bar)
    }
  }
  return lastInjectedProps
}
```
