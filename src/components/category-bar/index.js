import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import './category-bar.css'

const CategoryBar = props => {
  const renderCategories = () => {
    const { categories } = props
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
              className="category-bar__link"
            >
              <small className="text-sm">{category}</small>
            </Link>
          ))}
        </nav>
      </React.Fragment>
    )
  }

  const { date } = props
  return (
    <div className="category-bar">
      {renderCategories()}
      <div className="flex-auto" />
      <time className="font-semibold">{date}</time>
    </div>
  )
}

CategoryBar.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string),
  date: PropTypes.string.isRequired,
}

export default CategoryBar
