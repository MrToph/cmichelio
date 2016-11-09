/* eslint-disable */
import React, { Component, PropTypes } from 'react'
import { getLatestTweet } from '../../services/twitter'
import { isClientSide } from '../../utils'
import axios from 'axios'

export default class LatestTweet extends Component {
  static propTypes = {
  }

  constructor(props) {
      super(props)
      this.state = {tweet: undefined}
  }

  componentWillMount() {
    if(isClientSide()) {
      // console.log('Requesting twitter')
      this.setState({ tweet: undefined })
      var CancelToken = axios.CancelToken;
      this.source = CancelToken.source();
      getLatestTweet(this.source)
      .then(res => {
        this.setState({tweet: res})
      })
      .catch(err => console.error(err))
    }
  }

  componentWillUnmount() {
    this.source.cancel('LatestTweet unmounted and twitter request canceled')
  }

  render () {
    return (
        this.state.tweet ?
        <div className='latestTweet'>
        <h3 style={{textAlign: 'center'}}>Latest Tweet</h3>
        <p dangerouslySetInnerHTML={{__html: this.parseTweet(this.state.tweet)}}>
        </p>
        </div>
        : <div className='latestTweet'></div>
    )
  }

  parseTweet(tweet) {
    let text = tweet.full_text
    if(!tweet.entities) return text
    let entities = [];
    ['hashtags', 'user_mentions', 'urls'].forEach(
      type => {
        if(tweet.entities[type]) {
          tweet.entities[type].forEach(
            // screen_name defined for user mentions
            // expanded_url for urls
            entity => entities.push({type, indices: entity.indices, screen_name: entity.screen_name, expanded_url: entity.expanded_url})
          )
        }
      }
    )
    // sort entities according to their occurence in the String
    entities.sort((a,b) => a.indices[0] - b.indices[0])
    let addedChars = 0
    entities.forEach(
      obj => {
        let before = text.slice(0, addedChars + obj.indices[0])
        let middle = text.slice(addedChars + obj.indices[0], addedChars + obj.indices[1])
        let after = text.slice(addedChars + obj.indices[1])
        // console.log('Running test for: ', middle)
        // console.log('Before:', before)
        // console.log('After:', after)
        let newMiddle = ''
        switch(obj.type) {
          case 'user_mentions':{
            newMiddle = `<a href="//twitter.com/${obj.screen_name}" rel="nofollow noopener noreferrer">${middle}</a>`
            break;
          }
          case 'urls': {
            newMiddle = `<a href="${obj.expanded_url}" rel="nofollow noopener noreferrer">${middle}</a>`
            break;
          }
          case 'hashtags': {
            newMiddle = `<strong>${middle}</strong>`
            break;
          }
          default: throw Error('parseTweet Error')  // never happens
        }
        text = before + newMiddle + after
        addedChars += newMiddle.length - middle.length
      }
    )
    return text
  }
}
