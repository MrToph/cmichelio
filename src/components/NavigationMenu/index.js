import React, { Component } from 'react'
import { Bio, SocialBar, LatestTweet } from '..'
import styles from './index.css'
import { Link } from 'react-router'

export default class NavigationMenu extends Component {
  render () {
    /* 17 pixels is size of scrollbar */
    return (
      <nav className={styles.nav}>
        <div className={styles.scrollHide}>
          <Bio />
          <div className='horizontalContainer' style={{justifyContent: 'space-around', width: '100%'}}>
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
