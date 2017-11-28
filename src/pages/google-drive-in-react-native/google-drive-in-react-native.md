---
author: Christoph Michel
comments: true
date: 2017-02-21
disqus_identifier: google-drive-in-react-native
layout: Post
route: /google-drive-in-react-native/
slug: google-drive-in-react-native
title: Google Drive in React Native
featured: https://github.com/apptailor/react-native-google-signin/raw/master/img/demo-app.gif
categories:
- Tech
- React Native
- Authentication
- Redux
---

I'll show you **how to use Google Drive in React Native** to store or get your app data.
I use it as a consistent storage of user-specific data within my apps - especially as an alternate option to the vanishing external SD cards.

## Google Login
The first step is to set up the _Google Login_ and authorize your app to use the **Google Drive** service. There already is a React Native module for that: [react-native-google-signin](https://github.com/devfd/react-native-google-signin)

It comes with the Sign-In Button, the Login form and the _Grant Access_ modal.

![React Native Google Drive](https://github.com/apptailor/react-native-google-signin/raw/master/img/demo-app.gif)

Bad news is, it's [not maintained anymore](https://github.com/devfd/react-native-google-signin/issues/186) and doesn't work with the newest React Native version.
The Google Sign-In module I'm using right now is the [fork by joonhocho](https://github.com/joonhocho/react-native-google-sign-in).

Before you can start using the Sign-in service, you need to setup a Google Project in the Firebase Console (if you haven't already) and [get the configuration file](https://developers.google.com/identity/sign-in/android/start-integrating).

**Note that you cannot use it on an emulator as we use version 10 of Google Play Services / Firebase which no emulator supports right now.** Make sure to test it on your device or you'll get a [`Google Play services out of date. Requires 10084000`](http://stackoverflow.com/questions/41100106/google-play-services-out-of-date-requires-10084000-but-found-9879470-cant-upd) error.

## Login & Access-Token
Once everything is set up, you should be able to sign in and request the [Google Drive App Data](https://developers.google.com/drive/android/appfolder) scope which we will need to access the (hidden) folder specific to our app. Using [react-native-google-sign-in](https://github.com/joonhocho/react-native-google-sign-in) on Android, it'll look like this:
(You can check out the options on GitHub.)

```javascript
export const configureGoogleSignIn = async () => GoogleSignIn.configure({
  // https://developers.google.com/identity/protocols/googlescopes
  scopes: ['https://www.googleapis.com/auth/drive.appdata'],
  shouldFetchBasicProfile: true,
  // serverClientID: '484169055555-q2hui34hui23h4u23h4ui23h4ui2h34u.apps.googleusercontent.com',  // I didn't need to set these for appdata here
  // offlineAccess: false,
  // forceCodeForRefreshToken: false,
})

onSignInPress = async () => {
    await configureGoogleSignIn()
      .then(() => GoogleSignIn.signInPromise()
                  // dispatch a redux-thunk with the accessToken once signed in
                  .then(userProfile => this.props.dispatchGoogleDrive(userProfile.accessToken))
      .catch(err => console.log('configureGoogleSignIn', err))
  }
```

The request should return with some user info `userProfile` and an **access token** which we can now use for the Google Drive API.

## Google Drive API v3 with fetch
There is a [node.js googleapi client](https://github.com/google/google-api-nodejs-client) and a [Google API JavaScript Client Library](https://developers.google.com/api-client-library/javascript/start/start-js) which make accessing APIs easier, but I haven't tested hooking them up with the `accessToken` and using them in React Native.
Instead, we will be communicating with the **Google Drive API v3** straight through HTTP using `fetch` which makes constructing requests really simple.

We need to set the `Authorization-Header` to `` `Bearer ${apiToken}` ``, and the `Content-Type` to `` `multipart/related; boundary=${boundaryString}` `` for uploading files with their _meta data_ according to [the upload example](https://developers.google.com/drive/v3/web/multipart-upload).

[This gist](https://gist.github.com/MrToph/2954448ddb1f8cdd1c162ef5e162e869) shows a fully functioning _download_ and _create+update_ example with Google Drive API v3 and `fetch`:

```javascript
import GoogleSignIn from 'react-native-google-sign-in'

const url = 'https://www.googleapis.com/drive/v3'
const uploadUrl = 'https://www.googleapis.com/upload/drive/v3'

const boundaryString = 'foo_bar_baz' // can be anything unique, needed for multipart upload https://developers.google.com/drive/v3/web/multipart-upload

let apiToken = null

export const configureGoogleSignIn = async () => GoogleSignIn.configure({
    // https://developers.google.com/identity/protocols/googlescopes
  scopes: ['https://www.googleapis.com/auth/drive.appdata'],
  shouldFetchBasicProfile: true,
})

export function setApiToken(token) {
  apiToken = token
}

function parseAndHandleErrors(response) {
  if (response.ok) {
    return response.json()
  }
  return response.json()
    .then((error) => {
      throw new Error(JSON.stringify(error))
    })
}

function configureGetOptions() {
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${apiToken}`)
  return {
    method: 'GET',
    headers,
  }
}

function configurePostOptions(bodyLength, isUpdate = false) {
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${apiToken}`)
  headers.append('Content-Type', `multipart/related; boundary=${boundaryString}`)
  headers.append('Content-Length', bodyLength)
  return {
    method: isUpdate ? 'PATCH' : 'POST',
    headers,
  }
}

function createMultipartBody(body, isUpdate = false) {
  // https://developers.google.com/drive/v3/web/multipart-upload defines the structure
  const metaData = {
    name: 'data.json',
    description: 'Backup data for my app',
    mimeType: 'application/json',
  }
  // if it already exists, specifying parents again throws an error
  if (!isUpdate) metaData.parents = ['appDataFolder']

  // request body
  const multipartBody = `\r\n--${boundaryString}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`
  + `${JSON.stringify(metaData)}\r\n`
  + `--${boundaryString}\r\nContent-Type: application/json\r\n\r\n`
  + `${JSON.stringify(body)}\r\n`
  + `--${boundaryString}--`

  return multipartBody
}

// uploads a file with its contents and its meta data (name, description, type, location)
export function uploadFile(content, existingFileId) {
  const body = createMultipartBody(content, !!existingFileId)
  const options = configurePostOptions(body.length, !!existingFileId)
  return fetch(`${uploadUrl}/files${existingFileId ? `/${existingFileId}` : ''}?uploadType=multipart`, {
    ...options,
    body,
  })
    .then(parseAndHandleErrors)
}

// Looks for files with the specified file name in your app Data folder only (appDataFolder is a magic keyword)
function queryParams() {
  return encodeURIComponent("name = 'data.json' and 'appDataFolder' in parents")
}

// returns the files meta data only. the id can then be used to download the file
export function getFile() {
  const qParams = queryParams()
  const options = configureGetOptions()
  return fetch(`${url}/files?q=${qParams}&spaces=appDataFolder`, options)
    .then(parseAndHandleErrors)
    .then((body) => {
      if (body && body.files && body.files.length > 0) return body.files[0]
      return null
    })
}

// download the file contents given the id
export function downloadFile(existingFileId) {
  const options = configureGetOptions()
  if (!existingFileId) throw new Error('Didn\'t provide a valid file id.')
  return fetch(`${url}/files/${existingFileId}?alt=media`, options)
    .then(parseAndHandleErrors)
}
```

You can then use the following _redux-thunk_ to download the file:

```javascript
export const dispatchGoogleDrive = apiToken => (dispatch) => {
  dispatch({ type: ActionNames.dataRestoreStart })
  setApiToken(apiToken)
  return getWorkoutFile()
    .then((file) => {
      if (file) {
        return downloadFile(file.id)
      }
      throw new Error('No existing backup file found.')
    })
    .then((data) => {
      dispatch({
        type: ActionNames.dataRestoreFinished,
        payload: data,
      })
    })
    .catch(err => dispatch({ type: ActionNames.dataRestoreError, payload: err }))
}

```

Of course this doesn't only work with _Google Drive API_ - you can use the same idea to access any _Google API_.
