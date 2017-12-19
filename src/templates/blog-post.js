import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import get from 'lodash/get'
import { css } from 'glamor'
import ReactDisqusComments from 'react-disqus-comments'
import { primaryColor } from '../styling'
import CategoryBar from '../components/BlogPost/CategoryBar'

// import 'prismjs/themes/prism-twilight.css'
import './prismjs.css'

const blogPostStyles = css({
  '& img': {
    maxWidth: `100%`,
  },
})

const titleStyles = css({
  color: primaryColor,
})

export default class BlogPostTemplate extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      site: PropTypes.shape({
        siteMetadata: PropTypes.shape({
          title: PropTypes.string.isRequired,
          author: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
      markdownRemark: PropTypes.shape({
        id: PropTypes.string,
        html: PropTypes.string.isRequired,
        frontmatter: PropTypes.shape({
          date: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
          disqus_identifier: PropTypes.string,
          featured: PropTypes.string,
          categories: PropTypes.arrayOf(PropTypes.string),
        }).isRequired,
      }),
    }).isRequired,
  }

  renderDisqus() {
    const post = this.props.data.markdownRemark
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    const postTitle = `${post.frontmatter.title} | ${siteTitle}`
    let identifier = get(post, 'frontmatter.disqus_identifier')
    if (!identifier) identifier = get(post, 'fields.slug')
    return (
      <ReactDisqusComments
        shortname="cmichel"
        identifier={identifier}
        title={postTitle}
      />
    )
  }

  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    return (
      <section {...blogPostStyles}>
        <Helmet title={`${post.frontmatter.title} | ${siteTitle}`} />
        <h1 {...titleStyles}>{post.frontmatter.title}</h1>
        <CategoryBar
          categories={post.frontmatter.categories}
          date={post.frontmatter.date}
        />
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        {this.renderDisqus()}
      </section>
    )
  }
}

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      fields {
        slug
      }
      frontmatter {
        date(formatString: "DD MMMM, YYYY")
        title
        disqus_identifier
        featured
        categories
      }
    }
  }
`
