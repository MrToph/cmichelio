import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import Image from 'gatsby-image'
import { Helmet } from 'react-helmet'
import get from 'lodash/get'
import trim from 'lodash/trim'
import ReactDisqusComments from 'react-disqus-comments'
import About from '../about'
import CategoryBar from '../category-bar'
import SocialBar from '../social-bar'

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

  renderMeta() {
    const post = this.props.data.markdownRemark
    const { title, image, featured, categories } = post.frontmatter

    const siteUrl = trim(get(this.props, `data.site.siteMetadata.siteUrl`), `/`)
    const postUrl = `${siteUrl}/${trim(post.fields.slug, `/`)}`
    let socialImage = image ? image.childImageSharp.fixed.src : featured
    socialImage = socialImage && `${siteUrl}/${trim(socialImage, `/`)}`
    const siteTitle = get(this.props, `data.site.siteMetadata.title`)
    const postTitle = `${title} | ${siteTitle}`
    const keywords = (categories || []).join(` `)
    const description = post.excerpt

    return (
      <Helmet>
        <title>{`${post.frontmatter.title} | ${siteTitle}`}</title>
        {socialImage ? <meta name="image" content={socialImage} /> : null}
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        {socialImage ? (
          <meta property={`og:image`} content={socialImage} />
        ) : null}
        <meta property={`og:type`} content={`article`} />
        <meta poperty={`og:title`} content={postTitle} />
        <meta property={`og:description`} content={description} />
        <meta property={`og:url`} content={postUrl} />
        <meta property={`og:site_name`} content={postTitle} />
        <meta property="twitter:card" content="summary" />
        <meta property={`twitter:title`} content={postTitle} />
        <meta property={`twitter:description`} content={description} />
        {socialImage ? (
          <meta property={`twitter:image`} content={socialImage} />
        ) : null}
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
    console.log(`post`, post)
    let socialImage = post.frontmatter.image ? post.frontmatter.image.childImageSharp.fluid : undefined

    return (
      <section id="blogPost">
        {this.renderMeta()}
        {socialImage ? (
          <Image
            style={{
              height: 300,
            }}
            fluid={socialImage}
            alt="featured image"
          />
        ) : null}

        <SocialBar />

        <h1>{post.frontmatter.title}</h1>
        <CategoryBar
          categories={post.frontmatter.categories}
          date={post.frontmatter.date}
        />

        <div
          className="blogPost__content"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        {this.renderDisqus()}
        <div className="mt-32 md:mt-24 mb-16">
          <About />
        </div>
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
        image {
          childImageSharp {
            fluid(maxWidth: 920) {
              ...GatsbyImageSharpFluid
            }
            fixed(width: 300) {
              ...GatsbyImageSharpFixed
            }
          }
        }
        categories
      }
    }
  }
`
