---
author: Christoph Michel
comments: true
date: 2016-10-29 19:20:47+00:00
disqus_identifier: 780 http://cmichel.io/?p=780
layout: Post
route: /lessons-from-building-first-react-native-app/
slug: lessons-from-building-first-react-native-app
title: What I learned from building my first React Native App
featured: /assets/2016/10/featured.jpg
categories:
- Tech
- React Native
- Redux
---

I recently released my first app on Android built with **React Native**. It's a fully fledged workout log for the [PHUL fitness program](https://www.muscleandstrength.com/workouts/phul-workout) including customizing workouts and exercises, a rest timer, a calendar, progress charts, etc. You can see the full feature list and check out the app [**PHUL Workout Log** on the Google Play Store](https://play.google.com/store/apps/details?id=io.cmichel.phul). I don't own a Mac so it's only available on Android for now.

[![React Native PHUL Workout Log](http://cmichel.io/assets/2016/10/featured.jpg)](https://play.google.com/store/apps/details?id=io.cmichel.phul)

This was my first app created with **React Native** and the first bigger project I used **Redux** with and in this post I 'll talk about what I would do different if I were to start all over again. If you only read the documentation of a framework, you _cannot_ judge whether it 'll be actually good for production, as there will always be unforeseen obstacles, like **missing components**, no access to ** system timers**, and other things you didn't think about. Therefore, I'll talk about my experiences now _after_ having created a full app with React Native and show some of the obstacles I encountered along the way with their solutions.

## Redux and App Design

I used [**Redux**](https://github.com/reactjs/redux) to handle the app state as I like the idea of having a single location, the _store_, where _all_ the state is stored. I had no issues with it and would use it again, it's a great way to handle state while being easy to maintain and to refactor. Just make sure to follow good redux design choices, like only accessing the state in components through **selectors**, putting all **business logic into the selectors and reducers (and thunks)** and having **stateless services**.
If you're new to Redux, I recommend the video serious on [egghead.io](https://egghead.io/courses/getting-started-with-redux) by Dan Abramov himself (and [part two talking about more design patterns](https://egghead.io/courses/building-react-applications-with-idiomatic-redux)). Also, reading [this article by Tal Kol](https://hackernoon.com/redux-step-by-step-a-simple-and-robust-workflow-for-real-life-apps-1fdf7df46092) helps a lot and summarizes all important choices.
Still there are things I would do different in designing my app now:

### Use a normalized state tree

At first, I had a state tree that contained **deeply nested objects**, but it was annoying to change the state tree, because you cannot simply mutate the state. Instead you have to [copy all the objects along the path](http://cmichel.io/modifying-a-leaf-of-the-redux-state-tree/) to your deeply stored object. Then, I refactored it and am now using a state that is **broad** instead of deep and complies to [**the ideas of normalizr**](https://github.com/paularmstrong/normalizr).
I'm a fan of doing most things without additional libraries when learning the principles of a new technology for the first time to really understand what's going on, so I ended up writing my own [implementation to mutate the state](http://cmichel.io/modifying-a-leaf-of-the-redux-state-tree/) safely. Next time, I will just use an **immutability library** like [seamless-immutable](https://github.com/rtfeldman/seamless-immutable).

<img src="http://cmichel.io/assets/2016/10/stateTree.svg" alt="Redux State Tree" width="331" height="451" />
_Working with a deeply-nested state tree in reducers can get annoying._

### Put _everything_ into the state

When a lot of components are mounted and pushed onto the route stack, _every_ single component that is **connected to the store** calls their selectors when a state update occurs, even the ones that are _not being rendered_ right now. For example, in my app you can choose one of four workout days in a **WorkoutPicker** Component. If you select one, the `WorkoutPicker` component gets pushed onto the route stack to be able to transition back to it nicely. The problem is that `WorkoutPicker` is connected to the store and the selectors iterate over _all workouts_ to compute the average workout duration, which is a costly operation to do on every state update.

[**Reselect**](https://github.com/reactjs/reselect) helps in the way that it caches the result and does _not_ recompute it if an irrelevant part of the state tree (for the computation) changed (for example a change in the settings).
Again, I'm a fan of doing things myself the first time (and you always get a [blog post out of it](http://cmichel.io/performance-optimizations-in-redux-mapstatetoprops/)), so I implemented my [own memoized selectors](http://cmichel.io/performance-optimizations-in-redux-mapstatetoprops/). Part of the reason why **reselect** didn't work well for me was because reselect's selectors only access _the state tree_ and cannot take _additional arguments_. So make sure to really store _everything_ in the state tree if you want to use reselect. (For instance, I only stored the active route in the state while leaving the route _stack_ implicit in the Navigator.)

## React Native Experiences

**Foreword:** This list talks about the "unpleasant" things I encountered with React Native while not mentioning a lot of the great things about it, like the **fast testing with hot-reloading**, allowing to **write ES6 JavaScript** instead of Java, and a lot of the things you can already do with only the core of React Native.
In fact, I'm pretty sure if I got into native Android programing (I <del>have</del> had no experience with it) and wrote the same blog post from that perspective, the list would be much longer.

### Components I wish already existed

For my app I needed a lot of components that don't immediately ship with React Native. Luckily, the React Native community is great and there are a lot of **custom components on GitHub/NPM**. This is a huge plus of React **Native** - if something doesn't exist, you can just build it yourself and bridge it to use within JavaScript, because you have **native** access to Android/iOS. Here are some custom components I ended up using:
 	
  * **Popup Menu:** This one actually exists in react-native but is not documented, see [this post here](http://cmichel.io/how-to-create-a-more-popup-menu-in-react-native/).

    ![react native more popup dropdown menu](http://cmichel.io/assets/2016/09/react-native-more-popup.gif)
 	
  * **Push Notifications on Android:** I really think this one should be in the **React Native Core**. There is already an API for iOS, but not for Android. I used **local notifications** for the rest timer in my app, as these work even when the app is not in the foreground or when the device is sleeping. There is a library [react-native-system-notification](https://github.com/neson/react-native-system-notification) which I forked, because some things were not yet implemented that were important to me: Working LED lights on notifications and custom vibrate patterns. The alarm timer also has a <del>bug</del> feature since _Android.KITKAT_ that makes the scheduled notifications [fire off later instead of exact](https://developer.android.com/reference/android/app/AlarmManager.html) in trade for better battery consumption.

    Even though I had no prior Android experience, I was able to fix these things by simply looking up <a href="https://developer.android.com/reference/android/app/AlarmManager.html#setExact(int, long, android.app.PendingIntent">the documentation</a> as it just requires Java knowledge but nothing Android specific. I don't like having unused [app permissions](http://cmichel.io/how-to-add-permissions-in-react-native/) or dependencies, so I ended up removing some things from _react-native-system-notification_ that I didn't need: Unnecessary app permissions like `GET_TASKS` and `RECEIVE_BOOT_COMPLETED`, and the dependency on sending web push notifications over **GCM/FCM** because I only use local notifications.

    ![React Native Android Notifications](http://cmichel.io/assets/2016/10/react-native-android-notifications.png)
 	
  * **Background Timer:** It would be nice to have a general background timer in the react-native core that calls a callback after some time and **still runs when your app is not in the foreground** (`setTimeout` and similar don't). I only needed this functionality for the notifications, so I didn't end up using any other library here.

  * **Calendar:** There is [DatePickerAndroid](http://cmichel.io/styling-datepickerandroid-in-react-native/), however I wanted the ability to **highlight custom dates** in a calendar so I ended up using [react-native-calendar](https://github.com/christopherdro/react-native-calendar). Unfortunately, this didn't work out of the box for Android, so I ended up debugging it, and [submitted a Pull Request](https://github.com/christopherdro/react-native-calendar/issues/43). It was nice to give something back to the community and this time all fixes could be done in JavaScript which I'm better at.
  
    ![React Native Calendar](http://cmichel.io/assets/2016/10/react-native-calendar-231x300.png)

  * **SVG Drawing Library:** There is the great [react-native-svg](https://github.com/react-native-community/react-native-svg) library that ended up working flawlessly and I could [build my charts with d3.js](http://cmichel.io/charts-in-react-native-svg-and-d3-js/). Being able to use libraries you are already familiar with from web development is another point why being able to use _JavaScript_ for React Native is so powerful.
  
    ![React Native Svg Line Chart](http://cmichel.io/assets/2016/10/react-native-svg-line-chart.png)

  * **Other highly requested features:** You can see a lot more requested react-native features and bug fixes on [productpains](https://productpains.com/product/react-native), if you want to get an overview of the **current state of react-native**.

### Bugs and Performance Issues

I didn't have any issues with performance, because I was always on the lookout for possible performance bottle necks and came up with [optimizations](http://cmichel.io/why-you-should-not-use-mapstatetoprops-too-often/) as soon as I had concerns. **Just make sure to remove all debug `console.logs` when publishing.** You can [try out the app](https://play.google.com/store/apps/details?id=io.cmichel.phul) to see if it really feels _native_.
The only bug I encountered in **react-native** is that `ViewPagerAndroid` [doesn't work](https://github.com/facebook/react-native/issues/6469) when it is contained within a _ScrollView_, so I had to rewrite the `Navigator` part.

### Monetization

If you don't get paid to build the app, you probably want to earn at least some money from it.

#### In-app Purchases

There is [react-native-billing](https://github.com/idehub/react-native-billing) for Android, but I haven't personally tested it. It's probably hard to get an in-app purchase module working for both Android and Apple, but I'd love to see it in a future React-Native update.

#### Ads

I feel like in this area react-native, or rather the advertisement platforms, are lacking a lot and don't recognize the huge opportunity here. Right now, there is only [react-native-admob](https://github.com/sbugert/react-native-admob) which I use to show a small ad-banner at the bottom of the app. It shouldn't be too hard for other ad providers to release an official react-native module - I'm sure a lot of people would try it as there is just no competition right now.

### Workflow problems

The workflow in **React Native** is really nice, no doubt. The hot-reloading makes it incredibly easy to test changes and this amount of developer satisfaction is not even possible by building native Android apps. The only issue I had were the constant **EPERM lstat** _File Access Errors_ I got when trying to compile with **react-native run-android** under Windows.

![React Native Eperm Lstat Error](http://cmichel.io/assets/2016/10/react-native-eperm-lstats-error.png)

There could also be better error descriptions, a lot of times I felt like the error message had nothing to do with where the actual error is located in my code.
I had some [memory leakage issues](https://github.com/facebook/react-native/issues/7972) when testing my [charts](http://cmichel.io/charts-in-react-native-svg-and-d3-js/) in a `ViewPagerAndroid` while hot reloading the app in dev mode. The app just crashed due to a memory issue. This didn't happen in the release build yet, so to me it looks like some resources are not being released while hot-reloading?

`java.lang.OutOfMemoryError: Failed to allocate a 6058404 byte allocation with 3950232 free bytes and 3MB until OOM
at dalvik.system.VMRuntime.newNonMovableArray(Native Method)
at android.graphics.Bitmap.nativeCreate(Native Method)
`

## Conclusion

All in all, I really enjoyed [developing the app](https://play.google.com/store/apps/details?id=io.cmichel.phul) in **React Native**, because I could implement everything I wanted in **JavaScript** and even did some minor adjustments in the Java code of some community modules without prior experience of the Android App ecosystem.  
Furthermore, you even get to strengthen your Redux and React knowledge for your future web development projects, which is the beauty of being able to use already existing JavaScript frameworks. I'll definitely use **React Native** for my next app again - I can develop faster without the need to learn the Android API and, as the community grows, there will be more and more Native modules available. If there isn't, I 'll look up how to do it in Android and create it myself, which I would have to do anyway if I were a native Android developer. So I don't see a reason not to use **React Native**.
