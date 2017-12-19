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
To publish a new post, simply create a directory in `src/pages` and put a markdown file with the `.md` extension in it. The directory's name is used as the post's _slug_.
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

Other plugins used in the build process:
1. An RSS feed containing all posts is created at `public/feed.xml` (`gatsby-plugin-feed`)

### Cross-post scripts
This repo includes cross-posting scripts to publish the posts to [medium](https://medium.com) and the [steem blockchain](https://steemit.com).

They are located in the `scripts/publish` directory. You need `node` v8+ to run them, because they make use of `async/await`.

Cross-posting:
* [ ] `npm run crosspost` publishes all new posts to all platforms. New posts are found by doing a `git diff` on `master` between `HEAD~1` and `HEAD` and checking for newly created `.md` files.
* [x] `npm run crosspost -- --path "progress-report/progress-report.md"` to publish `src/pages/progress-report/progress-report.md` to all platforms.
* [x] `npm run crosspost -- medium --path "progress-report/progress-report.md"` to publish `src/pages/progress-report/progress-report.md` to medium only. The same works using the `steem` command instead.

> _Note:_ Cross-posting to steem contains a check if the post's slug already exists for your account to avoid accidentally double-posting the same post. Medium does **not** have this built-in check, due to restrictions of the Medium API.

The following modifications are done when publishing a markdown post:
1. All images specified in `src/pages/**/*` are **copied** to `public/**/*` keeping the same sub-directory structure. Done by the custom `copy-images-structure` plugin in `plugins`.
1. The markdown file is parsed by `remark`, extracting the slug and frontmatter (containing the title and tags for cross-positing). The cross-posting script then resolves all relative `urls` in Markdown `link`/`image` nodes to **absolute urls**, prepending this site's domain and the post's slug.
1. A footer is inserted, linking back to the original post on my blog.

## ToDo:
* [ ] Add drip widget?
* [ ] Implement auto-detection of new posts, and add a `.circleci` git hook which then automatically cross-posts.
