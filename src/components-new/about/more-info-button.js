import React from 'react'
import PropTypes from 'prop-types'
import './more-info-button.css'

export default function MoreInfoButton({ onClick, children }) {
  return <button onClick={onClick} className="moreInfoButton">{children}</button>
}

MoreInfoButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}
