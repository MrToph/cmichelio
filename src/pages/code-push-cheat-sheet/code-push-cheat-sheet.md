---
author: Christoph Michel
comments: true
date: 2017-07-30
disqus_identifier: code-push-cheat-sheet
layout: Post
route: /code-push-cheat-sheet/
slug: code-push-cheat-sheet
title: React Native CodePush Cheat Sheet
featured: https://microsoft.github.io/code-push/assets/images/codepush_navbar_logo.svg
categories:
- Tech
- React Native
- CodePush
---

![React Native CodePush Cheat Sheet](https://microsoft.github.io/code-push/assets/images/codepush_navbar_logo.svg)

[Reference](https://github.com/Microsoft/react-native-code-push)

## [Getting Started](https://microsoft.github.io/code-push/docs/getting-started.html)
```bash
npm install -g code-push-cli
```

```bash
code-push register
```

```bash
code push app add MyApp-Android android react-native
```

### [In React-Native app](https://microsoft.github.io/code-push/docs/react-native.html#link-4)
```bash
yarn add react-native-code-push@latest
```

```bash
react-native link react-native-code-push
```

```bash
react-native run-android --variant=releaseStaging
```
([Need to configure releaseStaging in `build.gradle`](https://github.com/Microsoft/react-native-code-push#android))

## Updating Apps
#### Retrieve list of your apps
```bash
code-push app ls
```

#### Retrieve keys for app
```bash
code-push deployment ls MyApp-Android -k
```

#### [Release an update to Staging](https://github.com/Microsoft/react-native-code-push#releasing-updates)
```bash
code-push release-react MyApp-Android android
```

#### [Promote an update to Production](https://github.com/Microsoft/react-native-code-push#multi-deployment-testing)
```bash
code-push promote MyApp-Android Staging Production
```

#### Check Deployment History
```bash
code-push deployment history MyApp-Android Staging
```

## JavaScript Integration
```javascript
import React, { Component } from 'react'
import CodePush from 'react-native-code-push'
class MyApp extends Component { }

const codePushOptions = { 
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME, 
  installMode: codePush.InstallMode.ON_NEXT_RESUME 
}

export default codePush(codePushOptions)(MyApp);
```

## More Resources
* [Github JS API](https://github.com/Microsoft/react-native-code-push/blob/master/docs/api-js.md)
* [Microsoft React Native SDK](https://microsoft.github.io/code-push/docs/react-native.html)
* [Tutorial by samwize](http://samwize.com/2017/01/19/guide-to-integrating-codepush-for-ios-react-native-project/)