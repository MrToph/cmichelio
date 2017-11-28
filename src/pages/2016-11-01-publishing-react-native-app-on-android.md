---
author: Christoph Michel
comments: true
date: 2016-11-01 17:17:22+00:00
disqus_identifier: 883 http://cmichel.io/?p=883
layout: Post
route: /publishing-react-native-app-on-android/
slug: publishing-react-native-app-on-android
title: Publishing React Native App on Android
categories:
- Tech
- React Native
---

So you created your app, but there are still some things to do before **publishing a React Native app on Android**.

## Remove Debug Commands

This one might be obvious, but make sure to really remove all debug `console.logs` and unnecessary Redux middleware like `redux-logger`, otherwise you might feel a drastic performance drop in your release build.

## Create a signed APK

When you upload your app to the Google Play Store or test it on your real device instead of the emulator, your APK has to be signed for security reasons. There is an article about how to sign your React Native APK in the [React Native documentation](https://facebook.github.io/react-native/docs/signed-apk-android.html). Here are the steps summarized again:

1. Go to **android/app** in your project folder and run  
`
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
`

2. Add **global gradle variables** by appending
    ```default
    MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
    MYAPP_RELEASE_KEY_ALIAS=my-key-alias
    MYAPP_RELEASE_STORE_PASSWORD=*****
    MYAPP_RELEASE_KEY_PASSWORD=*****
    ```
    to `~/.gradle/gradle.properties` (or `C:\Users\USERNAME\.gradle\gradle.properties` on Windows)


3. Edit **android/app/build.gradle** to use the global gradle variables:  
    ```default
    android {
        ...
        defaultConfig { ... }
        signingConfigs {
            release {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
        buildTypes {
            release {
                ...
                signingConfig signingConfigs.release
            }
        }
    }
    ```
4. You can now compile it and deploy it to your device by running  
`
react-native run-android --variant=release
`  
The **app-release.apk** can be found in **android/app/build/outputs/apk**.

Remember to keep your keystore **private**, remove it from version control and **don't lose it**, otherwise you can't update your app anymore.

## Remove unnecessary permission

If you are like me, you don't like having Android permissions in your app that you don't use. **React Native** automatically injects some permissions into your app, you can see them at **android/app/build/intermediates/manifests/full/release/AndroidManifest.xml**. There, the permissions are listed as:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
```

React Native needs these because a lot of them are used during development, `INTERNET` for hot-reloading, or `SYSTEM_ALERT_WINDOW` to show the yellow warning and red error messages. If your app doesn't require them, it's good practice to remove them. What worked for me was the following:

1. In **android/app/src/main/AndroidManifest.xml (!)** add  
    ```xml
    <uses-permission android:name="android.permission.READ_PHONE_STATE" tools:node="remove"/>
    ```
    to remove the `READ_PHONE_STATE` permission.

2. You want to remove `SYSTEM_ALERT_WINDOW` only in _release mode_. What worked for me was creating a new **AndroidManifest.xml** in **android/app/src/release** with the following contents:
    ```xml
    <manifest
        xmlns:android="http://schemas.android.com/apk/res/android"
        xmlns:tools="http://schemas.android.com/tools"
        >

        <!-- These are added by React Native for debug mode, but actually aren't needed in releasemode -->
        <uses-permission tools:node="remove" android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    </manifest>
    ```
    If you are having trouble with this, you can read more at this [GitHub Issue](https://github.com/facebook/react-native/issues/5886).

## Upgrade Version Code in React Native

If you want to push an update to Google Play, you must increment the **version code** of your app. This can be found in **android/app/build.gradle** as:
```xml
android {
    ...

    defaultConfig {
        ...
        versionCode 2
        versionName "1.0"
    }
}
```
