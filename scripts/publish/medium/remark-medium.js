const url = require('url')

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
  const { siteUrl, postUrl } = options
  return transformer

  function transformer(tree) {
    tree.children = [
      ...tree.children,
      createHorizontalRule(),
      createReferenceToOriginalPost(postUrl),
      createMediumFooter(siteUrl),
    ]
  }
}

module.exports = attacher
