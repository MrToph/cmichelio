import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { primaryColor } from '../../styling'

const pageTitleStyles = css({
  color: primaryColor,
})

export default class PostOutline extends React.Component {
  static propTypes = {
    selectedCategory: PropTypes.string.isRequired,
  }

  render() {
    const { selectedCategory } = this.props
    if (!selectedCategory) {
      return <h1 {...pageTitleStyles}>Latest Posts</h1>
    }

    return (
      <h1 {...pageTitleStyles}>{`Latest Posts for category: ${
        selectedCategory
      }`}</h1>
    )
  }
}
