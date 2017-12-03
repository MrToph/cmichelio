import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import Link from 'gatsby-link'

const dateStyles = css({
  margin: `0 0 0 20px`,
  fontWeight: 500,
})

const tagContainerStyles = css({
  display: `inline-block`,
})

const tagLinkStyles = css({
  margin: `0 5px`,
})

export default class CategoryBarPost extends React.Component {
  static propTypes = {
    categories: PropTypes.arrayOf(PropTypes.string),
    date: PropTypes.string.isRequired,
  }

  renderCategories = () => {
    const { categories } = this.props
    if (!Array.isArray(categories)) return null
    return [
      <i key="categoryDescription">{categories.length >= 2 ? 'Categories: ' : 'Category: '}</i>,
      <nav key="categoryTags" {...tagContainerStyles}>
        {categories.map((category) => (
          <Link key={category} {...tagLinkStyles} to={`/categories/${category}`}>
            <small>{category}</small>
          </Link>
        ))}
      </nav>,
    ]
  }

  render() {
    const { date } = this.props
    return (
      <div>
        {this.renderCategories()}
        <time {...dateStyles}>{date}</time>
      </div>
    )
  }
}
