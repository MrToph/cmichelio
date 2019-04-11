import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import './category-bar.css'

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
        <span className="italic font-light">
          {categories.length >= 2 ? `Categories: ` : `Category: `}
        </span>
        <nav className="mx-4">
          {categories.map(category => (
            <Link
              key={category}
              to={`/categories/${category}`}
              className="link"
            >
              <small className="text-sm">{category}</small>
            </Link>
          ))}
        </nav>
      </React.Fragment>
    )
  }

  render() {
    const { date } = this.props
    return (
      <div className="category-bar">
        {this.renderCategories()}
        <div className="flex-auto" />
        <time className="font-semibold">{date}</time>
      </div>
    )
  }
}
