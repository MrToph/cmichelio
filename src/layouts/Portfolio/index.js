import React, { Component } from 'react'
import Page from '../Page'
import styles from './index.css'
import { Link } from 'react-router'
import { GitHubBtn, PortfolioItem } from '../../components'
import fractalPlant from '../../../content/portfolio/fractalPlant.gif'
import mathart from '../../../content/portfolio/mathart.png'
import cmichelio from '../../../content/portfolio/cmichelio-recursion.png'
import colorRunner from '../../../content/portfolio/square.png'

export default class Portfolio extends Component {
  render () {
    let props = this.props
    return (
            <Page {...props}>
            <div className={styles.container}>
                <h2>Web development</h2>
                <PortfolioItem
                  title='This website'
                  builtWith={['React', 'Phenomic', 'D3.js']}
                  imgSrc={cmichelio}
                  isFirst>
                    <p>This website is a light-weight single-page web app based on a <a href="https://phenomic.io">static site generator</a> using React components and Markdown.
                    It was built from scratch with low load times and best SEO practices in mind.</p>
                    <div className={styles.horizontalContainer}>
                        <Link className='btn clearA' to='/wordpress-to-static-site-generator/'>
                            <span>Read more</span>
                        </Link>
                        <GitHubBtn url='https://github.com/MrToph/cmichelio' />
                    </div>
                </PortfolioItem>
                <PortfolioItem
                  title='MathArt.xyz'
                  builtWith={['D3.js', 'WordPress']}
                  imgSrc={mathart}
                  >
                    <p>Digital museum visualizing beautiful proofs and ideas in math.</p>
                    <div className={styles.horizontalContainer}>
                        <a className='btn clearA' target='_blank' href='http://mathart.xyz/portfolio/'>
                            <span>Visit it</span>
                        </a>
                    </div>
                </PortfolioItem>
                <PortfolioItem
                  title='Fractal Rendering Engine'
                  builtWith={['D3.js', 'React']}
                  imgSrc={fractalPlant}
                  isLast>
                    <p>Allows you to define fractals in an easy language and immediately see them visualized.</p>
                    <div className={styles.horizontalContainer}>
                        <a className='btn clearA' href='/fractals-LSystem/'>
                            <span>Try it</span>
                        </a>
                        <Link className='btn clearA' to='/fractals-with-l-systems-in-d3-js/'>
                            <span>Read more</span>
                        </Link>
                        <GitHubBtn url='https://github.com/MrToph/L-System' />
                    </div>
                </PortfolioItem>
                <h2>Mobile Development</h2>
                <PortfolioItem
                  title='PHUL Workout Log'
                  builtWith={['React Native', 'Redux', 'D3.js']}
                  imgSrc='//cmichel.io/assets/2016/10/featured.jpg'
                  isFirst
                  >
                    <p>Simple to use Fitness Tracker with a lot of features.</p>
                    <div className={styles.horizontalContainer}>
                        <a className={`${styles.googlePlayBadge} clearA`}
                            href='https://play.google.com/store/apps/details?id=io.cmichel.phul&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'>
                            <img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'/>
                        </a>
                        <Link className='btn clearA' to='/lessons-from-building-first-react-native-app/'>
                            <span>Read more</span>
                        </Link>
                    </div>
                </PortfolioItem>
                <PortfolioItem
                  title='Color Runner'
                  builtWith={['Unity', 'C#']}
                  imgSrc={colorRunner}
                  isLast
                  >
                    <p>Skill mobile game where you have to avoid crashing into obstacles while constantly shape-shafting.</p>
                    <div className={styles.horizontalContainer}>
                        <a className={`${styles.googlePlayBadge} clearA`}
                            href='https://play.google.com/store/apps/details?id=com.TheoryMode.ColorRunner&utm_source=global_co&utm_medium=prtnr&utm_content=Mar2515&utm_campaign=PartBadge&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'>
                            <img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png'/>
                        </a>
                    </div>
                </PortfolioItem>
            </div>
            </Page>
        )
  }
}
