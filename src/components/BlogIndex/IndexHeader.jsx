import React from 'react'
import PropTypes from 'prop-types'

export default class PostOutline extends React.Component {
  static propTypes = {
    selectedCategory: PropTypes.string.isRequired,
  }

  render() {
    const { selectedCategory } = this.props
    if (!selectedCategory) {
        return (
         <h1>Latest Posts</h1>
        )
    }

    return (
        <h1>{`Latest Posts for category: ${selectedCategory}`}</h1>
    )
  }
}
