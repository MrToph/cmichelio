---
author: Christoph Michel
comments: true
date: 2016-10-24 16:25:35+00:00
disqus_identifier: 765 http://cmichel.io/?p=765
layout: Post
route: /set-react-native-app-icon-when-minimized/
slug: set-react-native-app-icon-when-minimized
title: Set React Native App Icon When Minimized
featured: /assets/2016/10/react-native-app-icon-minimized.jpg
categories:
- Tech
- React Native
---

**React Native** uses your custom app icon `ic_launcher.png` specified in **"android/app/src/main/res/mipmap-*/ic_launcher.png"** as the launch icon. However, when you minimize your app, on some devices the default android logo is displayed instead of your custom app icon. It is supposed to use your launch icon unless specified otherwise, so this is most likely a bug in either Android, React Native, or the device I tested on.

![React Native App Icon Minimized](http://cmichel.io/assets/2016/10/react-native-app-icon-minimized.jpg)

## React Native Custom App Icon

The solution is to move your app icon to the [**drawable** folder](https://developer.android.com/guide/practices/screens_support.html#DesigningResources) instead of the **mipmap** one. Just create a copy of all the **mimap-*** folders from **"android/app/src/main/res"** in the same directory and name the copies **drawable-***. The _drawable_ folder should now also contain your app icon as **ic_launcher.png**.

### Change the icon path to _drawable_

We now need to tell Android to use the _ic_launcher.png_ inside the drawable folder. Open **"android/app/src/main/AndroidManifest.xml"** and modify the **android:icon** line:
 
```xml
<application
      ...
      android:icon="@drawable/ic_launcher"
      ...
</application>
```

After recompiling, your custom app icon will be used as both the launch icon and as the logo when minimized.

![React Native App Icon Drawable](http://cmichel.io/assets/2016/10/react-native-app-icon-drawable.png)
