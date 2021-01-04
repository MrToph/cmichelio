import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import AuthorSection from './author'
import HireMeSection from './hire-me'
import StalkMeSection from './stalk-me'
import IndieMakerSection from './indie-maker'

export function SectionHeader({ section }) {
  switch (section) {
    case `developer`:
      return `👨‍💻 Developer`
    case `indieMaker`:
      return `👷‍♂️ Indie Maker`
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
      return (
        <React.Fragment>
          <p>
            I started programming at the age of 15 👶, graduated with Bachelor
            and Master degrees in{` `}
            <span className="font-bold">Maths and Computer Science</span> 🎓 ,
            and have been working professionally as a{` `}
            <span className="font-bold">software engineer 👨‍💻</span> since then.
          </p>
          <p>
            My main focus is on <span className="font-bold">JavaScript</span>
            {` `}
            (frontend and backend) and{` `}
            <span className="font-bold">Web 3.0 blockchain technologies</span>.
            ⛓️ Here are some technologies I enjoy working with:
          </p>
          <ul>
            <li>TypeScript, JS ES2020, Lerna, Webpack, Rollup</li>
            <li>
              React, GraphQL - Apollo Client, Mobx, Jest, PostCSS / SCSS, Styled
              Components, TailwindCSS
            </li>
            <li>
              Node.js, Express, Koa, GraphQL - Apollo Server, MongoDB,
              PostgreSQL
            </li>
            <li>EOS, ETH, IPFS</li>
            <li>Smart Contract Security Audits</li>
          </ul>
          <p>
            Check out my{` `}
            <a
              href={`//github.com/${siteMetadata.github}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            {` `}
            to stay up-to-date on what I{`'`}m working on.
          </p>
        </React.Fragment>
      )
    case `indieMaker`:
      return <IndieMakerSection siteMetadata={siteMetadata} />
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
      render={data => <SectionContent {...props} data={data} />}
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
