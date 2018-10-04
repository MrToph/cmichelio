import React from 'react'
import { graphql } from "gatsby"
import get from 'lodash/get'
import Helmet from 'react-helmet'
import { Router } from "@reach/router"
import BlogIndexPosts from '../components/BlogIndex'
import Layout from '../components/layout'

export default class BlogIndex extends React.Component {
  render() {
    const siteTitle = get(this, `props.data.site.siteMetadata.title`)
    const posts = get(this, `props.data.allMarkdownRemark.edges`)
    return (
      <Layout>
        <Helmet key="helmet" title={siteTitle} />
        <Router>
        <BlogIndexPosts
          key="blogIndexPosts" 
          path="/categories/:tag"
          posts={posts}
        />
        </Router>
      </Layout>
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
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { draft: { ne: true } } }
    ) {
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
