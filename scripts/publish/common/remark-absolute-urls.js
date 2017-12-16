const url = require('url')
const visit = require('unist-util-visit')

function urlIsRelative(url) {
  // catches http(s)://example.io but also //example.io
  const isAbsolute = new RegExp('^([a-z]+://|//)', 'i')
  return !isAbsolute.test(url)
}

function joinUrls(siteUrl, slug, relativeUrl) {
  const siteUrlWithSlug = url.resolve(siteUrl, `/${slug}`)
  return url.resolve(siteUrlWithSlug, `${relativeUrl}`)
}

const markFactory = () => {
  const removedNodes = []
  const markForRemovalVisitor = node => {
    removedNodes.push(node)
  }
  markForRemovalVisitor.nodes = removedNodes
  return markForRemovalVisitor
}

const removeFactory = nodes => (node, index, parent) => {
  if (parent && nodes.indexOf(node) !== -1) {
    parent.children.splice(index, 1)
    return index
  }
}

function attacher(options) {
  const { siteUrl, slug } = options
  return transformer

  function replaceUrl(node) {
    if (!node.url || !urlIsRelative(node.url)) return
    const absoluteUrl = joinUrls(siteUrl, slug, node.url)
    console.log(`\tRewriting link "${node.url}" to "${absoluteUrl}" ...`)
    node.url = absoluteUrl
  }

  function transformer(tree) {
    const markNodeVisitor = markFactory()
    visit(tree, 'yaml', markNodeVisitor)
    visit(tree, removeFactory(markNodeVisitor.nodes))

    console.log(`Rewriting image links ...`)
    visit(tree, 'image', replaceUrl)
    console.log(`Rewriting anchor links ...`)
    visit(tree, 'link', replaceUrl)
  }
}

module.exports = attacher
