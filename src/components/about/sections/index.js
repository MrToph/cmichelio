import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import AuthorSection from './author'
import HireMeSection from './hire-me'
import StalkMeSection from './stalk-me'
import DeveloperSection from './developer'
import AuditorSection from './auditor'

export function SectionHeader({ section }) {
  switch (section) {
    case `developer`:
      return `👨‍💻 Developer`
    case `auditor`:
      return `🏹🐛 Auditor`
    case `author`:
      return `✍️ Author`
    case `openSource`:
      return `👾️ Open-source Work`
    case `hireMe`:
      return `🦸‍♂️ Hire Me`
    case `stalkMe`:
      return `🧟‍♂️ Stalk Me`
  }
}

function SectionContent(props) {
  const {
    section,
    data: {
      site: { siteMetadata },
    },
  } = props
  switch (section) {
    case `developer`:
      return <DeveloperSection siteMetadata={siteMetadata} />
    case `auditor`:
      return <AuditorSection siteMetadata={siteMetadata} />
    case `author`:
      return <AuthorSection siteMetadata={siteMetadata} />
    case `openSource`:
      return (
        <p>
          See my open-source contributions on{` `}
          <a
            href={`//github.com/${siteMetadata.github}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      )
    case `hireMe`:
      return <HireMeSection siteMetadata={siteMetadata} />
    case `stalkMe`:
      return <StalkMeSection siteMetadata={siteMetadata} />
    default: 
      throw new Error(`Unknown section: ${section}`)
  }
}

SectionContent.propTypes = {
  section: PropTypes.string.isRequired,
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        twitter: PropTypes.string.isRequired,
        steem: PropTypes.string.isRequired,
        medium: PropTypes.string.isRequired,
        github: PropTypes.string.isRequired,
        linkedIn: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
}

export function SectionContentContainer(props) {
  return (
    <StaticQuery
      query={graphql`
        query SectionContentQuery {
          ...SocialMediaFragment
        }
      `}
      render={(data) => <SectionContent {...props} data={data} />}
    />
  )
}

export const SocialMediaFragment = graphql`
  fragment SocialMediaFragment on Query {
    site {
      siteMetadata {
        twitter
        github
        medium
        steem
        linkedIn
      }
    }
  }
`
