---
author: Christoph Michel
date: 2016-12-07
layout: ProgressReport
route: /how-to-set-initial-props-in-react-native/
disqus_identifier: how-to-set-initial-props-in-react-native
slug: how-to-set-initial-props-in-react-native
title: How to set appParams in React-Native
description: A post about setting and reading launch arguments for React Native apps.
categories:
- React Native
---

When you launch your app in React Native and look at the console you 'll always see this:

`infoLog Running application "App" with appParams: {"initialProps":{},"rootTag":1}. __DEV__ === true, ...` 

This post will show you how to access **appParams** and set custom `initialProps` in Android.

## Accessing initialProps from JS
Reading the app parameters is easy. They are injected as `props` to your main component registered through:

```js
AppRegistry.registerComponent('App', () => App)
```

You can access them like any other `props` in your `App` Component:

```js
class App extends Component {
  static propTypes = {
    // You can define propTypes for keys in `initialProps` here
    alarmID: PropTypes.string,
  }
  constructor(props) {
    super(props)
    console.log(props.rootTag)
    console.log(props.alarmID)
  }
}
```

Note that `initialProps` is _unpacked_ first before passing its contents as `props`. So for the above code your `appParams` structure needs to look like this:

```json
{"initialProps":{"alarmID":"123"},"rootTag":1}
```


## Setting custom initialProps from Java
Say, your React Native app is launched by another app, or started by an alarm or notification at a specific time,
and you want to check who is repsonsible for the app launch.
We can pass extra information to the **Launch Intent**, read it from our `MainActivity.java` which then bridges them for use in our `App.js`.

Here's the way I launch my app through my
[react-native-app-launcher](https://github.com/MrToph/react-native-app-launcher/blob/83450c85fb2dd64437b44ffc9d84e580699197cf/android/src/main/java/io/cmichel/appLauncher/AlarmReceiver.java) library
when an alarm timer goes off:

```java
private void launchApplication(Context context, String alarmID) {
    String packageName = context.getApplicationContext().getPackageName();
    Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);

    launchIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
    launchIntent.putExtra("alarmID", alarmID);

    context.startActivity(launchIntent);
    Log.i("ReactNativeAppLauncher", "AlarmReceiver: Launching: " + packageName);
}
```

Extracting the `alarmID` in `MainActivity.java` of your React Native project is a bit more complicated.
Since [React Native Version 0.33.0](https://github.com/facebook/react-native/commit/4963a37e804c0385af13d86424c74d2fdefb73f6), you have to create a `ReactActivityDelegate`
overwriting the `getLaunchOptions` method:

```java
public class MainActivity extends ReactActivity {

    @Override
    protected String getMainComponentName() {
        return "App";
    }

    public static class AlarmActivityDelegate extends ReactActivityDelegate {
        private static final String ALARM_ID = "alarmID";
        private Bundle mInitialProps = null;
        private final @Nullable Activity mActivity;

        public AlarmActivityDelegate(Activity activity, String mainComponentName) {
            super(activity, mainComponentName);
            this.mActivity = activity;
        }

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            // bundle is where we put our alarmID with launchIntent.putExtra
            Bundle bundle = mActivity.getIntent().getExtras();
            if (bundle != null && bundle.containsKey(ALARM_ID)) {
                mInitialProps = new Bundle();
                // put any initialProps here
                mInitialProps.putString(ALARM_ID, bundle.getString(ALARM_ID));
            }
            super.onCreate(savedInstanceState);
        }

        @Override
        protected Bundle getLaunchOptions() {
            return mInitialProps;
        }
    };

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new AlarmActivityDelegate(this, getMainComponentName());
    }
}
```

Everything defined in `AlarmActivityDelegate.mInitialProps` is now passed as `initialProps` to `App.js` and can be read from JavaScript as described in
[Accessing initialProps from JS](#accessing-initialprops-from-js).
You can then fire some actions in `App`'s `componentWillMount` to handle state.
