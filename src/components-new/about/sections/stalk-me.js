import React from 'react'
import PropTypes from 'prop-types'

export default function StalkMeSection({ siteMetadata }) {
  return (
    <React.Fragment>
      <ul>
          <li>Spotify</li>
          <li>Get Maker Log</li>
          <li>GitHub contribution graph?</li>
          <li>toggl?</li>
          <li>Latest Twitter Post</li>
          <li>Link to all social media? SOcialBar from old cmichel.io</li>
        </ul>
    </React.Fragment>
  )
}

StalkMeSection.propTypes = {
  siteMetadata: PropTypes.shape({
    twitter: PropTypes.string.isRequired,
    steem: PropTypes.string.isRequired,
    medium: PropTypes.string.isRequired,
    github: PropTypes.string.isRequired,
    linkedIn: PropTypes.string.isRequired,
  }).isRequired,
}
