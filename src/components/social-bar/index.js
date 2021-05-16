import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import TwitterIcon from './icons/twitter.svg'
import GitHubIcon from './icons/github.svg'
import RSSIcon from './icons/rss.svg'
import MediumIcon from './icons/medium.svg'
import SteemitIcon from './icons/steemit.svg'
import LinkedInIcon from './icons/linkedin.svg'

const Icon = ({ icon, url }) => (
  <a className="social-bar__link" rel="noopener noreferrer" target="__blank" href={url}>
    <img src={icon} className="social-bar__icon" alt={url} />
  </a>
)

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  scale: PropTypes.number,
}

class SocialBar extends Component {
  static propTypes = {
    data: PropTypes.shape({
      site: PropTypes.shape({
        siteMetadata: PropTypes.shape({
          twitter: PropTypes.string,
          github: PropTypes.string,
          medium: PropTypes.string,
          steem: PropTypes.string,
          linkedIn: PropTypes.string,
        }),
      }),
    }).isRequired,
  }

  render() {
    const { data } = this.props
    return (
      <ul className="flex flex-row justify-start w-full p-0 list-none my-4 mx-0">
        <li className="mr-6">
          <Icon url={`/feed.xml`} icon={RSSIcon} />
        </li>
        <li className="mr-6">
          <Icon
            url={`//medium.com/@${data.site.siteMetadata.medium}`}
            icon={MediumIcon}
          />
        </li>
        <li className="mr-6">
          <Icon
            url={`//hive.blog/@${data.site.siteMetadata.steem}`}
            icon={SteemitIcon}
          />
        </li>
        <li className="mr-6">
          <Icon
            url={`//github.com/${data.site.siteMetadata.github}`}
            icon={GitHubIcon}
          />
        </li>
        <li className="mr-6">
          <Icon
            url={`//twitter.com/${data.site.siteMetadata.twitter}`}
            icon={TwitterIcon}
          />
        </li>
        <li className="mr-6">
          <Icon
            url={`//linkedin.com/in/${data.site.siteMetadata.linkedIn}`}
            icon={LinkedInIcon}
          />
        </li>
      </ul>
    )
  }
}

export default function SocialBarContainer(props) {
  return (
    <StaticQuery
      query={graphql`
        query SocialBarQuery {
          ...SocialMediaFragment
        }
      `}
      render={data => <SocialBar {...props} data={data} />}
    />
  )
}
