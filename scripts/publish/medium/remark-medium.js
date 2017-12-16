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

function attacher(options) {
  const { siteUrl, slug, frontmatter, postUrl } = options
  return transformer

  function transformer(tree) {
    tree.children = [
      ...tree.children,
      createHorizontalRule(),
      createReferenceToOriginalPost(postUrl),
    ]
  }
}

module.exports = attacher
