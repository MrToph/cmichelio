# cmichel.io

These are the source-files for my blog, [cmichel.io](https://cmichel.io).

## Get started

1. Clone this repo
1. `npm install`
1. To run it in development mode, run `gatsby develop`
1. To build (deploy) the site, run `gatsby build` (`npm run deploy`)


### Additional Setup

This repo includes cross-posting scripts to publish the articles to [medium](https://medium.com) and the [steem blockchain](https://steemit.com).
After cloning this repo, you need to set up your `.env` file. An example is given in `.env.example`.

I use [netlify](https://netlify.com) to auto-deploy this site on any changes in this repo. You might want to create an account and authorize `netlify`.


## Publishing new posts

To publish a new post, simply run `npm run create`. This will create a template post in `src/pages/<slug>`.
Once done writing, you push the changes to `master`.
This triggers a [netlify](https://netlify.com) `git hook` which builds and auto-deploys the new site. After some minutes the new post is live.

Currently, you have to run the cross-posting scripts by hand.

## Development Overview

This is a standard [gatsbyjs](https://gatsbyjs.org) repo.

### Gatsby

It includes the posts written in Markdown (along with the images used in them) in their own directories in `src/pages`. This directory is used as the post's _slug_. (There are some legacy posts that do not follow this structure and have a `slug` field defined in the markdown frontmatter.)

The following **gatsby-plugins** are used during the posts' creation process:
1. Local non-vector images **linked to in the post** are post-processed by compressing and cropping them to a max size, and thumbnails of different sizes are created (`sharp` plugins, `gatsby-remark-images`).
They are copied to `public/static` and the corresponding relative path **of the markdown image nodes** are rewritten to use these images instead.
1. SVG images and other attachments (`pdf`s, etc.) **linked to in the post** are again copied to `public/static` and the relative paths are rewritten (`gatsby-remark-copy-linked-files`).
1. Code snippets are displayed with `prismjs` (`gatsby-remark-prismjs`). The theme can be set in `src/templates/prismjs.css`

> _Note:_ The linked images and files are only created when **building**. Therefore, you need to run `gatsby build` before you can see them in `develop` mode.

Other plugins used in the **build** process:
1. An RSS feed containing all posts is created at `public/feed.xml` (`gatsby-plugin-feed`)


## Crossposting

This repo includes cross-posting scripts to publish the posts to [medium](https://medium.com) and the [steem blockchain](https://steemit.com).

### Setup

You need a Medium account and [create an application](https://medium.com/me/applications) on Medium to get access to the API.

From there you get the **Client ID** and **Client Secret**.
You'll also need an access token for each Medium account that should be able to crosspost.
An easy way to do that is by getting a Medium **Integration token**:
Go to your [Medium Settings](https://medium.com/me/settings) and create a token in the _Integration Token_ section.
(You can also get "normal" access tokens for a user using standard OAuth2 with the [medium-sdk](https://github.com/Medium/medium-sdk-nodejs#usage).)

### Publishing

To publish a post, first build your website using `npm run build` and deploy the `public` folder to the site url which is specified in `gatsby-config.js`'s `siteMetadata.siteUrl`.

> It's important that the website is deployed first as Medium tries to fetch all linked images from the `siteUrl` upon importing and hosts a local copy of them.

You can then run the crosspost script `npm run crosspost` and select the post to crosspost.
The script needs the previously mentioned Medium environment variables set, this can be done, for instance, in the `.env` file (see `.env.template`).

The following modifications are done when publishing a markdown post:
1. All images specified in `src/pages/**/*` are **copied** to `public/**/*` keeping the same sub-directory structure. Done by the custom `copy-images-structure` plugin in `plugins`.
2. The markdown file is parsed by `remark`, extracting the slug and frontmatter (containing the title and tags for cross-positing). The cross-posting script then resolves all relative `urls` in Markdown `link`/`image` nodes to **absolute urls**, prepending this site's domain and the post's slug.
3. A footer is inserted, linking back to the original post on my blog.

## ToDo:

* [ ] Add drip widget / newsletter subscription?
* [ ] Implement auto-detection of new posts, and add a `.circleci` git hook which then automatically cross-posts.
