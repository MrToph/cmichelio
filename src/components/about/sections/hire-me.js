import React from 'react'
import PropTypes from 'prop-types'
import EmailReveal from '../email-reveal'

export default function HireMeSection({ siteMetadata }) {
  return (
    <React.Fragment>
      <p>
        I started programming at the age of 15 👶, graduated with Bachelor and
        Master degrees in{` `}
        <span className="font-bold">Maths and Computer Science</span> 🎓 , and
        have been working professionally as a{` `}
        <span className="font-bold">software developer 👨‍💻</span> since then in
        on-site and remote teams.
      </p>
      <p>
        If you want something built from scratch or need more manpower in your
        team for an existing project, please get in contact with me. I worked on
        many projects in the{` `}
        <span className="font-bold">JavaScript/TypeScript</span>
        {` `}
        (frontend and backend) and{` `}
        <span className="font-bold">blockchain</span> ⛓️ space. Here are some
        technologies I enjoyed working with in the past:
      </p>
      <ul>
        <li>ES6/7, TypeScript, Lerna, Webpack</li>
        <li>
          React, GraphQL - Apollo Client, Redux, Jest, PostCSS / SCSS, Styled
          Components, TailwindCSS
        </li>
        <li>
          Node.js, Express, Koa, GraphQL - Apollo Server, MongoDB, PostgreSQL
        </li>
        <li>Smart Contracts (EOSIO, C++), IPFS</li>
        <li>Smart Contract Security Audits</li>
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
          Interview with {` `}
          <a
            href="https://www.dfuse.io/en/blog/christoph-michel-learn-eos"
            rel="nofollow"
          >
            dfuse.io - In the Eyes of a Blockchain Developer series
          </a>, or interview with {` `}
          <a
            href="https://www.eoswriter.io/165661_meet-the-custodians-episode-3-christoph-michel.eos"
            rel="nofollow"
          >
            eoswriter
          </a>, also available in <a
            href="http://cn.eoswriter.io/6970_vigor-chris.eos"
            rel="nofollow"
          >
            Chinese
          </a>.
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
          reddit post:
          <blockquote>
            Christoph Michel has written a number of good articles about React,
            React Native, and Redux
          </blockquote>
        </li>
        <li>
          Considered one of the{` `}
          <a
            href="https://ideamotive.co/blog/best-react-native-experts-blogs/"
            rel="nofollow"
          >
            17 React Native experts and Blogs To follow in 2018
          </a>
          .
          <blockquote>
            Christoph has written a number of good articles about React, React
            Native, and Redux. Although he doesn’t exclusively write about
            mobile app development, his blog is still worth visiting.
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
