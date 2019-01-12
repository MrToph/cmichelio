---
title: How to write pandoc plugins in Nodejs
date: 2019-01-12
featured: /how-to-write-pandoc-plugins-in-nodejs/featured.png
categories:
- Tech
medium:
- pandoc
- Programming
- Node
- Nodejs
steem:
- utopian-io
- steemdev
- programming
---

[Pandoc](https://pandoc.org/) is a great tool to transform text formats yinto
other text formats. I use it to create PDF / HTML / epub / mobi versions out of
my book from my Markdown files.

It comes with _plugins_ (**pandoc filters**) that allow transforming the AST
(abstract syntax tree) of your text files, so you can build your own syntax and
make it do pretty much anything. The idea is similar to other AST transformation
frameworks that you might know, such as
[jscodeshift](https://github.com/facebook/jscodeshift) or
[remark](https://github.com/remarkjs/remark). While pandoc and its plugins are
mainly written in Haskell, you can also write them in JavaScript using Node.js.

We will write and test a plugin that allows including source code from your file
system in code blocks. The full-featured plugin is available on
[GitHub as `pandoc-code-file-filter`](https://github.com/MrToph/pandoc-code-file-filter).

## Development

A pandoc plugin is a binary file that can be passed as an option to running the
pandoc command:

```
pandoc <args> --filter path/to/pandoc-filter-binary
```

Which means we will start by setting up an `NPM` project and creating a
`bin/filter.js` file with the `#!/usr/bin/env node` preamble. We need to install
`pandoc-filter-promisified` which includes the **pandoc bindings**.

Our binary file uses this library and applies an `action` function to whatever
pandoc sends to our filter.

```js
#!/usr/bin/env node

const pandoc = require('pandoc-filter-promisified')
const action = require('../src/index.js')

pandoc.stdio(action)
```

> If you want to publish your pandoc-filter through NPM, you need to reference
> the binary file in the package.json as `"bin": { "pandoc-code-file-filter":
> "bin/filter.js"}`

The main part of our logic will be implemented in our `src/index.js` file. The
entry point of a pandoc plugin is an `action` file. It is passed each block of
the AST and some meta information about the conversion happening.

```js
const fs = require('fs')
const path = require('path')
const pandoc = require('pandoc-filter-promisified')

const { CodeBlock } = pandoc

async function action(elt, pandocOutputFormat, meta) {
  if (elt.t === `CodeBlock`) {
    // console.warn(JSON.stringify(elt, null, 4));
    const [headers, content] = elt.c

    const includePath = getIncludeHeader(headers)

    // it's a normal code block, no need to do anything
    if (!includePath) return

    // filter out the include value if another filter processes this code block
    const newHeaders = filterOutOwnHeaders(headers)
    let newContent = replaceWithFile(include)

    return CodeBlock(newHeaders, newContent)
  }
}

module.exports = action
```

The `elt` object describes a node of the syntax tree. Its type can be checked
with the `t` key and its header and content can be read by accessing the `c`
key. Admittedly, these names and keys look like someone who spent too much time
in Haskell came up with them. Also, there is no official documentation for these
types. I found it easiest to check the source code of
[pandoc-filter-node](https://github.com/mvhenderson/pandoc-filter-node/blob/master/index.js#L185)
and log the results.

Here, we check if the type is a `CodeBlock` and check if an `include` is
specified in the headers.

```js
function filterOutOwnHeaders(headers) {
  const [_, classes, keyValuePairs] = headers

  const newKeyValuePairs = keyValuePairs.filter(
    ([key, value]) => key !== `include`
  )
  const newHeaders = [headers[0], headers[1], newKeyValuePairs]

  return newHeaders
}

function getIncludeHeader(headers) {
  const [_, classes, keyValuePairs] = headers

  const keyValuePair = keyValuePairs.find(([key, value]) => key === `include`)

  if (!keyValuePair) return false
  return keyValuePair.value
}
```

This would match the following code block in Markdown:

````
```{include=test.js}
```
````

After extracting the `include` information, we can read the file using Node.js and replace the `CodeBlock`'s content with the file content.

```js
function replaceWithFile(include) {
  if (!fs.existsSync(include))
    throw new Error(
      `pandoc-code-file-filter: File does not exist: "${path.resolve(include)}"`
    )

  const fileContent = fs.readFileSync(include, 'utf8')
  return fileContent
}
```

Replacing the AST is done by simply returning a new node in the `action` function.
We call the `CodeBlock` constructor with the new headers (old headers minus our `include` header) and the new file content.

## Testing

To test if our filter works, we can write some [jest tests](https://jestjs.io/).

Our example Markdown file will have the following contents:

````
``` {.javascript include=./test/examples/example.js}
Replace me
``` 
````

The `example.js` file with the content we want to include is just a normal JS file.

We can now run pandoc using our filter on the Markdown file and verify pandoc's output using jest's snapshot testing.
Create the test in `test/index.test.js`:

```js
const { execSync } = require("child_process");

function execPandocOnFile(fileName) {
  const stdout = execSync(
    `pandoc -s -t markdown test/examples/${fileName} --filter bin/filter.js`
  );
  return String(stdout);
}

test("replaces code block content with file content", () => {
  const output = execPandocOnFile(`example.md`);
  expect(output).toMatchSnapshot();
});
```

Here, I ran pandoc to create another Markdown file as the output.
The new Markdown output is saved as a snapshot test, which makes it a lot easier as a human to verify than the AST.

You can now publish the pandoc filter on NPM and people can install it with `npm -g your-pandoc-filter`.

And that's all you need to know to get started with developing your own _pandoc plugins_. ✨
