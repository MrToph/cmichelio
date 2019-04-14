import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import AuthorSection from './sections/author'
import './more-info-button.css'

function getSectionHeader({ section }) {
  switch (section) {
    case `developer`:
      return `👨‍💻 Developer`
    case `indieMaker`:
      return `👷‍♂️ Indie Maker`
    case `author`:
      return `✍️ Author`
    case `openSource`:
      return `👾⚙️🔧 Open-source Work`
    case `hireMe`:
      return `🦸‍♂️ Hire Me`
    case `stalkMe`:
      return `🧟‍♂️ Stalk Me`
  }
}

function getSectionContent({ section }) {
  switch (section) {
    case `developer`:
      return (
        <React.Fragment>
          <p>
            I started programming at the age of 15 👶, graduated with Bachelor
            and Master degrees in{` `}
            <span className="font-bold">Maths and Computer Science</span> 🎓 ,
            and have been working professionally as a{` `}
            <span className="font-bold">software developer 👨‍💻</span> since then.
          </p>
          <p>
            My main focus is on <span className="font-bold">JavaScript</span>
            {` `}
            (frontend and backend) and{` `}
            <span className="font-bold">Web 3.0 blockchain technologies</span>.
            ⛓️ Here are some technologies I enjoy working with:
          </p>
          <ul>
            <li>ES6/7, TypeScript, Lerna, Webpack, Rollup</li>
            <li>
              React, GraphQL - Apollo Client, Redux, Jest, PostCSS / SCSS,
              TailwindCSS
            </li>
            <li>
              Node.js, Express, Koa, GraphQL - Apollo Server, MongoDB,
              PostgreSQL
            </li>
            <li>EOS, IPFS</li>
          </ul>
          <p>
            Check out my <a href="TODO">GitHub</a> to stay up-to-date on what I
            {`'`}m working on.
          </p>
        </React.Fragment>
      )
    case `indieMaker`:
      return (
        <React.Fragment>
          <p>
            I build products that are useful to myself, or with the intention of
            making a profit. (Usually both.)
          </p>
          <p>
            You can read my blog, my{` `}
            <Link to="/categories/Progress%20Report">
              monthly progress-reports
            </Link>
            {` `}
            or check out my <a href="TODO">GitHub</a> to stay up-to-date on what
            I'm currently working on. Here's a live{` `}
            <span className="font-bold">MakerLog</span> on last week's
            accomplishments:
          </p>
          <iframe
            title="Makerlog Embed"
            height="200"
            style={{ width: `100%` }}
            scrolling="no"
            frameBorder="0"
            allowTransparency="true"
            src="https://api.getmakerlog.com/users/756/embed"
          />
        </React.Fragment>
      )
    case `author`:
      return <AuthorSection />
    case `openSource`:
      return (
        <p>
          See my open-source contributions on{` `}
          <a href="TODO" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>.
        </p>
      )
    case `hireMe`:
      return (
        <ul>
          <li>Say Experience. Mostly in JavaScript and blockchain.</li>
          <li>Tech Stack</li>
          Having said that, I learn extremely fast and I'm confident I can pick
          up and be productive with any technology within a couple of days.
          <li>What others say about me</li>
          <li>Link to interview on dfuse</li>
          <li>What team I like to work in?</li>
          <li>Contact</li>
          <li>LinkedIn</li>
        </ul>
      )
    case `stalkMe`:
      return (
        <ul>
          <li>Spotify</li>
          <li>Get Maker Log</li>
          <li>GitHub contribution graph?</li>
          <li>toggl?</li>
          <li>Latest Twitter Post</li>
          <li>Link to all social media? SOcialBar from old cmichel.io</li>
        </ul>
      )
  }
}

function MoreInfoSection(props) {
  const { section } = props

  return (
    <section id={section}>
      <h2 className="text-green">{getSectionHeader(props)}</h2>
      {getSectionContent(props)}
    </section>
  )
}

MoreInfoSection.propTypes = {
  section: PropTypes.oneOf([
    `developer`,
    `indieMaker`,
    `author`,
    `openSource`,
    `hireMe`,
    `stalkMe`,
  ]),
}

export default function MoreInfoSections({ sections }) {
  return (
    <React.Fragment>
      {sections.map(section => (
        <MoreInfoSection key={section} section={section} />
      ))}
    </React.Fragment>
  )
}

MoreInfoSections.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
}
