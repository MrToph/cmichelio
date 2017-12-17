# gatsby-starter-blog
Gatsby starter for creating a blog

Install this starter (assuming Gatsby is installed) by running from your CLI:
`gatsby new gatsby-blog https://github.com/gatsbyjs/gatsby-starter-blog`

## Running in development
`gatsby develop`

https://toddmotto.com/typescript-setters-getter

## TODO:
* [x] Install google-analytics plugin
* [x] Move static pages, like _L-system to github_, _rescuetime redirect_, and adapt links in the markdown files
    * [x] redirects
    * [x] projects/d3-bubble-chart
    * [x] fractals-LSystem
* [x] Check if feed is correct
* [x] Make mobile responsive
* [ ] Add drip widget?
* [x] Write plugin that reads markdown svgs and copies them over modifying the markdown. like `gatsby-remark-images`. Done by `gatsby-remark-copy-linked-files` plugin.
* [x] Twitter breaks with `widgets.js:formatted:2764 Uncaught (in promise) Error: sandbox not initialized
    at e.addRootClass (widgets.js:formatted:2764)`
* [ ] Document everything. That we have two crosspost scripts. They resolve relative urls to absolute ones, etc. That's why we need the custom plugin that copies over the stuff. Non-vector-image formats are handled and resized by `gatsby-remark-images`, svgs (and all other linked files) are copied over to `/static` by `gatsby-remark-copy-linked-files` on **build** only. Twitter widget workings

2. Solution
* [x] Write plugin that copies over all image files in `src/pages/**/*` while keeping the folder structure of the *slug*! Just use new slug logic, don't care about slug in frontmatter. (Maybe just hook in `onCreateNode` and check for images from `gatsby-source-filesystem`? Or do custom plugin and query the images later?)

## Cross post
* [x] Write command that publishes posts to medium + steemit
* [x] Do custom markdown parse, set relative image + url paths to absolute ones
* [x] Add custom footer backlinking to homepage
* [x] Check if post is already published by checking url
* [ ] Trigger it by CI, make a `git diff` to grep *newly added* markdown files.