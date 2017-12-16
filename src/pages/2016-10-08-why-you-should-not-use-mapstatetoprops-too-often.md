---
author: Christoph Michel
comments: true
date: 2016-10-08 17:31:46+00:00
disqus_identifier: 614 http://cmichel.io/?p=614
layout: Post
route: /why-you-should-not-use-mapstatetoprops-too-often/
slug: why-you-should-not-use-mapstatetoprops-too-often
title: Why you should not use mapStateToProps too often
featured: /assets/2016/10/stateTree-1.svg
categories:
- Tech
- Redux
---
In [React](https://facebook.github.io/react/) you often pass down the same properties from some top-level component to the children when they also need access to it. Then, these children pass the props onto their children again, and it continues. This can go several levels deep, and one might think that using [Redux's]() [`mapStateToProps`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) would be a nice solution to get around it (at least I did), as `mapStateToProps` allows each component to access the state directly, and one can just fetch the props from there. However, there are two issues with this approach:

### `mapStateToProps` is called on _every_ state change

The core concept of **Redux** is to have a single state tree for the whole application. So your state tree probably consists of a lot of independent _sub-states_ that are handled via [`combineReducers`](http://redux.js.org/docs/api/combineReducers.html). The problem is that `mapStateToProps` is called for _any_ state change, no matter if the state change is relevant to this component or not, and if you do some computation inside `mapStateToProps`, it will be run _every time_. If you are doing heavy calculations in the selector, there are some libraries like **[reselect](https://github.com/reactjs/reselect)** that can check if the **relevant part** of the state tree changed, and if not simply return the cached value. However, there is still a lot of checking going on which might add up, especially if you keep the components mounted, for instance, when navigating in **React-Native**.

### <del>There is no execution order on `mapStateToProps`</del>

**Update 29.12.2016:** As pointed out by Mark Erikson in the comments this is no longer an issue in [react-redux 5.0.0](https://github.com/reactjs/react-redux/releases/tag/v5.0.0):
> _"Store state change notifications sent to components are now guaranteed to occur top-down."_

Let's say you have a top-level component rendering child components, and both the top-level component and the child components are connected to the store via `mapStateToProps`. If a state change happens, there is no guarantee that the top-level component's `mapStateToProps` is executed first. Consider the fitness app example from [last post](): The state consists of a **Workout** having several **Exercises** as its children. 

![Redux State Tree mapStateToProps](http://cmichel.io/assets/2016/10/stateTree-1.svg)

The _Workout_ has a corresponding top-level component that gets the exercises from the state (with `mapStateToProps`) and renders them in an _Exercise_ child component. The exercise **child component also gets its props from the state with `mapStateToProps`**, but to do that it needs to know which exercise it actually is. To avoid the identity-crisis, _Workout_ has to pass down some **key**, let's use the _name_ prop.

The error now happens when an action to remove the exercise from the workout is dispatched and the state is updated. If the top-level component's `mapStateToProps` is called first, everything works fine, as it receives the new exercises array, and triggers a rerender which removes the deleted exercise. But **there is no order on `mapStateToProps`**, so we _cannot_ guarantee that the top-level component is executed first, and it might as well happen that the child component's `mapStateToProps` is called. The child component then tries to get its props by accessing the state's exercise array with an invalid key leading to an error.

### Solution

The solution is to **only use [`mapStateToProps`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) for top-level components** and propagate the props for the children from there by passing them down, as it is done in standard React. So don't use React-Redux' `connect` if your only motivation is to avoid passing down _props_ to children.

