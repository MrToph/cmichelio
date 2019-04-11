import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'

export default class CategoryBarPost extends React.Component {
  static propTypes = {
    categories: PropTypes.arrayOf(PropTypes.string),
    date: PropTypes.string.isRequired,
  }

  renderCategories = () => {
    const { categories } = this.props
    if (!Array.isArray(categories)) return null
    return (
      <React.Fragment>
        <i key="categoryDescription">
          {categories.length >= 2 ? `Categories: ` : `Category: `}
        </i>
        <nav key="categoryTags">
          {categories.map(category => (
            <Link
              key={category}
              to={`/categories/${category}`}
            >
              <small>{category}</small>
            </Link>
          ))}
        </nav>
      </React.Fragment>
    )
  }

  render() {
    const { date } = this.props
    return (
      <div>
        {this.renderCategories()}
        <time>{date}</time>
      </div>
    )
  }
}
