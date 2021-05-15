/* eslint-env node */
const tailwindcss = require(`tailwindcss`)
const precss = require(`precss`)
const purge = require(`@fullhuman/postcss-purgecss`)
const autoprefixer = require(`autoprefixer`)

module.exports = {
  plugins: {
    tailwindcss: {}, // tailwindcss(`./tailwind.config.js`),
    autoprefixer: {},
    // precss: {}, // precss(),
    'postcss-preset-env': {
      stage: 1,
      features: {
        'focus-within-pseudo-class': false
      },
    },
  //   '@fullhuman/postcss-purgecss': {
  //     preserveHtmlElements: false,
  //     // paths to all of the template files in the project
  //     content: [
  //       `./src/**/*.js`,
  //       // `./src/components/**/*.css`,
  //       `./src/components/blog-post/prismjs.css`,
  //       `./src/components/layout/layout.css`, // for html, body, all gatsby/markdown-only things etc.
  //     ],
  //     css: [`./src/**/*.css`],
  //     safeList: [/^cols-\d$/],
  //     defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
  //     extractors: [
  //       {
  //         // https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css-with-purgecss
  //         // eslint-disable-next-line no-useless-escape
  //         extractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
  //         extensions: [`html`, `js`, `jsx`, `css`],
  //       },
  //     ],
  //   },
  }
}
