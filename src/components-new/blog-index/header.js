import React from 'react'
import PropTypes from 'prop-types'

export default class BlogIndexHeader extends React.Component {
  static propTypes = {
    selectedCategory: PropTypes.string.isRequired,
  }

  render() {
    const { selectedCategory } = this.props

    let text = `Latest Posts`
    if (selectedCategory) {
      text = `Latest Posts for category: ${selectedCategory}`
    }

    return <h1 className="text-grey">{text}</h1>
  }
}
