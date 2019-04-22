import React from 'react'
import PropTypes from 'prop-types'

export default class BlogIndexHeader extends React.Component {
  static propTypes = {
    selectedCategory: PropTypes.string.isRequired,
  }

  render() {
    const { selectedCategory } = this.props

    let text = `Latest Articles`
    if (selectedCategory) {
      text = `Latest Articles for category: ${selectedCategory}`
    }

    return <h1 className="mt-24 text-grey">{text}</h1>
  }
}
