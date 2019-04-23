import get from 'lodash/get'

export function filterPosts(posts, category) {
  if (!category) return posts

  return posts.filter(({ node }) => {
    const categories = get(node, `frontmatter.categories`, [])
    return categories.some(
      postCategory => postCategory.toLowerCase() === category.toLowerCase()
    )
  })
}
