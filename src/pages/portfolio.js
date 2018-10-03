import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import Helmet from 'react-helmet'
import PortfolioContent from '../components/Portfolio'
import Layout from '../components/layout'

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
    return <Layout>
      <Helmet key="helmet" title={siteTitle} />,
      <PortfolioContent key="portfolio" />,
    </Layout>
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
