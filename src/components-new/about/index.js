import React from 'react'
import PropTypes from 'prop-types'
import Logo from './logo'
import MoreInfoButton from './more-info-button'
import MoreInfoSections from './more-info-sections'
import './about.css'
import { useSections } from './utils'

export default function About(props) {
  const [sections, showSection] = useSections([`stalkMe`])

  return (
    <React.Fragment>
      <Logo />
      <h1 className="text-grey">{`Hi, I'm Christoph Michel 👋`}</h1>
      <p>
        I{`'`}m a{` `}
        <MoreInfoButton onClick={showSection(`developer`)}>
          developer 👨‍💻
        </MoreInfoButton>
        ,{` `}
        <MoreInfoButton onClick={showSection(`indieMaker`)}>
          indie maker 👷
        </MoreInfoButton>
        , and{` `}
        <MoreInfoButton onClick={showSection(`author`)}>
          author ✍️
        </MoreInfoButton>
        .
      </p>
      <p>
        I mostly do{` `}
        <MoreInfoButton onClick={showSection(`openSource`)}>
          open-source work 👾 ⚙️ 🔧
        </MoreInfoButton>
        {` `}
        and help small to mid-sized teams from all over the world 🌎 on both
        {` `}
        <strong className="font-bold">short and long-term projects</strong> on
        an independent contractor basis.{` `}
        <MoreInfoButton onClick={showSection(`hireMe`)}>
          hire me 🦸‍♂️
        </MoreInfoButton>
      </p>
      <p>
        I enjoy being more efficient ⏱️ and therefore track many aspects of my
        life.{` `}
        <MoreInfoButton onClick={showSection(`stalkMe`)}>
          stalk me 🧟‍♂️
        </MoreInfoButton>
      </p>
      <MoreInfoSections sections={sections} />
    </React.Fragment>
  )
}

About.propTypes = {}
