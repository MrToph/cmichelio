import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { SocialIcon } from 'react-social-icons'
// import metadata from '../../metadata'
import { primaryColor } from '../../styling'
import TwitterIcon from './icons/twitter.svg'
import GitHubIcon from './icons/github.svg'
import MediumIcon from './icons/medium.svg'
import SteemitIcon from './icons/steemit.svg'
import LinkedInIcon from './icons/linkedin.svg'

const iconStyles = css({
  width: 20,
  height: 20,
  border: 'none',
  outline: 'none',
  transition: 'all 0.4s ease-in-out',
  // make all icons black
  filter: 'brightness(0%)',
  ':hover': {
    // opacity: 0.5,
    filter: 'none',
    cursor: 'pointer',
    transform: 'scale(1.1)',
  },
})

const Icon = ({ icon, url }) => (
  <a rel="noopener noreferrer" target="__blank" href={url}>
    <img src={icon} {...iconStyles} />
  </a>
)

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
}

export default class SocialBar extends Component {
  render() {
    console.log(TwitterIcon)
    return (
      <ul
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          padding: `1rem`,
          listStyleType: 'none',
          margin: 0,
        }}
      >
        {/* <li>
          <a rel="noopener noreferrer" target="__blank" href="//yuppi.es/atom">
            <Icon icon="rss" />
          </a>
        </li> */}
        <li>
          <Icon url="//twitter.com/cmichelio" icon={TwitterIcon} />
        </li>
        <li>
          <Icon url="//github.com/MrToph" icon={GitHubIcon} />
        </li>
        <li>
          <Icon url="//twitter.com/cmichelio" icon={MediumIcon} />
        </li>
        <li>
          <Icon url="//twitter.com/cmichelio" icon={SteemitIcon} />
        </li>
        <li>
          <Icon url="//twitter.com/cmichelio" icon={LinkedInIcon} />
        </li>
      </ul>
    )
  }
}
