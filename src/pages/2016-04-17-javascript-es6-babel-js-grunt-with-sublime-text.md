---
author: Christoph Michel
comments: true
date: 2016-04-17 18:35:09+00:00
disqus_identifier: 259 http://cmichel.io/?p=259
layout: Post
route: /javascript-es6-babel-js-grunt-with-sublime-text/
slug: javascript-es6-babel-js-grunt-with-sublime-text
title: Javascript ES6 + Babel.js + Grunt with Sublime Text
categories:
- Tech
---
I'll show you how to setup a Javascript ES6 workflow with Sublime Text 3.
To be able to use ES6 in all browsers we will use Babel.js which is essentially a compiler from ES6 to ES5.
We also use Grunt, a javascript task runner, to automate this compilation process.


### 1. Download Node.js

You need to download [node.js](https://nodejs.org) for its node package manager (**npm**). With it we can easily install babel and grunt.

### 2. Install Grunt CLI

Open a terminal/command prompt and type in:
```javascript
npm install -g grunt-cli
```

This will globally install the grunt interface.

### 3. Install Sublime Package for npm

To use npm from within Sublime Text we need to install the npm package.
In Sublime Text hit **CTRL + SHIFT + P** and type in **"Package Control: Install Package"**, then type in **"npm"** and install it.
When you hit CTRL + SHIFT + P now you should be able to search for list of npm commands.

### 4. Create package.json file for your project

Start a new project by creating a new folder. In this root folder create a file called **"package.json"** with the following contents:
```javascript
{
  "name": "yourProjectName",
  "version": "0.1.0",
  "devDependencies": {
    "babel-preset-es2015": "^6.6.0",
    "grunt": "^1.0.1",
    "grunt-babel": "^6.0.0",
    "grunt-contrib-copy": "^1.0.0",
    "grunt-contrib-uglify": "^1.0.1"
  },
  "babel": {
    "presets": [
      "es2015"
    ]
  }
}

```

The package.json file is used by **npm** to handle all the packages (dependencies) used for your project.
(In our case babel, grunt and grunt-plugins.)


### 5. Install all the dependencies

In sublime go to your folder and hit **CTRL + SHIFT + P** and execute** "npm: Install Saved Package"**. This will install all the dependencies specified by "devDependencies" in the package.json file.

### 6. Create gruntfile.js

In your project root folder besides package.json, create a gruntfile.js file with the following contents:
```javascript
module.exports = function(grunt) {

grunt.initConfig({
    babel: {
        options: {
            "sourceMap": true
        },
        dist: {
            files: [{
                "expand": true,
                "cwd": "src/js",
                "src": ["**/*.jsx"],
                "dest": "src/js-compiled/",
                "ext": "-compiled.js"
            }]
        }
    },
    uglify: {
        all_src : {
            options : {
              sourceMap : true,
              sourceMapName : 'src/build/sourceMap.map'
            },
            src : 'src/js-compiled/**/*-compiled.js',
            dest : 'src/build/all.min.js'
        }
    }
});

    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask("default", ["babel", "uglify"]);
};
```

The gruntfile.js file specifies which tasks grunt should automate, here the babel block defines that we want to take all files from _"src/js"_ that end with _".jsx"_ (written in ES6) and use babel to compile them to ES5 files into _"src/js-compiled"_ with the name extension _"-compiled.js"_. The source map is specified to still be able to debug these files in ES6.
The next command that grunt automates is the "uglify" block which puts all these freshly compiled files from _"src/js-compiled"_ into just a single one named _"src/build/all.min.js"_.

![Folder structure for sublime project with Babel and Grunt](http://cmichel.io/assets/2016/04/folder-structure-sublime-babel-grunt.png)
### 7. Finished: The workflow
You code ES6 javascript files in _"src/js"_ ending with _".jsx"_. Then you hit **CTRL + SHIFT + P** and run **"grunt" -> "default"** and it will do the automation defined above ending with a single ES5 file in _"src/build"_.

### 8. ES6 .jsx syntax highlighting in Sublime Text
You might notice that the .jsx files don't have the usual .js syntax highlighting. To fix it we need to install the sublime package _"Babel"_.
Hit **CTRL + SHIFT + P** do **"Package Control: Install Package"** and install **"Babel"**.
Now open any .jsx file and in Sublime Text do:

`View -> Syntax -> Open all with current extension as ... -> Babel -> Javascript (Babel)`
