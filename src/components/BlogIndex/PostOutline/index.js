import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import Link from 'gatsby-link'
import get from 'lodash/get'
import CategoryBar from './CategoryBar'

const postContainerStyles = css({
  //   border: `1px solid #d9e1ef`,
  flex: `0 0 100%`,
  margin: `0`,
  overflow: `hidden`,
  position: `relative`,
  padding: `15px 0`,
  ':nth-child(1n)': {
    borderBottom: `1px solid #f0f0f0`,
  },
  clear: `both`,
})

const titleStyles = css({
  margin: `0 0 1rem 0`,
})

const featuredImageWrapperStyles = css({
  display: `inline-flex`,
  justifyContent: `center`,
  alignItems: `flex-start`,
  float: `left`,
  width: `200px`,
  margin: `1rem 0.5rem`,
})

const featuredImageStyles = css({
  maxWidth: 200,
  maxHeight: 200,
})

export default class PostOutline extends React.Component {
  static propTypes = {
    post: PropTypes.shape({
      excerpt: PropTypes.string.isRequired,
      fields: PropTypes.shape({ slug: PropTypes.string.isRequired }).isRequired,
      frontmatter: PropTypes.shape({
        date: PropTypes.string.isRequired,
        featured: PropTypes.string,
        categories: PropTypes.arrayOf(PropTypes.string),
      }).isRequired,
    }).isRequired,
    short: PropTypes.bool,
  }

  static defaultProps = {
    short: false,
  }

  renderExcerpt() {
    if (this.props.short) return null
    const { post } = this.props
    const { frontmatter: { featured } } = post
    return [
      featured && (
        <span key="featureImage" {...featuredImageWrapperStyles}>
          <img src={featured} {...featuredImageStyles} />
        </span>
      ),
      <p key="excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt }} />,
    ]
  }

  render() {
    const { post } = this.props
    const title = get(post, 'frontmatter.title') || post.fields.slug
    return (
      <li {...postContainerStyles}>
        <h3 {...titleStyles}>
          <Link to={post.fields.slug}>{title}</Link>
        </h3>
        <CategoryBar
          date={post.frontmatter.date}
          categories={post.frontmatter.categories}
        />
        {this.renderExcerpt()}
      </li>
    )
  }
}
