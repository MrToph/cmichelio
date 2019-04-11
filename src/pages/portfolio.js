import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from "gatsby"
import get from 'lodash/get'
import Helmet from 'react-helmet'
// import PortfolioContent from '../components/Portfolio'


export default class Portfolio extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      site: PropTypes.shape({
        siteMetadata: PropTypes.shape({ title: PropTypes.string.isRequired })
          .isRequired,
      }).isRequired,
    }).isRequired,
  }
  render() {
    const siteTitle = `Portfolio - ${get(this, `props.data.site.siteMetadata.title`)}`
    return <React.Fragment>
      <Helmet key="helmet" title={siteTitle} />
      {/* <PortfolioContent key="portfolio" /> */}
    </React.Fragment>
  }
}

export const PortfolioQuery = graphql`
  query PortfolioQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
