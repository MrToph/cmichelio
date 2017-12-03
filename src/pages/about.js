import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import Helmet from 'react-helmet'
import AboutContent from '../components/About'

export default class About extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      site: PropTypes.shape({
        siteMetadata: PropTypes.shape({ title: PropTypes.string.isRequired })
          .isRequired,
      }).isRequired,
    }).isRequired,
  }
  render() {
    const siteTitle = `About ${get(this, 'props.data.site.siteMetadata.title')}`
    return [
      <Helmet key="helmet" title={siteTitle} />,
      <AboutContent key="about" />,
    ]
  }
}

export const AboutQuery = graphql`
  query AboutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
