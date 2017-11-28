import React, { Component } from 'react'
import Link from 'gatsby-link'
import { css } from 'glamor'
import { Bio, SocialBar, LatestTweet } from '..'
import { navBarWidth } from '../../styling'

const navStyles = css({
  position: `fixed`,
  overflow: `hidden`,
  height: `100%`,
  top: `0.75rem`,
  width: `${navBarWidth}`,
  maxHeight: `100%`,
  padding: `0`,
})

const scrollHide = css({
  boxSizing: `border-box`,
  height: `inherit`,
  textAlign: `center`,
  overflowY: `scroll` /* make the scroll bar always appear */,
  width: `calc(${navBarWidth} + 17px)` /* rhythm(8 + pixelToRhythm(17)), */,
  padding: `0 calc(0.375rem + 17px) 0 0.375rem`,
})

export default class NavigationMenu extends Component {
  render() {
    /* 17 pixels is size of scrollbar */
    return (
      <nav {...navStyles}>
        <div {...scrollHide}>
          <Bio />
          <div
            css={{
              display: 'flex',
              justifyContent: 'space-around',
              width: '100%',
            }}
          >
            <Link to={`/`}>Blog</Link>
            <Link to={`/about`}>About</Link>
            <Link to={`/portfolio`}>Portfolio</Link>
          </div>
          <SocialBar />
          <LatestTweet />
        </div>
      </nav>
    )
  }
}
