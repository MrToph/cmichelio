---
author: Christoph Michel
comments: true
date: 2016-11-07 16:40:18+00:00
disqus_identifier: 912 http://cmichel.io/?p=912
layout: Post
route: /wordpress-to-static-site-generator/
slug: wordpress-to-static-site-generator
title: Moving from WordPress to a Static Site Generator
featured: /assets/2016/11/wordpress-in-2016.gif
categories:
- Tech
- WordPress
- React
- Phenomic
---
Right now this blog is using _WordPress_, but I'm currently rebuilding this website using a modern **static website generator**. The change should be up in the following weeks.
There are many static site generators, the ones I personally find the most interesting are those using **webpack** and the **React ecosystem**:
 	
* [Gatsby.js](https://github.com/gatsbyjs/gatsby)
* [Phenomic](https://phenomic.io/)
* [Next.js](https://zeit.co/blog/next)

![WordPress in 2016](http://cmichel.io/assets/2016/11/wordpress-in-2016.gif)

## Reasons to use a static site generator

Here are some of my reasons to use a static site generator in favor of WordPress:
 	
1. **Full control:** Using WordPress I feel like I don't have a lot of control over my website. Sure, I can install **WordPress plugins** to customize my site, but I often end up settling for a mediocre solution that works but is missing a feature, or doesn't fully fit my theme. I could tweak the plugin's code to add a feature or change its _CSS stylesheets_ for the appearance, but digging into someone else's PHP code, or old jQuery JavaScript, is just inconvenient to me.I'd rather build my website once from scratch using the **React ecosystem** and the "new" JavaScript module approach which I'm more familiar with and which comes with great benefits, like easily integrating a _CSS preprocessor_ into the build process. Combined, this should make it really easy to add new features in the future by simply building a React component or using any of the existing React components as a base. 

 	
2. **Less clutter/Better SEO:** If you go the WordPress route, you end up using dozens of plugins, most of them coming with their own **CSS stylesheets** or **JS scripts** that need to be requested by the browser. This slows down your website which is bad for SEO, and if you look at the network requests tab, your website looks like a patchwork rug with CSS stylesheets and JavaScript scripts plastered all over it.  
![WordPress JavaScript Requests](http://cmichel.io/assets/2016/11/wordpress-javascript-requests.png)
_Posts on my blog load 20 JS scripts._
With a static site generator I should be able to **bundle** all the individual JS code into a single _bundle.js_, reducing this to one request. The same works for the `.css` part, or it could even be _inlined_ into the `head` when creating the static websites.

 	
3. **Better developer/author experience:** The static site generators I mentioned allow you to write your posts in **Markdown** which are then compiled to standard `HTML` tags during the build phase. Furthermore, you can make use of Webpack's **hot reloading** feature to immediately see your results rendered when writing markup posts (or developing the website in general). See the example from **Gatsby** here:  
![Gatsby hot-reloading](http://zippy.gfycat.com/UltimateWeeklyBarebirdbat.gif)  
The way I'm currently authoring in WordPress is that I type my posts into its editor and click on _Preview_, which opens a new tab, loads for some seconds and then shows the rendered website. This might not seem like much, but it gets annoying if you have to do it for every little change you do in your post.

   I 'm also experimenting if I can use **custom React components in my posts** by importing them into my markdown write-up, which then evaluates the React component (calls its `render` function) and _hard-codes_ the result into the static page. This is useful if you build a [Visualization component](http://cmichel.io/charts-in-react-native-svg-and-d3-js/) in React and want to reuse it in many posts to visualize different data. I got some prototype of this working already, I'll post about it next.

4. The sense of accomplishment you get when you build your site from scratch instead of using a WordPress theme with plugins. You'll also learn a lot doing it this way.


The huge benefit of WordPress is that you can set up a good-looking website a lot faster by using one of the many WordPress themes, instead of building the website yourself. There is also the possibility to build themes with [Gatsby](https://github.com/gatsbyjs/gatsby#gatsby-starters) (Starters) or [phenomic](https://phenomic.io/showcase/), but there are not many of them. The static site generator equivalent to _WordPress plugins_ would probably be looking for a _React component_ that does the job.

P.S. I tried **Gatsby** and **phenomic** and stuck with phenomic in the end, because [it loads the posts _on demand_](https://phenomic.io/docs/faq/gatsby/) whereas Gatsby bundles _all_ posts and ships them within _bundle.js_ even when the average user only reads 1-2 posts. Also, I found [phenomic's "layout system"](https://phenomic.io/docs/usage/layouts/) to be better. Still, I'm looking forward to [Gatsby's 1.0 release](https://github.com/gatsbyjs/gatsby/issues/419) to see how the [GraphQL](https://github.com/gatsbyjs/gatsby/issues/420) idea turns out.
