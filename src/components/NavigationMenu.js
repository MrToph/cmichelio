import React, { Component, PropTypes } from 'react'
import { Bio } from '../components'
import { rhythm } from '../utils/typography'

export default class NavigationMenu extends Component {
  static propTypes = {
  }

  render () {
    return (
      <nav style={{maxWidth: rhythm(8)}}>
        <h1>HTML</h1>
        <Bio />
      </nav>
    )
  }
}
