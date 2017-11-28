---
author: Christoph Michel
comments: true
date: 2016-10-17 15:40:38+00:00
disqus_identifier: 698 http://cmichel.io/?p=698
layout: Post
route: /how-to-add-permissions-in-react-native/
slug: how-to-add-permissions-in-react-native
title: How to add Permissions in React Native
categories:
- Tech
- React Native
---

Sometimes you need to add custom **permissions** to your **React Native** Android app to use certain features like React Native's [`Vibration.vibrate`](https://facebook.github.io/react-native/docs/vibration.html#vibrate).

## Adding Permissions to AndroidManifest.xml

Permissions in Android are stored in an **AndroidManifest.xml** file which is located at **app\src\main\AndroidManifest.xml** relative to your React Native project folder.
In there you can simply add the permission by inserting the lines:

```XML
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.appname"
    android:versionCode="1"
    android:versionName="1.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
    <uses-permission android:name="android.permission.VIBRATE" />

    <uses-sdk
        android:minSdkVersion="16"
        android:targetSdkVersion="22" />
...
</manifest>
```

You then have to recompile the app for the permissions to take effect by running `react-native run-android`.
It might also be necessary to add the second line `xmlns:tools="http://schemas.android.com/tools"`, which defines some additional namespaces if you get an error during compilation.
