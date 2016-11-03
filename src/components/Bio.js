import React from 'react'
import { config } from 'config'
import { rhythm } from 'utils/typography'
import { prefixLink } from 'gatsby-helpers'
import profilePic from '../../images/cropped-me_color.png'

class Bio extends React.Component {
  render () {
    return (
      <div className='Bio, verticalContainer'>
        <img src={prefixLink(profilePic)} alt={`author ${config.authorName}`} style={{ width: rhythm(4), marginBottom: 0 }} />
        <h1 style={{marginTop: rhythm(1)}}><a href={prefixLink('/')}>cmichel.io</a></h1>
        <p style={{ marginBottom: rhythm(0.25), textAlign: 'center' }}>
          Christoph Michel
        </p>
      </div>
    )
  }
}

export default Bio
