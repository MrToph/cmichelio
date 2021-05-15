import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
// import Metaballs from 'react-metaballs-js'
import Logo from './logo'
// import './layout.scss'

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
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
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
        <meta
          property={`twitter:description`}
          content={siteMetadata.description}
        />
        <meta property={`twitter:image`} content={siteMetadata.socialImage} />
        {/* for Twitter embeds */}
        <script
          async
          src="https://platform.twitter.com/widgets.js"
          charset="utf-8"
        />
      </Helmet>
      <Logo />
      <section>
        {/* <Metaballs
          numMetaballs={10}
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
        /> */}
        <main>{props.children}</main>
      </section>
    </React.Fragment>
  )
}

MainTemplate.propTypes = {
  children: PropTypes.node.isRequired,
}
