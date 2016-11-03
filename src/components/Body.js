import React, { Component, PropTypes } from 'react'
import { prefixLink } from 'gatsby-helpers'
import { NavigationMenu } from '../components'
import { rhythm } from 'utils/typography'

const BUILD_TIME = new Date().getTime()

export default class Body extends Component {
  static propTypes = {
    body: PropTypes.string
  }

  render () {
    return (
      <body>
        <div id='page' style={{maxWidth: rhythm(32)}}>
          <NavigationMenu />
          <div id='react-mount' style={{marginLeft: rhythm(8), maxWidth: rhythm(24)}} dangerouslySetInnerHTML={{ __html: this.props.body }} />
        </div>
        <script src={prefixLink(`/bundle.js?t=${BUILD_TIME}`)} />
      </body>
    )
  }
}

// <body className='landing-page'>
//   <div className='horizontalContainer'>
//     <NavigationMenu />
//     <div id='react-mount' dangerouslySetInnerHTML={{ __html: this.props.body }} />
//   </div>
//   <script src={prefixLink(`/bundle.js?t=${BUILD_TIME}`)} />
// </body>
