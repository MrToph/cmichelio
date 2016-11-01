import React, { Component, PropTypes } from 'react'
import { Bio } from '../components'
import { rhythm } from '../utils/typography'

export default class NavigationMenu extends Component {
  static propTypes = {
  }

  render () {
    return (
      <nav style={{maxWidth: rhythm(8), padding: rhythm(0.25)}}>
        <Bio />
      </nav>
    )
  }
}
