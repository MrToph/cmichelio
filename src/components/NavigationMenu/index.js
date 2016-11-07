import React, { Component } from 'react'
import { Bio, SocialBar, LatestTweet } from '..'
import styles from './index.css'

export default class NavigationMenu extends Component {
  render () {
    /* 17 pixels is size of scrollbar */
    return (
      <nav className={styles.nav}>
        <div className={styles.scrollHide}>
          <Bio />
          <div className='horizontalContainer' style={{justifyContent: 'space-around', width: '100%'}}>
            <a href={'/'}>Blog</a>·
            <a href={'/about'}>About</a>·
            <a href={'/portfolio'}>Portfolio</a>
          </div>
          <SocialBar />
          <LatestTweet />
        </div>
      </nav>
    )
  }
}
