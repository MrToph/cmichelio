import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import Metaballs from 'react-metaballs-js'
import Logo from './logo'
import tailwind from '../../../tailwind'
import './tailwind.css'
import './layout.css'

export default function MainTemplate(props) {
  const {
    site: { siteMetadata },
  } = useStaticQuery(graphql`
    query MainTemplateQuery {
      ...SocialMediaFragment
      site {
        siteMetadata {
          title
          author
          description
          siteUrl
          keywords
          socialImage
        }
      }
    }
  `)

  return (
    <React.Fragment>
      <Helmet defaultTitle={siteMetadata.title}>
        <html lang="en" />
        <link rel="canonical" href={siteMetadata.siteUrl} />
        <meta name="description" content={siteMetadata.description} />
        <meta name="keywords" content={siteMetadata.keywords} />
        <meta name="copyright" content={siteMetadata.author} />
        <meta name="author" content={siteMetadata.author} />
        <meta property={`og:image`} content={siteMetadata.socialImage} />
        <meta poperty={`og:title`} content={siteMetadata.title} />
        <meta property={`og:description`} content={siteMetadata.description} />
        <meta property={`og:url`} content={siteMetadata.siteUrl} />
        <meta property={`og:site_name`} content={siteMetadata.title} />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:creator" content={siteMetadata.twitter} />
        <meta property={`twitter:title`} content={siteMetadata.title} />
        <meta property={`twitter:description`} content={siteMetadata.description} />
        <meta property={`twitter:image`} content={siteMetadata.socialImage} />
      </Helmet>
      <Logo />
      <section>
        <Metaballs
          numMetaballs={0}
          minRadius={13}
          maxRadius={27}
          speed={5.0}
          color={tailwind.colors[`black`]}
          backgroundColor="#00000000"
          interactive="window"
          className="metaballs"
          style={{
            position: `fixed`,
            top: 0,
            left: 0,
            width: `100%`,
            height: `100%`,
            zIndex: -9999,
          }}
        />
        <main>{props.children}</main>
      </section>
    </React.Fragment>
  )
}

MainTemplate.propTypes = {
  children: PropTypes.node.isRequired,
}
