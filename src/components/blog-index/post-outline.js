import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import get from 'lodash/get'
import FeaturedImage from './featured-image'
import CategoryBar from '../category-bar'
import './post-outline.css'


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

    return (
      <React.Fragment>
        <FeaturedImage frontmatter={post.frontmatter} />
        <p dangerouslySetInnerHTML={{ __html: post.excerpt }} />
      </React.Fragment>
    )
  }

  render() {
    const { post } = this.props
    const title = get(post, `frontmatter.title`) || post.fields.slug

    return (
      <li className="postOutline">
        <Link to={post.fields.slug} className="postOutline__link">
          <h3 className="mb-4">{title}</h3>
          {this.renderExcerpt()}
        </Link>
        <CategoryBar
          date={post.frontmatter.date}
          categories={post.frontmatter.categories}
        />
      </li>
    )
  }
}
