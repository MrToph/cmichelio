import React from 'react'
import Link from 'gatsby-link'
import { css } from 'glamor'
import PageTitle from '../PageTitle'
import GithubButton from './GithubButton'
import IsomorphicButton from './IsomorphicButton'
import PortfolioItem from './PortfolioItem'
import fractalPlant from './images/fractalPlant.gif'
import mathart from './images/mathart.png'
import cmichelio from './images/cmichelio-recursion.png'
import colorRunner from './images/square.png'

const containerStyles = css({
  width: '100%',
  margin: '0 auto 50px',
  '& > h2': {
    margin: '2rem 0',
  },
})

const horizontalContainerStyles = css({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
})

const googlePlayBadgeStyles = css({
  display: 'inline-block',
  '& > img': {
    display: 'inline-block',
    height: 'calc(3rem + 14px)',
    verticalAlign: 'middle',
  },
})

const paragraphStyles = css({
  // needed for correct stacking of a::before background
  // https://stackoverflow.com/a/9072467
  position: 'relative',
  zIndex: 1,
})

export default class PortfolioContent extends React.Component {
  render() {
    return (
      <section>
        <PageTitle>Portfolio</PageTitle>
        <p>
          {`If you're interested in working with me, you can contact me on my `}
          <Link to="/about/">About Page</Link>.
        </p>
        <div {...containerStyles}>
          <h2>Web development</h2>
          <PortfolioItem
            title="This website"
            builtWith={['React', 'Phenomic', 'D3.js']}
            imgSrc={cmichelio}
            isFirst
          >
            <p {...paragraphStyles}>
              This website is a light-weight single-page web app based on a{' '}
              <a href="https://phenomic.io">static site generator</a> using
              React components and Markdown. It was built from scratch with low
              load times and best SEO practices in mind.
            </p>
            <div {...horizontalContainerStyles}>
              <IsomorphicButton url="/wordpress-to-static-site-generator/">
                Read more
              </IsomorphicButton>
              <GithubButton url="https://github.com/MrToph/cmichelio" />
            </div>
          </PortfolioItem>
          <PortfolioItem
            title="MathArt.xyz"
            builtWith={['D3.js', 'WordPress']}
            imgSrc={mathart}
          >
            <p>
              Digital museum visualizing beautiful proofs and ideas in math.
            </p>
            <div {...horizontalContainerStyles}>
              <IsomorphicButton url="http://mathart.xyz/portfolio/">
                Try it
              </IsomorphicButton>
            </div>
          </PortfolioItem>
          <PortfolioItem
            title="Fractal Rendering Engine"
            builtWith={['D3.js', 'React']}
            imgSrc={fractalPlant}
            isLast
          >
            <p>
              Allows you to define fractals in an easy language and immediately
              see them visualized.
            </p>
            <div {...horizontalContainerStyles}>
              <IsomorphicButton url="/projects/fractals-LSystem/">
                Try it
              </IsomorphicButton>
              <IsomorphicButton
                url="/fractals-with-l-systems-in-d3-js/"
              >
                Read more
              </IsomorphicButton>
              <GithubButton url="https://github.com/MrToph/L-System" />
            </div>
          </PortfolioItem>
          <h2>Mobile Development</h2>
          <PortfolioItem
            title="PHUL Workout Log"
            builtWith={['React Native', 'Redux', 'D3.js']}
            imgSrc="//cmichel.io/assets/2016/10/featured.jpg"
            isFirst
          >
            <p>Simple to use Fitness Tracker with a lot of features.</p>
            <div {...horizontalContainerStyles}>
              <a
                {...googlePlayBadgeStyles}
                role="button"
                className="no-style"
                href="https://play.google.com/store/apps/details?id=io.cmichel.phul&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
              >
                <img
                  alt="Get it on Google Play"
                  src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png"
                />
              </a>
              <IsomorphicButton url="/lessons-from-building-first-react-native-app/">
                Read more
              </IsomorphicButton>
            </div>
          </PortfolioItem>
          <PortfolioItem
            title="Color Runner"
            builtWith={['Unity', 'C#']}
            imgSrc={colorRunner}
            isLast
          >
            <p>
              Skill mobile game where you have to avoid crashing into obstacles
              while constantly shape-shafting.
            </p>
            <div {...horizontalContainerStyles}>
              <a
                {...googlePlayBadgeStyles}
                role="button"
                className="no-style"
                href="https://play.google.com/store/apps/details?id=com.TheoryMode.ColorRunner&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
              >
                <img
                  alt="Get it on Google Play"
                  src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png"
                />
              </a>
            </div>
          </PortfolioItem>
        </div>
      </section>
    )
  }
}
