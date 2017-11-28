---
author: Christoph Michel
date: 2016-11-23
disqus_identifier: css-margin-top-not-working
layout: Post
route: /css-margin-top-not-working/
slug: css-margin-top-not-working
title: Ultimate Guide to non-working CSS margins
featured: 
categories:
- CSS
---

Sometimes you're styling some HTML elements with CSS and there seems to be a **margin** between the elements that **you never defined**.
This article covers most cases why css margins are not working the way you expect them to be. 

## Whitespaces between `inline-blocks`
If you put two `inline-block` elements next to each other in your HTML code, you need to make sure that there are **no whitespaces between the closing and opening tags**.
Otherwise, as the elements are `inline`, they act like normal text elements where you would also expect to have a "margin" between your elements where a whitespace occurs.

<iframe height='228' scrolling='no' title='eBWxQz' src='//codepen.io/cmichel/embed/eBWxQz/?height=228&theme-id=0&default-tab=result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='http://codepen.io/cmichel/pen/eBWxQz/'>eBWxQz</a> by Christoph Michel (<a href='http://codepen.io/cmichel'>@cmichel</a>) on <a href='http://codepen.io'>CodePen</a>.
</iframe>

The fix is to remove the spaces/newlines such that the opening and closing tags are immediately next to each other:

```html
<span id="one"></span><span id="two"></span>
```

If you want to keep some formatting structure, you can use comments to remove the whitespaces:

```html
   <span id="one"></span><!--
--><span id="two"></span>
```

## Inline Element Vertical Alignment
Whenever you have an `inline` element which is followed by a `block` element (or any element rendered in a new line), there will be a **vertical space** between these two.
This effect is most noticeable for inline-images, like `<svg>` elements which are `inline` by default.
This has to do with where in the current _line_ the element is positioned.
If not specified otherwise, `inline` elements are **vertically aligned** to the parent's [`baseline`](https://developer.mozilla.org/en-US/docs/Web/CSS/vertical-align).

<iframe height='298' scrolling='no' title='Invisible space between SVG and block element' src='//codepen.io/cmichel/embed/qqmvoJ/?height=298&theme-id=0&default-tab=result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='http://codepen.io/cmichel/pen/qqmvoJ/'>Invisible space between SVG and block element</a> by Christoph Michel (<a href='http://codepen.io/cmichel'>@cmichel</a>) on <a href='http://codepen.io'>CodePen</a>.
</iframe>

The fix is to vertically lower the element lower with for instance:

```css
svg {
  vertical-align: middle;
}
```

## Collapsing Margins of Block Elements
The third way you can see margins between elements that you never defined has to do with something called
[_Collapsing Margins_](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing):

> Top and bottom margins of blocks are sometimes combined (collapsed) into a single margin whose size is the largest of the margins combined into it, a behavior known as margin collapsing.

The idea is that if you have several paragraphs and some other elements before or after them, and you want to have exactly `20px` of margin between them,
you can just define both `margin-top: 20px;` and `margin-bot: 20px;`.
This way, there will always be a space of `20px` between a paragraph and **any element, even between adjacent paragraphs,**
because the `top` and `bot` margin between them collapses into a single one of `20px`.
Unfortunately, this behavior is often more of an annoyance you have to work around instead of something useful.

Besides collapsing margins between two _adjacent_ elements, 
there are two other cases how collapsing margins can occur, but the most common one is between a **parent** and its **first child**:

For example, you want to wrap a _heading_ into a `div` while leaving some space between the `div's` upper border and the heading by defining a `margin-top: 20px` on the heading.
However, instead of the `h2` moving down, **the whole _div_ moves down by `20px`** instead:

<iframe height='265' scrolling='no' title='Collapsing Margins between parent and child' src='//codepen.io/cmichel/embed/LbyvGw/?height=265&theme-id=0&default-tab=result&embed-version=2' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='http://codepen.io/cmichel/pen/LbyvGw/'>Collapsing Margins between parent and child</a> by Christoph Michel (<a href='http://codepen.io/cmichel'>@cmichel</a>) on <a href='http://codepen.io'>CodePen</a>.
</iframe>

This happens because the `div` has **no border, and no padding** defined, and the CSS specification states to
[_collapse_](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing) the two top margins into a single one of the parent.
(The same happens with _bottom_ margins.)

There are several ways to circumvent margin collapsing:
* Set a border or a (fake) padding on `div`:
  ```css
  div {
    padding: 0.1px;
  }
  ```
* Use padding instead of margin to adjust the child:
  ```css
  h2 {
    padding-top: 20px;
  }
  ```
* Collapsing margins only happens with _block_ elements, so you can define `div` to be an `inline-block` to prevent it:
  ```css
  div {
    display: inline-block;
  }
  ```
* Defining a different `overflow` value also disables it:
  ```css
  div {
    overflow: auto;
  }
  ```
* Position your `div` absolute:
  ```css
  div {
    position: absolute;
  }
  ```

These are the main issues why a space may appear somewhere you didn't expect, but once you aware of how `inline` elements are positioned and that _collapsing margins_ exists,
they are usually easy to fix.
