import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import Makerlog from '../../stats/makerlog';

export default function IndieMakerSection({ siteMetadata }) {
  return (
    <React.Fragment>
      <p>
        I build products that are useful to myself, or with the intention of
        making a profit. (Usually both.)
      </p>
      <p>
        You can read my blog, my{` `}
        <Link to="/categories/Progress%20Report">monthly progress-reports</Link>
        {` `}
        or check out my{` `}
        <a
          href={`//github.com/${siteMetadata.github}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        {` `}
        to stay up-to-date on what I'm currently working on. Here's a live
        {` `}
        <span className="font-bold">MakerLog</span> on last week's
        accomplishments:
      </p>
      <Makerlog />
    </React.Fragment>
  )
}

IndieMakerSection.propTypes = {
    siteMetadata: PropTypes.shape({
      twitter: PropTypes.string.isRequired,
      steem: PropTypes.string.isRequired,
      medium: PropTypes.string.isRequired,
      github: PropTypes.string.isRequired,
      linkedIn: PropTypes.string.isRequired,
    }).isRequired,
  }
  