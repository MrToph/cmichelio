---
title: How to access Google Spreadsheets with Node
featured: /how-to-access-google-spreadsheet-with-node/featured.png
date: 2018-02-25
categories:
- Tech
- Node
medium:
- Programming
- javascript
- es6
- Development
steem:
- steemdev
- javascript
- programming
- dev
- coding
---

For simple applications, you don't always need a powerful backend with complex query mechanisms.
It's often enough to store the information in a file or spreadsheet.
Using spreadsheets has the additional advantage that even non-developers understand and can make changes to the data and maintain your app.
I'll show you how you can use private Google Spreadsheets to store your data and make the securely accessible from within your Node app.

## Creating a service account
There are several ways to programmatically connect to a private Google Spreadsheet.
If you ever implemented client authorization through Google's OAuth2 login, you probably know how hard and painful it can be to get such a simple thing as a login working.
Luckily, there is an easy way to access Google Spreadsheets through [**Google Service Accounts**](https://developers.google.com/identity/protocols/OAuth2ServiceAccount).

1. Go to the [Google Developer Console](https://console.developers.google.com/permissions/serviceaccounts) IAM & Admin settings.
2. Create a new project or edit an existing one.

![Create Project](./create-project.png)

3. Click on "_Create a service account_". Give the service account a name. This will determine its "_Service Account ID_" which is the email your service account will have. Enter the role of "_Project_" -> "_Editor_". Tick "_Furnish a new private key_". Click "_Create_". The **credentials will now be downloaded as a JSON file**.

![Create Service Account](./create-service-account.gif)

Now the service account is created, but we still need to enable the Google Drive API for the project in order to access Spreadsheets.
4. Go to the APIs & Services Page of the project. Search for **Google Drive API** and click on enable.


![Enable Google Drive API](./enable-google-drive-api.gif)

### Share the Spreadsheet with the service account
The last step is to share the spreadsheet with the Service Account ID `...@gserviceaccount.com`. The service account will automatically accept the invitation.

![Share Spreadsheet with Service Account](./share-spreadsheet.png)

## Accessing the Spreadsheet with Node
We will use the [`google-spreadsheet`](https://www.npmjs.com/package/google-spreadsheet) NPM package.
Install it in your project by running:

```
npm install --save google-spreadsheet
```

Rename the credentials file you downloaded when creating the Service account to `service-account.json`, and place it in the NPM root directory. (If it's a git repo, you should add it to your `.gitignore` because the private key should not be leaked.)

The `service-account` should contain info about the project, the service account, and its private key:

```json
{
  "type": "service_account",
  "project_id": "silver-ripple-196315",
  "private_key_id": "d3aea59cefcf6728419b98cdec2ede229880f1ed",
  "private_key": "-----BEGIN PRIVATE KEY-----\n[...]\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@silver-ripple-196315.iam.gserviceaccount.com",
  "client_id": "111625843692563759440",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/service-account%40silver-ripple-196315.iam.gserviceaccount.com"
}
```

Now, let's use `google-spreadsheet` to connect to our spreadsheet with the service worker:

```javascript
const GoogleSpreadsheet = require('google-spreadsheet')
const { promisify } = require('util')

const credentials = require(`../service-account.json`)

const SPREADSHEET_ID = `15k0AIsePcdbLNglRyhm3slOvagFdYQcgLYS4aw3z-kM`
async function accessSpreadsheet() {
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID)
  await promisify(doc.useServiceAccountAuth)(creds)
  const info = await promisify(doc.getInfo)()
  console.log(`Loaded doc: ` + info.title + ` by ` + info.author.email)
  const sheet = info.worksheets[0]
  console.log(
    `sheet 1: ` + sheet.title + ` ` + sheet.rowCount + `x` + sheet.colCount
  )
}

accessSpreadsheet()
```

Some explanation here: The `SPREADHSHEET_ID` is part of the google spreadsheet URL, like so `https://docs.google.com/spreadsheets/d/15k0AIsePcdbLNglRyhm3slOvagFdYQcgLYS4aw3z-kM/`.

I'm using [`promisify`](http://2ality.com/2017/05/util-promisify.html) to convert the Node callback-style functions from `google-spreadsheet` to return a `Promise` instead. This makes the code much more readable, without `Promises` and `async / await` you'll end up with deeply nested code blocks.

### Reading rows
With the `sheet` object, we can read rows like so:

```javascript
const rows = await promisify(sheet.getRows)({
    offset: 5,
    limit: 20,
    orderby: 'col2'
})
```

Note that this is just a wrapper for Google Drive API's [list-based feed](https://developers.google.com/sheets/api/v3/data):
> "The list feed contains all rows after the first row up to the first blank row. The first blank row terminates the data set."

Which means you won't get the header row with the `getRows` function and as soon as there's an empty row, you don't get any rows after it.
That's why I recommend using the `getCells` function instead which gives you full control over what you want to read.

```javascript
const cells = await promisify(sheet.getCells)({
    'min-row': 1,
    'max-row': 5,
    'min-col': 1,
    'max-col': 2,
    'return-empty': true,
})
for (const cell of cells) {
    console.log(`${cell.row},${cell.col}: ${cell.value}`)
}

var cell = cells[0];

// cells have a value, numericValue, and formula
// updating `value` is "smart" and generally handles things for you
cell.value = 123;
cell.value = '=A1+B2'
await cell.save(); //async

// bulk updates make it easy to update many cells at once
cells[0].value = 1;
cells[1].value = 2;
cells[2].formula = '=A1+B1';
await sheet.bulkUpdateCells(cells); //async
```

This will read the first two columns of rows `1` to `5`, and return the individual cells. You can also write to the individual cells and save the updates. This way, you can easily read and write to your spreadsheet backend.
