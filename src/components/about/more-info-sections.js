import React from 'react'
import PropTypes from 'prop-types'
import { SectionHeader, SectionContentContainer } from './sections'

function MoreInfoSection(props) {
  const { section } = props

  return (
    <section id={section}>
      <h2 className="text-green-500 mt-6">
        <SectionHeader {...props} />
      </h2>
      <SectionContentContainer {...props} />
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

