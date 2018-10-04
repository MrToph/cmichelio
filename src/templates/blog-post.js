import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from "gatsby"
import Helmet from 'react-helmet'
import get from 'lodash/get'
import trim from 'lodash/trim'
import { css } from 'glamor'
import ReactDisqusComments from 'react-disqus-comments'
import { primaryColor } from '../styling'
import CategoryBar from '../components/BlogPost/CategoryBar'
import Layout from '../components/layout'

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
        excerpt: PropTypes.string.isRequired,
        fields: PropTypes.shape({
          slug: PropTypes.string.isRequired,
        }),
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

  renderHeader() {
    const post = this.props.data.markdownRemark
    const { title, featured, categories } = post.frontmatter

    const siteUrl = trim(get(this.props, `data.site.siteMetadata.siteUrl`), `/`)
    const postUrl = `${siteUrl}/${trim(post.fields.slug, `/`)}`
    const socialImage = `${siteUrl}/${trim(featured, `/`) || `images/logo.png`}`
    const siteTitle = get(this.props, `data.site.siteMetadata.title`)
    const postTitle = `${title} | ${siteTitle}`
    const keywords = (categories || []).join(` `)
    const description = post.excerpt

    return (
      <Helmet title={`${post.frontmatter.title} | ${siteTitle}`}>
        <meta name="image" content={socialImage} />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property={`og:image`} content={socialImage} />
        <meta property={`og:type`} content={`article`} />
        <meta poperty={`og:title`} content={postTitle} />
        <meta property={`og:description`} content={description} />
        <meta property={`og:url`} content={postUrl} />
        <meta property={`og:site_name`} content={postTitle} />
        <meta property="twitter:card" content="summary" />
        <meta property={`twitter:title`} content={postTitle} />
        <meta property={`twitter:description`} content={description} />
        <meta property={`twitter:image`} content={socialImage} />
      </Helmet>
    )
  }

  renderDisqus() {
    const post = this.props.data.markdownRemark
    const siteUrl = trim(get(this.props, `data.site.siteMetadata.siteUrl`), `/`)
    const siteTitle = get(this.props, `data.site.siteMetadata.title`)
    const postTitle = `${post.frontmatter.title} | ${siteTitle}`
    let identifier = get(post, `frontmatter.disqus_identifier`)
    if (!identifier) identifier = trim(get(post, `fields.slug`), `/`)
    return (
      <ReactDisqusComments
        shortname="cmichel"
        identifier={identifier}
        title={postTitle}
        url={`${siteUrl}/${identifier}`}
      />
    )
  }

  render() {
    const post = this.props.data.markdownRemark
    return (
      <Layout>
        <section {...blogPostStyles}>
          {this.renderHeader()}
          <h1 {...titleStyles}>{post.frontmatter.title}</h1>
          <CategoryBar
            categories={post.frontmatter.categories}
            date={post.frontmatter.date}
          />
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
          {this.renderDisqus()}
        </section>
      </Layout>
    )
  }
}

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        siteUrl
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
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
