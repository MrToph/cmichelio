import React from 'react'
import PropTypes from 'prop-types'
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
      return <ul>
          <li>Experience</li>
          <li>tech stack</li>
          <li>GitHub to stay up-to-date</li>
      </ul>
    case `indieMaker`:
      return <ul>
          <li>Read my blog, my monthly progress-reports or use GitHub to stay up-to-date</li>
          <li>Check GetMakerLog | embed</li>
      </ul>
    case `author`:
      return <ul>
      <li>Wrote book Learn EOS Development 260 pages.</li>
      <li>Medium</li>
      <li>Steem</li>
      <li>This Blog since 2016. Oldest post XX. Wrote YY posts since then. (ZZ posts / week)</li>
  </ul>
    case `openSource`:
      return <ul>
          <li>Check GitHub</li>
      </ul>
    case `hireMe`:
      return <ul>
          <li>Say Experience</li>
          <li>Tech Stack</li>
          <li>What others say about me</li>
          <li>Link to interview on dfuse</li>
          <li>What team I like to work in?</li>
          <li>Contact</li>
          <li>LinkedIn</li>
      </ul>
    case `stalkMe`:
      return <ul>
          <li>Spotify</li>
          <li>Get Maker Log</li>
          <li>toggl?</li>
          <li>Latest Twitter Post</li>
          <li>Link to all social media? SOcialBar from old cmichel.io</li>
      </ul>
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
        <MoreInfoSection section={section} />
      ))}
    </React.Fragment>
  )
}

MoreInfoSections.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
}
