---
title: How to deploy a create-react-app with github-actions
date: 2020-02-16
image: ./featured.png
categories:
- Tech
- EOS
- learneos
medium:
- Programming
- blockchain
- javascript
- react
steem:
- programming
- utopian-io
- steemdev
- react
---

Here's a quick guide on how to deploy a CRA (create-react-app) to GitHub pages using GitHub actions.
We'll create a GitHub Action workflow that runs the build command and then deploys the `build` directory by pushing it to the `gh-pages` branch.

## Setup

### 1. Prefix URLs
GitHub pages urls looks like `user.github.io/repo-name`, so we need to make sure all our relative URLs are prefixed by `/repo-name`. Using create-react-app, it's enough to add `"homepage": "/repo-name",` to the `package.json`. The `build` command will automatically take care of the rest.

### 2. Add deployment key

Deploying to GitHub pages means pushing the `build` directory to the `gh-pages` branch. Currently, pushes using default GitHub Actions credentials [do not trigger a GitHub pages rebuild](https://github.community/t5/GitHub-Actions/Github-action-not-triggering-gh-pages-upon-push/m-p/26869).
Meaning, we need to **set up a deployment key for the repo first** that can be used by the GitHub action.
I use the same deployment key for the gh-pages deployment actions across all my repos.
You can create a new SSH public/private key pair using this command:

```bash
cd ~/.ssh
ssh-keygen -t rsa -b 4096 -C "$(git config user.email)" -f gh-pages-actions -N ""
```

1. Following the [Getting Started section of this gh-pages Action](https://github.com/peaceiris/actions-gh-pages#getting-started) we **add a new write-access** deployment key** in the `/repo/settings/keys` section pasting our **public key** from the `.pub` file.


![Add Deployment key](https://raw.githubusercontent.com/peaceiris/actions-gh-pages/master/images/deploy-keys-1.jpg)

2. We need to make the private key accessible to our GitHub action. To do this add the corresponding **secret key** in the `repo/settings/secrets` section. 
  Make sure to name it `ACTIONS_DEPLOY_KEY`.

![Add Deployment key](https://github.com/peaceiris/actions-gh-pages/blob/master/images/secrets-1.jpg?raw=true)

## GitHub Action

Now all that's left is to create a new `.github/workflows/deploy.yml` workflow file and paste the following GitHub action YAML code:

```yml
name: Deployment
on:
  push:
    branches:
      - master
jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [12.x]
    steps:
    - uses: actions/checkout@v1
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}
    - name: Install Packages
      run: npm install
    - name: Build page
      run: npm run build
    - name: Deploy to gh-pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}
        publish_dir: ./build
```

On each push to the `master` branch it performs the following tasks:

1. Checkout the code from the master push
2. Install Node v12
3. Run `npm install`
4. Run `npm build` which creates the `build` folder.
5. Deploy the `./build` folder to gh-pages using the deploy key in the `secrets.ACTIONS_DEPLOY_KEY` variable.

To test the deployment process push this workflow file to master.
