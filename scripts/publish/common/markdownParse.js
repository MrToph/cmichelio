const path = require('path')
const fs = require('fs')
var vfile = require('to-vfile')
const frontmatter = require('remark-frontmatter')
// The following requires exist in gatsby-transformer-remark
const Remark = require(`remark`)
const parse = require('remark-parse')
const stringify = require('remark-stringify')
const absoluteUrls = require('./mdast-absolute-urls')
const utils = require('./utils')

/**
 * @function pathToNormalizedMarkdownAST
 * @description Reads the file's content and transforms it into a Markdown AST using remark.
 *  Resolves relative image / anchor nodes to absolute site urls
 * @param {String} filePath The path to the markdown file relative to cwd
 */
const pathToNormalizedMarkdownAST = async filePath => {
  // https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-remark/src/extend-node-type.js
  console.log('pathToNormalizedMarkdownAST')
  let remark = new Remark()
    .data(`settings`, {
      commonmark: true,
      footnotes: true,
      pedantic: true,
    })
    .use(parse)
    .use(frontmatter)
    .use(absoluteUrls, {
      siteUrl: `https://cmichel.io`,
      slug: utils.slugFromPath(filePath)
    })
    .use(stringify)
    .process(vfile.readSync(filePath), function(err, result) {
      // console.log(String(result))
    })

  // unified()
  //   .use(parse)
  //   .use(stringify)
  // // .use(frontmatter, ['yaml', 'toml'])
  // // .use(() => console.log)
  // // .process(vfile.readSync(filePath), function(err, file) {
  // //   console.log(String(file))
  // // })

  // const markdownAST = remark.parse(`---\ntitle: TITEL READ!\n---\n\n## Hello`)
  // console.log(remark.stringify(markdownAST))
}

module.exports = {
  pathToNormalizedMarkdownAST,
}
