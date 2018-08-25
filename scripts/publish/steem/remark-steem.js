const url = require('url')
const visit = require('unist-util-visit')

const createFeatureImage = (siteUrl, featuredUrl) => {
  if (!featuredUrl) return undefined
  return {
    type: `image`,
    title: null,
    alt: 'Featured Image',
    url: url.resolve(siteUrl, featuredUrl),
  }
}

const createHorizontalRule = () => ({
  type: `thematicBreak`,
})

const createReferenceToOriginalPost = ({ postUrl, siteUrl }) => ({
  type: `paragraph`,
  children: [
    {
      type: `text`,
      value: `Originally published at `,
    },
    {
      type: 'link',
      url: postUrl,
      children: [
        {
          type: 'text',
          value: siteUrl,
        },
      ],
    },
  ],
})

const collectUrlsFactory = () => {
  const urls = []
  const urlCollectorVisitor = node => {
    urls.push(node.url)
  }
  urlCollectorVisitor.urls = urls
  return urlCollectorVisitor
}

function attacher(options) {
  const { siteUrl, postUrl, frontmatter: { featured } } = options
  return transformer

  function transformer(tree, vfile) {
    const imageUrlsVisitor = collectUrlsFactory()
    visit(tree, 'image', imageUrlsVisitor)
    const linkUrlsVisitor = collectUrlsFactory()
    visit(tree, 'link', linkUrlsVisitor)
    tree.children = [
      createFeatureImage(siteUrl, featured),
      ...tree.children,
      createHorizontalRule(),
      createReferenceToOriginalPost({ postUrl, siteUrl }),
    ].filter(Boolean)
    // additional data will be passed to the publish method along with
    // stringified markdown
    vfile.data.images = imageUrlsVisitor.urls
    vfile.data.links = linkUrlsVisitor.urls
  }
}

module.exports = attacher
