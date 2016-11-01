import React from 'react'
import { config } from 'config'
import { rhythm } from 'utils/typography'
import { prefixLink } from 'gatsby-helpers'
import profilePic from '../images/cropped-me_color.jpg'

class Bio extends React.Component {
  render () {
    return (
      <div className='Bio'>
      <img
          src={prefixLink(profilePic)}
          alt={`author ${config.authorName}`}
          style={{
            width: rhythm(4)
          }}
        />
      <p
        style={{
          marginBottom: rhythm(0.25),
        }}
      >
        Written by <strong>{config.authorName}</strong> who lives. <a href="https://twitter.com/kylemathews">You should follow him on Twitter</a>
      </p>
      </div>
    )
  }
}

export default Bio
