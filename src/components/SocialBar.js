import React, { Component, PropTypes } from 'react'
import { prefixLink } from 'gatsby-helpers'
import { rhythm } from '../utils/typography'
import { SocialIcon } from 'react-social-icons'
import { config } from 'config'
import { linkColor } from '../utils/typography-theme'

export default class SocialBar extends Component {
  static propTypes = {
  }

  render () {
    return (
      <div className='horizontalContainer clearUnderline' style={{ justifyContent: 'space-around', width: '100%', margin: `${rhythm(1)} 0` }}>
      <SocialIcon url={config.twitter} color={linkColor} />
      <SocialIcon url={config.github} color={linkColor} />
      </div>
    )
  }
}
