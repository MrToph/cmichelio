import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'

export default function DeveloperSection({ siteMetadata }) {
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
      My main focus is on{' '}
      <span className="font-bold">smart contract</span> and full-stack
      {` `}
      <span className="font-bold">Web 3.0 blockchain technologies</span>.
      ⛓️ Here are some technologies I enjoy working with:
    </p>
    <ul>
      <li>Solidity, low-level EVM optimizations, ETH, IPFS</li>
      <li>
        TypeScript. React, Mobx, CSS-in-JS, TailwindCSS. Node.js,
        PostgreSQL
      </li>
      <li>Rust</li>
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
}

DeveloperSection.propTypes = {}
