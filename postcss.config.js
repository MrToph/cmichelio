/* eslint-env node */
const tailwindcss = require(`tailwindcss`)
const purgecss = require(`@fullhuman/postcss-purgecss`)
const precss = require(`precss`)

// https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css-with-purgecss
class TailwindExtractor {
  static extract(content) {
    // eslint-disable-next-line no-useless-escape
    return content.match(/[A-Za-z0-9-_:\/]+/g) || []
  }
}

module.exports = {
  plugins: [
    tailwindcss(`./tailwind.js`),
    precss(),
    // purgecss({
    //   content: [`./src/**/*.js`],
    //   css: [`./src/**/*.css`],
    //   whitelistPatterns: [/^cols-\d$/],
    //   extractors: [
    //     {
    //       extractor: TailwindExtractor,
    //       extensions: [`html`, `js`, `jsx`],
    //     },
    //   ],
    // }),
  ],
}
