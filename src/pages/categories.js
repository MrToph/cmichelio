import React from 'react'
import { graphql } from 'gatsby'
import get from 'lodash/get'
import { Helmet } from 'react-helmet'
import { Router } from '@reach/router'
import About from '../components/about'
import BlogIndexPosts from '../components/blog-index'

export default class BlogIndex extends React.Component {
  render() {
    const siteTitle = get(this, `props.data.site.siteMetadata.title`)
    const posts = get(this, `props.data.allMarkdownRemark.edges`)
    return (
      <React.Fragment>
        <Helmet>
          <title>{siteTitle}</title>
        </Helmet>
        <About />
        <Router>
          <BlogIndexPosts
            path="/categories/:tag"
            posts={posts}
          />
        </Router>
      </React.Fragment>
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
          excerpt(pruneLength: 280)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMM DD, YYYY")
            featured
            categories
            title
            image {
              childImageSharp {
                fixed(width: 300) {
                  ...GatsbyImageSharpFixed
                }
              }
            }
          }
        }
      }
    }
  }
`
