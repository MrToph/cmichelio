---
author: Christoph Michel
comments: true
date: 2016-10-06 10:16:17+00:00
disqus_identifier: 586 http://cmichel.io/?p=586
layout: Post
route: /modifying-a-leaf-of-the-redux-state-tree/
slug: modifying-a-leaf-of-the-redux-state-tree
title: Modifying a Leaf of the Redux State Tree
featured: /assets/2016/10/stateTree.svg
categories:
- Tech
- Redux
- React Native
---

## Redux
**[Redux](https://github.com/reactjs/redux)** is a great framework to manage the whole application state in a web app. One of its design principles is that of **pure functions** and **never changing the state directly**. Instead, each time you want to modify your state tree, you create a **copy of the state** and do your modifications. You don't need to create a _deep copy_, i.e., cloning every single array/object in the state, it's enough to only clone the objects that you actually change. (It's even encouraged _not_ to create a deep copy, because this would trigger a re-render in **react-redux** for _all_ components, instead of only the components whose properties actually changed.)
However, in big applications this often leads to a lot of **repetitive boiler plate code**. For example, consider this state tree for a fitness app:

![Redux State Tree](http://cmichel.io/assets/2016/10/stateTree.svg)

## Copy objects along the path
The state tree reaches quite some depth as it consists of an array of several workouts, and each workout has several exercises again. It's often the case in _Redux_ that you just want to change a **leaf node** in the _Redux state tree_, let's say the _name_ property of a particular exercise in a particular workout. Simply changing this leaf node, does not work in Redux, as the _root state_ object didn't change at all, resulting in your app not registering the update. What you have to do, is to create a **copy of all objects along the path** (marked in _red_) to this leaf node.
The code to change just this one leaf node "name" in the state tree **traverses the state tree along that path bottom up** while creating a new copy at each level of the tree, changing one property and leaving the values of the siblings unchanged:
```javascript
changeName(state, newName, indexInWorkout, indexInExercises) {
  let newExercise = {
    ...state.workouts[indexInWorkout].exercises[indexInExercises],
    name: newName
  }
  // create a copy of the array
  let newExercises = state.workouts[indexInWorkout].exercises.slice()
  // change value to the new exercise object
  newExercises[indexInExercises] = newExercise
  let newWorkout = {
    ...state.workouts[indexInWorkout],
    exercises: newExercises
  }
  // again copy the array
  let newWorkouts = state.workouts.slice()
  // change value to the new workout object
  newWorkouts[indexInWorkout] = newWorkouts
  // finally reached the root element
  let newState = {...state, workouts: newWorkouts}
  return newState
}
```

As you can see it's hard to read and quite long, when all we wanted to change is just one property. Fortunately, this code is always pretty much the same, so we can try to automate it and write a simpler function that does the heavy-lifting.

## Automating creating the copies
What we're doing in the above example can be described as:
 	
  1. Traverse the state tree along a specified path.
  2. At each level of the tree, create a new **shallow copy** of the object (or a copy if it's an array):
    1. Recursively get the new value (object/array) for the next level on the path.
    2. Change the specified key on the copy of the current level to this new value.

So we can write an algorithm that takes the **new leaf value** and the **path to the leaf as an array of keys** and implements the above, but let's add a bit more functionality:
 	
  1. If it's an _object_ on the current level, the **path-key** for that level will just be the object key as a **string**
  2. If it's an _array_ on the current level, the **path-key** for that level can be either a **Number** acting as an index, or a **compare function** that will find the index by comparing the elements according to this function.

For the above example, you can then simply call the leaf changing function `changeStateDeep(state,newLeafVal,...keys)` with:

```javascript
let newState = changeStateDeep(state, newName,
      ...`workouts/${indexInWorkout}/exercises`.split('/'),
      x => x.name === oldName, // find exercise by name
      'name')
```

The implementation of `changeStateDeep(state,newLeafVal,...keys)` is given by:

```javascript
changeStateDeep = (state, val, ...keys) => {
  if (keys.length === 0) throw new Error('Wrong usage')
  let curKey = keys.shift() // key for current level
  if (Array.isArray(state)) { // current state is an array
    let copy = state.slice()
    let foundElementIndex = curKey // use it as an index if it's a number
    if (isNaN(curKey)) { // it's a function
      foundElementIndex = copy.findIndex(curKey)
    }
    let curVal
    if (keys.length === 0) { // recursion finished
      curVal = val
    } else { // recurse one level deeper
      curVal = changeStateDeep(state[foundElementIndex], val, ...keys)
    }
    copy[foundElementIndex] = curVal
    return copy
  } else {  // current state is an object
    let obj = {}
    let curVal
    if (keys.length === 0) { // recursion finished
      curVal = val
    } else { // recurse one level deeper
      curVal = changeStateDeep(state[curKey], val, ...keys)
    }
    obj[curKey] = curVal
    return Object.assign({}, state, obj)
  }
}
```

Using this function, it's already a lot easier to change a single object located deep down the state tree, but I wonder if there is an even easier alternative. I might play around with wrapping the state tree in an [ES6 proxy](http://cmichel.io/using-actions-in-redux-the-correct-way/). This way you should be able to hide the above code in the Proxy's handler function and it's literally enough to write:
 
```javascript
stateProxy.workouts[indexInWorkout].exercises[indexInExercises].name = newName
```
 
But, then I'm concerned with performance...
If you any other suggestions, please leave a comment.

## Update
It seems like my `changeStateDeep` solution is really similar to [**React's Immutability Helpers**](https://facebook.github.io/react/docs/update.html)
