/*eslint-env node */
const _ = require('lodash')
const Promise = require('bluebird')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    const blogPost = path.resolve('./src/templates/blog-post.js')
    resolve(
      graphql(
        `
          {
            allMarkdownRemark(limit: 1000) {
              edges {
                node {
                  fields {
                    slug
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          // console.log(result.errors)
          reject(result.errors)
        }

        // Create blog posts pages.
        _.each(result.data.allMarkdownRemark.edges, edge => {
          createPage({
            path: edge.node.fields.slug,
            component: blogPost,
            context: {
              slug: edge.node.fields.slug,
            },
          })
        })
      })
    )
  })
}

exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators
  if (node.internal.type === `MarkdownRemark`) {
    let slug = ''
    if (node.frontmatter && node.frontmatter.slug) slug = node.frontmatter.slug
    else {
      slug = createFilePath({ node, getNode })
      // return only the first folder/file, from first slash to second slash (including)
      slug = /^\/[\s\S]*?\//.exec(slug)[0]
    }
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}

exports.onCreatePage = ({ page, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  // page.matchPath is a special key that's used for matching pages
  // only on the client.
  // we use it to make the categories page work
  if (page.path === '/categories/') {
    page.matchPath = '/categories/:category'

    createPage(page)
  }
}
