const unified = require(`unified`)
const stringify = require(`remark-stringify`)

const createTitle = title => title ? ({
  type: `heading`,
  depth: 1,
  children: [
    {
      type: `text`,
      value: title,
    },
  ],
}) : undefined

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
      type: `link`,
      url: postUrl,
      children: [
        {
          type: `text`,
          value: postUrl,
        },
      ],
    },
  ],
})

const transformAst = (tree, post) => {
  tree.children = [
    createTitle(post.frontmatter.title),
    ...tree.children,
    createHorizontalRule(),
    createReferenceToOriginalPost(post.canonicalUrl),
  ].filter(Boolean)
}

module.exports = (ast, post) => {
  transformAst(ast, post)

  const ret = unified()
    .use(stringify)
    .stringify(ast)

  return ret
}
