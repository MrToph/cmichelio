# gatsby-starter-blog
Gatsby starter for creating a blog

Install this starter (assuming Gatsby is installed) by running from your CLI:
`gatsby new gatsby-blog https://github.com/gatsbyjs/gatsby-starter-blog`

## Running in development
`gatsby develop`

## TODO:
* Write plugin that copies over un-digested markdown-images without modifying the markdown according to the post's *slug*! (Needed solely for cross posting)
* Write plugin that reads markdown svgs and copies them over modifying the markdown. like `gatsby-remark-images`. Done by `copy` plugin.

## Cross post
* Write command that publishes posts to medium + steemit
* Do custom markdown parse, set relative image + url paths to absolute ones
* Add custom footer backlinking to homepage
* Check if post is already published by checking url
* Trigger it by CI, make a `git diff` to grep *newly added* markdown files.