---
author: Christoph Michel
date: 2016-11-27
disqus_identifier: how-to-create-react-native-android-library
layout: Post
route: /how-to-create-react-native-android-library/
slug: how-to-create-react-native-android-library
title: How to create a React Native Android Library
featured: 
categories:
- React Native
---

Sometimes you need to create a custom _native_ module to do some task that you cannot solve with the standard **React Native** components.
I was recently in this situation and getting started doing this can be hard, especially if you have no prior native Android development experience.
This tutorial is targeted towards this group and shows how to create a **React Native Android Libarry**.

First of all, there are two ways to use Java with the Android SDK in your React Native app. You can either put it directly into your existing app by adding **Java classes**
to your `android/app/src/main/*` folder and use them from your `MainActivity`/`MainApplication`.  
The second way is to create an **Android Library**, which is the way any NPM **react-native** packages (that go beyond JavaScript) work.
The benefit is evident: It is **reusable**.
We will focus on this approach.

## Creating a React Native Android Library
Although the [React Native documentation](http://facebook.github.io/react-native/docs/native-modules-android.html) explains the interaction between JavaScript and the Android SDK,
it doesn't explain which files are needed for a library and how the build process using _gradle_ works.
There are some things you need to add in order to link the **React Native codebase** in a way that both _gradle_ and Android Studio don't throw errors.

The easiest way to start is by using an existing minimal project.
I created an [Android Library Boilerplate](https://github.com/MrToph/react-native-android-library-boilerplate) that you can just clone to get started. It has the two necessary classes (a `Package` and a `Module`) and
implements the Toast functionality from the [React Native Tutorial](http://facebook.github.io/react-native/docs/native-modules-android.html).
Here are its **install instructions**:

### Getting started
1. Clone the project
2. Customize the project name by doing the following:
    * Edit `author` and `name` in `package.json`
    * Customize the Java package name (`com.domain.package`) as follows:
        1. Modify it in `android/src/main/AndroidManifest.xml`.
        2. Rename the folders starting from `android/src/main/java` to match your package name.
        3. Adjust `package io.cmichel.boilerplate;` in the top of the `Module.java` and `Package.java` files in `android/src/main//java/package/path` to match it.
    * Edit the name of your module in `index.android.js`

        ```java
        @Override
        public String getName() {
            return "Boilerplate";
        }
        ```

### Installing it as a library in your main project
You're now ready to install it in your main React Native application and test the `Toast` functionality to see if everything works.
For this, you need to install it the same way as any other **React Native Library**.
There are many ways to do this, here's the way I do it:

1. Push it to _GitHub_.
2. Install it via npm in your main project.

    ```npm install --save git+https://github.com/MrToph/react-native-android-library-boilerplate.git```

3. Link the library:
    * Add the following to `android/settings.gradle`:
    
        ```default
        include ':react-native-android-library-boilerplate'
        project(':react-native-android-library-boilerplate').projectDir = new File(settingsDir, '../node_modules/react-native-android-library-boilerplate/android')
        ```

    * Add the following to `android/app/build.gradle`:
        ```default
        ...

        dependencies {
            ...
            compile project(':react-native-android-library-boilerplate')
        }
        ```
    * Add the following to `android/app/src/main/java/**/MainApplication.java`:
        ```java
        package com.motivation;

        import io.cmichel.boilerplate.Package;  // add this for react-native-android-library-boilerplate

        public class MainApplication extends Application implements ReactApplication {

            @Override
            protected List<ReactPackage> getPackages() {
                return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new Package()     // add this for react-native-android-library-boilerplate
                );
            }
        }
        ```

### Testing
You can test whether the linking worked by importing the library and using its `Toast` functionality:
Simply `import/require` it by the name defined in your library's `package.json`:

```javascript
import Boilerplate from 'react-native-android-library-boilerplate'
Boilerplate.show('Boilerplate runs fine', Boilerplate.LONG)
```

### Development
For development purposes, I directly work with the copy installed in the **`node_modules`** folder to avoid having to `push` and `pull` from _GitHub_ all the time.
This might seem a bit hackish, but works really well. If you want to publish it, just copy the `.java` source files over to _GitHub_.
You probably want to make use of Android Studio's _AutoComplete_ and _AutoImport_ features, so start by importing your **react native library** into _Android Studio_:
1. Start `Android Studio` and select `File -> New -> Import Project` and select the **android (!)** folder of the library.
2. If there's the `Do you want to use the gradle wrapper` prompt, click on `Yes`.
3. If you get a `Plugin with id 'android-library' not found` Error, you need to install `android support repository` through the SDK Manager first.

Depending on your _gradle_ settings, you might encounter a `gradle version: Please fix the project's Gradle settings` Error. Clicking on `Fix Gradle Error and re-import project` works fine for me.

If you're app crashes because you did something stupid in Java, but can't figure out where it went wrong, you can run `adb logcat > debug.log` to inspect the error stacktrace.