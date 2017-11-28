---
author: Christoph Michel
date: 2016-11-17
disqus_identifier: use-react-in-markdown
layout: Post
route: /how-to-use-react-in-markdown/
slug: how-to-use-react-in-markdown
title: How to use React in Markdown
featured: 
categories:
- React
- Phenomic
---

In this post I 'll talk about how to use **React components in Markdown**. First of all, why would you want to do that? The reason is I'm writing posts in Markdown and 
use a [static site generator](/wordpress-to-static-site-generator/) to convert them to HTML pages, so it would be useful if I could insert React components _directly_
in my Markdown writeup. This allows **mixing React with Markdown** in a single file.
For example,
if I talk about some data in my posts and want to render a chart with this data, it would be nice if my writeup could look something like this:

```Markdown
## Markdown Title
Here is a React component in _Markdown_:

<Chart data={[...]} />

Some more **Markdown**.
```

## Use a custom React Parser
The solution is pretty straight-forward. On top of the **Markdown parser**, we can create a **custom parser** that checks for React components.
This parser is triggered _after_ the Markdown parser, so we have to make sure that the way we use React components in Markdown doesn't interfere with it.
For that, we change the syntax to be an `HTML` element as the Markdown parser will not alter them. We simply use a `div` tag and put the concrete React component
to render in the `class` attribute (with a _react-_ prefix) and the data as a **JSON** string into another attribute which we will call `props`.
Using a React component in a Markdown post then looks like this:

```Markdown
## Some Markdown
Here is a **React component** in _Markdown_:

<div class='react-chart' props='{"data":[1,2,3]}'></div>

```
We have to use _single_ quotes to surround the attributes, as we will use `JSON.parse` later which only supports double quotes in the JSON string.

## Implementing the React Parser
We need a way to access the output of the Markdown parser. I 'm using [phenomic](http://phenomic.io) as a static site generator which provides the output 
as a string property `body` to a React component (using _Layouts_).
The procedure is then as follows:
1. **Import** the React components you want to include in your posts
2. Look for `<div class='react-*' props='*'></div>` strings and **extract the _component name_ and _props_**.
3. Call the corresponding React component with the correct props and **render it to a string** by using `ReactDOMServer.renderToStaticMarkup`
4. Replace the `<div class='react-*' props='*'></div>` code with this string.
5. Render the markup and React component content with `dangerouslySetInnerHTML={{ __html: body }}`

This is easily doable using `body.replace(`_RegExp_`)`:

```javascript
import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'
import { Chart } from '../../components'

// matches strings like
// <div class='react-chart' props='{"val":5}'></div>
// <div      class='react-test'    >     </div>
// Make sure to use SINGLE quotes for defining HTML attributes,
// as we need double quotes to parse the JSON props attribute
const pattern = new RegExp(
    String.raw`<div\s*class='react-(\S*)'\s*(props='(.*)'\s*)?>\s*</div>`, 'ig')

export default class PostWithCharts extends Component {

  render () {
    let { body, ...otherProps } = this.props
    if (body) body = body.replace(pattern, this.replacementBasedOnMatch)
    return (
         <div
           dangerouslySetInnerHTML={{ __html: body }}
           {...otherProps}>
        </div>
    )
  }

  replacementBasedOnMatch (match, name, propsMatch, props) {
    props = propsMatch ? JSON.parse(props) : undefined
    switch (name) {
      case 'chart': {
        return ReactDOMServer.renderToStaticMarkup(<Chart {...props} ></Chart>)
      }
      default: {
        console.error(`Cannot replace ${name} with a React component. ${match}`)
        return '<h1><del>This paragraph should not be here.</del></h1>'
      }
    }
  }
}

PostWithCharts.propTypes = {
  body: PropTypes.string.isRequired   // Markdown post containing the react-div
}

```

The nice thing is that it works with **server-side rendering**. So in the final HTML file
there won't be a `<div class='react-*' props='*'></div>` element, instead the React component's `render` output will be inserted directly.
