import React from 'react'
import PropTypes from 'prop-types'

export default function MoreInfoButton({ onClick, children }) {
  return <button onClick={onClick} className="text-black font-bold bg-green px-1">{children}</button>
}

MoreInfoButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}
