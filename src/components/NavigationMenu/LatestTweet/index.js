/* global twttr */
import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { isClientSide } from '../../../utils'
import { singleColumnMediaQuery } from '../../../styling'

const tweetCardStyles = css({
  display: `inline-block`,
  width: `100%`,
  fontFamily: `"Helvetica Neue", Roboto, "Segoe UI", Calibri, sansserif`,
  fontSize: `12px`,
  fontWeight: `bold`,
  lineHeight: `16px`,
  borderColor: `#eee #ddd #bbb`,
  borderRadius: `5px`,
  borderStyle: `solid`,
  borderWidth: `1px`,
  boxShadow: `0 1px 3px rgba(0, 0, 0, 0.15)`,
  padding: `0`,
  overflow: `hidden`,
  [singleColumnMediaQuery]: {
    width: `auto`,
  },
})

export default class LatestTweet extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      site: PropTypes.shape({
        siteMetadata: PropTypes.shape({
          twitter: PropTypes.string.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
  }

  componentDidMount() {
    if (isClientSide() && typeof twttr !== 'undefined' && twttr.widgets) {
      twttr.widgets.load(document.getElementById('latestTweet'))
    }
  }

  render() {
    const { twitter } = this.props.data.site.siteMetadata
    return (
      <div id="latestTweet" {...tweetCardStyles}>
        <h3 style={{ textAlign: 'center' }}>Latest Tweet</h3>
        <a
          className="twitter-timeline"
          data-width="100%"
          data-dnt="true"
          data-tweet-limit="1"
          data-chrome="nofooter noheader transparent"
          href={`https://twitter.com/${twitter}`}
        />
      </div>
    )
  }

  shouldComponentUpdate() {
    return false
  }
}
