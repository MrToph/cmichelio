import React, { Component } from 'react'
import { Bio, SocialBar, LatestTweet } from '..'
import styles from './index.css'
import metadata from '../../metadata'
import { joinUri } from 'phenomic'

export default class NavigationMenu extends Component {
  render () {
    /* 17 pixels is size of scrollbar */
    return (
      <nav className={styles.nav}>
        <div className={styles.scrollHide}>
          <Bio />
          <div className='horizontalContainer' style={{justifyContent: 'space-around', width: '100%'}}>
            <a href={`${joinUri(metadata.pkg.homepage, '/')}`}>Blog</a>·
            <a href={`${joinUri(metadata.pkg.homepage, '/about')}`}>About</a>·
            <a href={`${joinUri(metadata.pkg.homepage, '/portfolio')}`}>Portfolio</a>
          </div>
          <SocialBar />
          <LatestTweet />
        </div>
      </nav>
    )
  }
}
