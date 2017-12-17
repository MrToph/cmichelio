/* global window */
import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { Helmet } from 'react-helmet'
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

/**
 * We're using the Twitter Widget JS API to create the timeline
 * instead of twttr.widgets.load
 * and we use React-Helmet to inject the twitter widget script
 * instead of the `gatsby-plugin-twitter`
 * because it's more reliable this way
 * Otherwise you sometimes get a twitter widget not initialized error
 * Error: sandbox not initialized
    at e.addRootClass
 */
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
    this.refreshTweet()
  }

  refreshTweet = () => {
    const { twitter } = this.props.data.site.siteMetadata
    if (
      isClientSide() &&
      typeof window.twttr !== 'undefined' &&
      window.twttr.widgets
    ) {
      window.twttr.widgets.createTimeline(
        {
          sourceType: 'profile',
          screenName: twitter,
        },
        document.getElementById('latestTweet'),
        {
          tweetLimit: 1,
          chrome: 'nofooter, noheader, noscrollbar, transparent',
          dnt: true,
          width: '100%',
        }
      )
    } else {
      // twitter script not loaded yet, retry again
      // only happens on local development with `gatsby develop`
      // but not when built
      setTimeout(this.refreshTweet, 100)
    }
  }

  shouldComponentUpdate() {
    return false
  }

  render() {
    return (
      <div id="latestTweet" {...tweetCardStyles}>
        <h3 style={{ textAlign: 'center' }}>Latest Tweet</h3>
        <Helmet script={[{ src: `https://platform.twitter.com/widgets.js`, async: true }]} />
      </div>
    )
  }
}
