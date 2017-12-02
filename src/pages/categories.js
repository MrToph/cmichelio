import React from 'react'
import get from 'lodash/get'
import Helmet from 'react-helmet'
import { Route } from 'react-router-dom'
import BlogIndexPosts from '../components/BlogIndex'

export default class BlogIndex extends React.Component {
  render() {
    const siteTitle = get(this, 'props.data.site.siteMetadata.title')
    const posts = get(this, 'props.data.allMarkdownRemark.edges')
    return (
      <Route
        key="/categories"
        exact
        path="/categories/:tag"
        render={props => [
          <Helmet key="helmet" title={siteTitle} />,
          <BlogIndexPosts
            key="blogIndexPosts"
            posts={posts}
            selectedCategory={props.match.params.tag}
          />,
        ]}
      />
    )
  }
}

// same as IndexQuery from './index.js', but gatsby is explicitly scanning for `graphql`
export const CategoryQuery = graphql`
  query CategoryQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMM DD, YYYY")
            featured
            categories
            title
          }
        }
      }
    }
  }
`
