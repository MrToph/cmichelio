const path = require('path')
const url = require('url')
var vfile = require('to-vfile')
const frontmatterPlugin = require('remark-frontmatter')
const yaml = require('js-yaml')
// The following requires exist in gatsby-transformer-remark
const Remark = require(`remark`)
const parse = require('remark-parse')
const stringify = require('remark-stringify')
const visit = require('unist-util-visit')

const absoluteUrls = require('./remark-absolute-urls')
const utils = require('./utils')

async function getFrontmatter(filePath) {
  let frontmatter
  function frontmatterToJs() {
    return function transformer(tree) {
      visit(tree, `yaml`, node => {
        frontmatter = yaml.load(node.value)
      })
    }
  }
  return new Promise((resolve, reject) => {
    new Remark()
      .data(`settings`, {
        commonmark: true,
        footnotes: true,
        pedantic: true,
      })
      .use(parse)
      .use(frontmatterPlugin)
      .use(frontmatterToJs)
      .process(vfile.readSync(filePath), function(err) {
        if (err) return reject(err)
        if (!frontmatter)
          return reject(new Error('No frontmatter found in markdown-AST'))
        console.log(`Found frontmatter ...`)
        return resolve(frontmatter)
      })
  })
}

/**
 * @function pathToNormalizedMarkdownAST
 * @description Reads the file's content and transforms it into a Markdown AST using remark.
 *  Resolves relative image / anchor nodes to absolute site urls
 * @param {String} filePath The path to the markdown file relative to cwd
 * @param {Function} transformerPlugin A remark-plugin that will be invoked with the markdown AST and additional options
 *  Used to further customize the post
 */
const transformPostFromPath = async (filePath, transformerPlugin) => {
  console.log('transformPostFromPath')
  // https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-remark/src/extend-node-type.js

  try {
    const siteUrl = `https://cmichel.io`
    const slug = utils.slugFromPath(filePath)
    const postUrl = url.resolve(siteUrl, `/${slug}`)
    const frontmatter = await getFrontmatter(filePath)

    return new Promise((resolve, reject) => {
      new Remark()
        .data(`settings`, {
          commonmark: true,
          footnotes: true,
          pedantic: true,
        })
        .use(parse)
        // to create a markdown yaml node out of it
        .use(frontmatterPlugin)
        .use(absoluteUrls, {
          siteUrl,
          slug,
          postUrl,
          frontmatter,
        })
        .use(transformerPlugin, {
          siteUrl,
          slug,
          postUrl,
          frontmatter,
        })
        .use(stringify)
        .process(vfile.readSync(filePath), function(err, result) {
          if (err) return reject(err)
          // console.log(String(result))
          const returnValue = {
            content: String(result),
            frontmatter,
            postUrl,
            siteUrl,
            slug,
          }
          return resolve(returnValue)
        })
    })
  } catch (ex) {
    console.log(ex)
  }

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
  transformPostFromPath,
}
