import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'

export default function AuditorSection({ siteMetadata }) {
  return (
    <React.Fragment>
      <p>
        I perform security audits for blockchain projects. I earned over $1M in
        public bug bounties and competitve audit contests.
      </p>
      <ul>
        <li>
          I'm currently ranked #1 on{' '}
          <a
            href="https://code4rena.com/leaderboard/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Code4rena's all-time leaderboard
          </a>{' '}
          with $1.3M in earnings. I wrote about my{' '}
          <Link to="/code4rena-first-1m-stats/">stats and reflections</Link>.
        </li>
        <li>
          I audited projects like OpenSea, OlympusDAO, Ribbon Finance, and more.
          You can see examples of audits I did with <em>Spearbit</em> on their{' '}
          <a
            href="https://github.com/spearbit/portfolio"
            target="_blank"
            rel="noopener noreferrer"
          >
            portfolio page
          </a>
          . I also do independent audits.
        </li>
        <li>
          I give talks at security conferences, like my{' '}
          <a
            href="https://www.youtube.com/watch?v=5zA8hOhMlPE&list=PL5r4vTR0gHj4hpWSe2w6593AZnc5iwmVt&index=26"
            target="_blank"
            rel="noopener noreferrer"
          >
            history of price manipulation attacks
          </a>{' '}
          talk at{' '}
          <a
            href="https://defisecuritysummit.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            DeFi Security Summit - Stanford Blockchain Week 2022
          </a>
          .
        </li>
      </ul>
    </React.Fragment>
  )
}

AuditorSection.propTypes = {
  siteMetadata: PropTypes.shape({
    twitter: PropTypes.string.isRequired,
    steem: PropTypes.string.isRequired,
    medium: PropTypes.string.isRequired,
    github: PropTypes.string.isRequired,
    linkedIn: PropTypes.string.isRequired,
  }).isRequired,
}
