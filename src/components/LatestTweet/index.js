/* eslint-disable */
/* global twttr */
import React from 'react'
import { isClientSide } from '../../utils'
import styles from './index.css'

export default class LatestTweet extends React.Component {
  componentDidMount() {
    if(isClientSide() && typeof twttr !== 'undefined' && twttr.widgets) {
      twttr.widgets.load(document.getElementById("LatestTweet"))
    }
  }

  render(){
    return (
        <div id="LatestTweet" className={styles.latestTweet}>
            <h3 style={{textAlign: 'center'}}>Latest Tweet</h3>
            <a className="twitter-timeline" data-width="180" data-dnt="true" data-tweet-limit="1" data-chrome="nofooter noheader transparent" href="https://twitter.com/cmichelio"></a>
        </div>
    )
  }

  shouldComponentUpdate() { return false }
}
