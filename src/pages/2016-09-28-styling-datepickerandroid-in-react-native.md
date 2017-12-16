---
author: Christoph Michel
comments: true
date: 2016-09-28 17:38:39+00:00
disqus_identifier: 575 http://cmichel.io/?p=575
layout: Post
route: /styling-datepickerandroid-in-react-native/
slug: styling-datepickerandroid-in-react-native
title: Styling DatePickerAndroid in React Native
featured: /assets/2016/09/datepickerandroid-react-native-style-1.png
categories:
- Tech
- React Native
---
The standard style of the **DatePickerAndroid** Component is a teal background which might not blend with the color scheme you're using in your React Native app. I'll show you how to style DatePickerAndroid to match your theme.

![DatePickerAndroid React Native Style](http://cmichel.io/assets/2016/09/datepickerandroid-react-native-style-1.png)

[`DatePickerAndroid`](https://facebook.github.io/react-native/docs/datepickerandroid.html) is an API for the native DatePicker Android module and thus cannot be directly styled through JS props like real React Native components. However, you can style the native android modules by changing the **styles.xml** in your android folder. It is located at **"android/app/src/main/res/values/styles.xml"** relative to your react-native project. To get a red background for the DatePicker, you edit the contents of **styles.xml** as follows:

```XML
<resources>

    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.NoActionBar">
        <!-- Customize your theme here. -->
        <item name="android:datePickerDialogTheme">@style/Dialog.Theme</item>
    </style>

	<style name="Dialog.Theme" parent="Theme.AppCompat.Light.Dialog">
	    <item name="colorAccent">#FF0000</item>
	    <item name="android:textColorPrimary">#0000FF</item>
 	</style>
</resources>
```

The app has to recompile for the styles to be applied, so run _react-native run-android_ again.
