import React, { Component } from 'react'
import { SocialIcon } from 'react-social-icons'
import metadata from '../../metadata'
import { linkColor } from '../../styling'

export default class SocialBar extends Component {
  render () {
    return (
      <div className='horizontalContainer clearUnderline' style={{ justifyContent: 'space-around', width: '100%', margin: `1.5rem 0` }}>
        <SocialIcon url={metadata.twitter} color={linkColor} />
        <SocialIcon url={metadata.github} color={linkColor} />
      </div>
    )
  }
}
