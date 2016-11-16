import React, { Component } from 'react'
import { SocialIcon } from 'react-social-icons'
import metadata from '../../metadata'
import { primaryColor } from '../../styling'

export default class SocialBar extends Component {
  render () {
    return (
      <div className='horizontalContainer clearUnderline' style={{ justifyContent: 'space-around', width: '100%', margin: `1.5rem 0` }}>
        <SocialIcon url={metadata.twitter} color={primaryColor} />
        <SocialIcon url={metadata.github} color={primaryColor} />
      </div>
    )
  }
}
