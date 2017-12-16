---
author: Christoph Michel
comments: true
date: 2016-09-24 14:58:55+00:00
disqus_identifier: 548 http://cmichel.io/?p=548
layout: Post
route: /how-to-create-a-more-popup-menu-in-react-native/
slug: how-to-create-a-more-popup-menu-in-react-native
title: How to create a More-Popup Menu in React-Native
featured: /assets/2016/09/react-native-more-popup.gif
categories:
- Tech
- React Native
---
**React-Native** has pretty much [all components you need](https://facebook.github.io/react-native/docs/), but the one that seems to be missing is a standard **More-Popup Menu** (also called **DropDown Menu**). I'm talking about the "three dots menu" you see in every application showing additional actions when you click on it:

![react native more popup dropdown menu](http://cmichel.io/assets/2016/09/react-native-more-popup.gif)

There are already several NPM packages that try to recreate it by using buttons toggling a modal which renders a custom view representing the menu, but they all come with some layout problems, mostly when the _More-Button_ is close to a border, it just overflows and looks hideous.
If you look through the [React-Native components](https://facebook.github.io/react-native/docs/) or even search the doc for _"Popup"_/_"Dropdown"_ nothing shows up. But ...

![react-native-has-a-popup-component](http://cmichel.io/assets/2016/09/react-native-has-a-popup-component.jpg)

If you dig deep down the github rabbit hole as mentioned [here](https://github.com/facebook/react-native/issues/3004), you can find an undocumented [`UIManager.java class`](https://github.com/facebook/react-native/blob/master/ReactAndroid/src/main/java/com/facebook/react/uimanager/UIManagerModule.java) that allows you to create Popups with its `showPopupMenu` method:
 
**(`UIManagerModule.showPopupMenu` is only available for Android - there is currently no similar behavior for iOS.)**

```javascript
  /**
   * Show a PopupMenu.
   *
   * @param reactTag the tag of the anchor view (the PopupMenu is displayed next to this view); this
   *        needs to be the tag of a native view (shadow views can not be anchors)
   * @param items the menu items as an array of strings
   * @param error will be called if there is an error displaying the menu
   * @param success will be called with the position of the selected item as the first argument, or
   *        no arguments if the menu is dismissed
   */
  @ReactMethod
  public void showPopupMenu(int reactTag, ReadableArray items, Callback error, Callback success) {
    mUIImplementation.showPopupMenu(reactTag, items, error, success);
  }
```
 
The description is straight-forward, so let's see how to build a React component around it. We will use [**react-native-vector-icons**](https://github.com/oblador/react-native-vector-icons) to display an `Icon` with three vertical dots, and let the component take two properties:
  1. An `actions` array representing the menu items as strings
  2. An `onPress` callback handling clicks on these menu items: It gets called with the _event name_ and the _index of the pressed menu item_. (The event names are either "itemSelected" or "dismissed".)

The implementation can be seen [here](https://gist.github.com/MrToph/1bcd0daa99035e63f427dd2b08256bd9).

```javascript
import React, { Component, PropTypes } from 'react'
import { View, UIManager, findNodeHandle, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

const ICON_SIZE = 24

export default class PopupMenu extends Component {
  static propTypes = {
    // array of strings, will be list items of Menu
    actions:  PropTypes.arrayOf(PropTypes.string).isRequired,
    onPress: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      icon: null
    }
  }

  onError () {
    console.log('Popup Error')
  }

  onPress = () => {
    if (this.state.icon) {
      UIManager.showPopupMenu(
        findNodeHandle(this.state.icon),
        this.props.actions,
        this.onError,
        this.props.onPress
      )
    }
  }

  render () {
    return (
      <View>
        <TouchableOpacity onPress={this.onPress}>
          <Icon
            name='more-vert'
            size={ICON_SIZE}
            color={'grey'}
            ref={this.onRef} />
        </TouchableOpacity>
      </View>
    )
  }

  onRef = icon => {
    if (!this.state.icon) {
      this.setState({icon})
    }
  }
}
```

Here's an example usage of this React-Native `Popup Component`:
 
```default
  render () {
    return (
      <View>
        <PopupMenu actions={['Edit', 'Remove']} onPress={this.onPopupEvent} />
      </View>
    )
  }

  onPopupEvent = (eventName, index) => {
    if (eventName !== 'itemSelected') return
    if (index === 0) this.onEdit()
    else this.onRemove()
  }
```
