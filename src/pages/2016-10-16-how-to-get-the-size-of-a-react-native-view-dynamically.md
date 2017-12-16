---
author: Christoph Michel
comments: true
date: 2016-10-16 19:51:05+00:00
disqus_identifier: 676 http://cmichel.io/?p=676
layout: Post
route: /how-to-get-the-size-of-a-react-native-view-dynamically/
slug: how-to-get-the-size-of-a-react-native-view-dynamically
title: How to Get The Size of a React Native View Dynamically
featured: /assets/2016/10/react-native-view-size-dynamic.png
categories:
- Tech
- React Native
---

Sometimes you need to know the exact width or height of a `View` in **React Native** _dynamically at runtime_. For instance, if you want to draw a chart scaled to the full page, you need to know the width and the height of the available space.

![React Native View Size Dynamic](http://cmichel.io/assets/2016/10/react-native-view-size-dynamic.png) The Chart needs to know its width and height

There are two ways in **React Native** to dynamically get the _size_ of a `View`.

### Using `Dimensions`

React Native provides a [`Dimensions`](https://facebook.github.io/react-native/docs/dimensions.html) API that can be used to get the _width_ and the _height_ of the _window_. From there on, you can compute the available height yourself by subtracting the size of the **Toolbar** and the **TabMenu**.
```javascript
import { Dimensions } from 'react-native'

class Test extends Component {
  constructor (props) {
    super(props)
    let {width, height} = Dimensions.get('window')
    console.log(width, height)
  }
}

```

This is quick and easy, but the drawback of this approach is that you need to know the size of the `Views` above and below the one you want to render. Another confusing thing is that the _height_ received this way **includes the height of the Soft Buttons Menu Bar** on Android, which you usually want to exclude as you don't want to draw behind it. Therefore, I prefer using the second method.

### Using `onLayout`

Each `View` has an [`onLayout(event)`](http://facebook.github.io/react-native/releases/0.35/docs/view.html#onlayout) callback function receiving an _event_ that includes the `View's` `x, y, width` and `height` properties. The problem is that this function is only called **after** the first `render` call, but the whole point was to know the size **before** rendering to know how much space is available for the component. The solution I use is to render a **dummy View** first, wait for `onLayout` to get called, extract the **width and height**, and then **set the state** to trigger a re-render. In the _second_ render the **actual View with its contents** can now be rendered instead of the dummy View. One must make sure that the **dummy View with no contents has the same size as the real View with the actual contents**. For this we can use [React Native's flexbox layout](https://facebook.github.io/react-native/docs/flexbox.html) to stretch the empty dummy View to all the available space. The code looks like this:

```javascript
import React, { Component, PropTypes } from 'react'
import { View } from 'react-native'
import Svg from 'react-native-svg'

export default class LineChart extends Component {
  constructor (props) {
    super(props)
    this.state = {dimensions: undefined}
  }

  render () {
    // If dimensions is defined, render the real view otherwise the dummy view
    if (this.state.dimensions) {
      var { dimensions } = this.state
      var { width, height } = dimensions
      // do stuff
      ...
    }
    return (
      <View style={{flex: 1, alignSelf: 'stretch'}} onLayout={this.onLayout}>
        {
          this.state.dimensions
           ? <Svg width={width} height={height}>
              ...
             </Svg>
           : undefined}
      </View>
    )
  }

  onLayout = event => {
    if (this.state.dimensions) return // layout was already called
    let {width, height} = event.nativeEvent.layout
    this.setState({dimensions: {width, height}})
  }
}
```
