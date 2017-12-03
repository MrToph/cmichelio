import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { primaryColor } from '../styling'

const pageTitleStyles = css({
  color: primaryColor,
})

export default function PageTitle({ children }) {
  return <h1 {...pageTitleStyles}>{children}</h1>
}

PageTitle.propTypes = {
  children: PropTypes.node.isRequired,
}
