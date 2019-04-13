import React from 'react'
import PropTypes from 'prop-types'
import Logo from './logo'
import './about.css'

export default function About(props) {
  return (
    <React.Fragment>
      <Logo />
      <h1 className="text-grey">{`Hi, I'm Christoph 👋`}</h1>
    </React.Fragment>
  )
}

About.propTypes = {}
