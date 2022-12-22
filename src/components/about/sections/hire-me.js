import React from 'react'
import PropTypes from 'prop-types'
import EmailReveal from '../email-reveal'

export default function HireMeSection({ siteMetadata }) {
  return (
    <React.Fragment>
      <p>
        I started programming at the age of 15, graduated with Bachelor and
        Master degrees in{` `}
        <span className="font-bold">Maths and Computer Science</span> 🎓 , and
        have been working professionally as a{` `}
        <span className="font-bold">software engineer 👨‍💻</span> and{' '}
        <span className="font-bold">security auditor 🏹🐛</span> since then in
        on-site and remote teams.
      </p>
      <p>
        If you want something audited, built from scratch or need more manpower
        in your team for an existing project, please get in contact with me. I
        worked on many projects in the{` `}
        <span className="font-bold">Solidity</span> and
        <span className="font-bold">JavaScript/TypeScript</span>
        {` `}
        (frontend and backend) <span className="font-bold">blockchain</span> ⛓️
        space. Here are some technologies I enjoyed working with in the past:
      </p>
      <ul>
        <li>smart contracts with Solidity, low-level EVM optimizations</li>
        <li>
          TypeScript. React, Mobx, CSS-in-JS, TailwindCSS. Node.js, PostgreSQL
        </li>
        <li>Rust</li>
      </ul>
      <p>
        Having said that, I learn extremely fast and I'm confident I can pick up
        and be productive with any technology within a couple of days.
      </p>
      <h3>References</h3>
      <p>
        For a first impression, here 's what other people say about me and my
        work:
      </p>
      <ul>
        <li>
          As of 2023, I'm ranked the #1 security auditor out of 816 on{' '}
          <a
            href="https://code4rena.com/leaderboard/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Code4rena's all-time leaderboard
          </a>{' '}
          with $1.3M in earnings. (2023)
        </li>
        <li>
          Interview with {` `}
          <a
            href="https://medium.com/@dfuseio/in-the-eyes-of-a-blockchain-developer-christoph-michel-author-of-learn-eos-7b69f3266d4"
            rel="nofollow"
          >
            dfuse.io (now streamingfast.io) - In the Eyes of a Blockchain Developer series (2019)
          </a>
          .
        </li>
        <li>
          Mark Erikson, maintainer of Redux, in his{` `}
          <a
            href="https://www.reddit.com/r/reactjs/comments/5t8loz/what_are_your_top_reactreact_native_blogs_that/"
            rel="nofollow"
          >
            high quality blogs
          </a>
          {` `}
          reddit post (2016):
          <blockquote>
            Christoph Michel has written a number of good articles about React,
            React Native, and Redux
          </blockquote>
        </li>
        <li>
          Receiver of{` `}
          <a href="https://www.fdsi.org/index.php?id=7">
            2016's "Günter Hotz medal"
          </a>
          {` `}
          for outstanding academical graduate studies.
          <blockquote>
            Christoph Michel: "Maliciously Secure Controlled Functional
            Encryption" (Prof. Dr. Dominique Schröder)
          </blockquote>
        </li>
        <li>
          CV available on{` `}
          <a
            href={`//linkedin.com/in/${siteMetadata.linkedIn}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          .
        </li>
      </ul>
      <p>
        For further references and past work samples please get in touch, or
        have a look at some of my open-source code on{` `}
        <a
          href={`//github.com/${siteMetadata.github}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </p>
      <h3>Contact</h3>
      <p>
        I'm looking forward to your detailed proposals to discuss a joint
        collaboration on projects.
        <br />
        <EmailReveal />
      </p>
    </React.Fragment>
  )
}

HireMeSection.propTypes = {
  siteMetadata: PropTypes.shape({
    twitter: PropTypes.string.isRequired,
    steem: PropTypes.string.isRequired,
    medium: PropTypes.string.isRequired,
    github: PropTypes.string.isRequired,
    linkedIn: PropTypes.string.isRequired,
  }).isRequired,
}
