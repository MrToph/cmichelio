const url = require('url')

const createFeatureImage = (siteUrl, featuredUrl) => {
  if (!featuredUrl) return null
  return {
    type: `image`,
    title: null,
    alt: 'Featured Image',
    url: url.resolve(siteUrl, featuredUrl),
  }
}

const createTitle = title => ({
  type: 'heading',
  depth: 1,
  children: [
    {
      type: `text`,
      value: title,
    },
  ],
})

const createHorizontalRule = () => ({
  type: `thematicBreak`,
})

const createReferenceToOriginalPost = postUrl => ({
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
          value: 'cmichel.io',
        },
      ],
    },
  ],
})

const createMediumFooter = siteUrl => ({
  type: `image`,
  title: null,
  alt: 'Medium Clap',
  url: url.resolve(siteUrl, '/images/medium_clap.gif'),
})

function attacher(options) {
  const { siteUrl, postUrl, frontmatter: { title, featured } } = options
  return transformer

  function transformer(tree) {
    console.log(JSON.stringify(tree, null, 2))
    tree.children = [
      createFeatureImage(siteUrl, featured),
      createTitle(title),
      ...tree.children,
      createHorizontalRule(),
      createReferenceToOriginalPost(postUrl),
      createMediumFooter(siteUrl),
    ].filter(node => !!node)
  }
}

module.exports = attacher
