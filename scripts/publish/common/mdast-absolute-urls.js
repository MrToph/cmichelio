const url = require('url')
const visit = require('unist-util-visit')
const yaml = require('js-yaml')

function urlIsRelative(url) {
  // catches http(s)://example.io but also //example.io
  const isAbsolute = new RegExp('^([a-z]+://|//)', 'i')
  return !isAbsolute.test(url)
}

function joinUrls(siteUrl, slug, relativeUrl) {
  const siteUrlWithSlug = url.resolve(siteUrl, `/${slug}`)
  return url.resolve(siteUrlWithSlug, `${relativeUrl}`)
}

function attacher(options) {
  const { siteUrl, slug } = options
  return transformer

  function visitor(node) {
    if (!node.url || !urlIsRelative(node.url)) return
    const absoluteUrl = joinUrls(siteUrl, slug, node.url)
    console.log(`Rewriting link "${node.url}" to "${absoluteUrl}" ...`)
    node.url = absoluteUrl
  }

  function transformer(tree) {
    let frontmatter
    visit(tree, `yaml`, node => {
      frontmatter = yaml.load(node.value)
    })
    if (!frontmatter) throw new Error('No frontmatter found in markdown-AST')
    console.log(`Found frontmatter ...`)
    console.log(`Rewriting image links ...`)
    visit(tree, 'image', visitor)
    console.log(`Rewriting anchor links ...`)
    visit(tree, 'link', visitor)
    // console.log('frontmatter', frontmatter)
    // console.log(JSON.stringify(tree))
  }
}

module.exports = attacher
