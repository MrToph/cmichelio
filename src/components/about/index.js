import React from 'react'
import MeImage from './me'
import MoreInfoButton from './more-info-button'
import MoreInfoSections from './more-info-sections'
import SocialBar from '../social-bar'
import { useSections } from './utils'

export default function About() {
  const [sections, showSection] = useSections([])

  return (
    <React.Fragment>
      <div>
        <h1 className="inline-block whitespace-no-wrap text-grey tracking-wide">{`Hi, I'm Christoph Michel 👋`}</h1>
        <MeImage />
      </div>
      <p>
        I{`'`}m a{` `}
        <MoreInfoButton onClick={showSection(`auditor`)}>
          security researcher 🏹🐛
        </MoreInfoButton>,{` `}
        <MoreInfoButton onClick={showSection(`developer`)}>
          developer 👨‍💻
        </MoreInfoButton>
        , and{` `}
        <MoreInfoButton onClick={showSection(`author`)}>
          author ✍️
        </MoreInfoButton>
        .
      </p>
      <p>
        Currently, I mostly work in software security and do{` `}
        <MoreInfoButton onClick={showSection(`openSource`)}>
          open-source work 👾
        </MoreInfoButton>
        {` `}
        on an independent contractor basis.{` `}
        <MoreInfoButton onClick={showSection(`hireMe`)}>
          hire me 🦸‍♂️
        </MoreInfoButton>
      </p>
      <p>
        I strive for efficiency and therefore track many aspects of my life.
        {` `}
        <MoreInfoButton onClick={showSection(`stalkMe`)}>
          stalk me 🧟‍♂️
        </MoreInfoButton>
      </p>
      <SocialBar />
      <MoreInfoSections sections={sections} />
    </React.Fragment>
  )
}

About.propTypes = {}
