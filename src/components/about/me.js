import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'
// import './me.scss'

function Me(props) {
  const { image } = props

  return (
    <div className="me">
      <Image
        className="rounded-full me__inner"
        fixed={image.file.childImageSharp.fixed}
        alt="me"
        objectFit="contain"
      />
    </div>
  )
}

Me.propTypes = {
  image: PropTypes.shape({
    file: PropTypes.object.isRequired,
  }).isRequired,
}

export default function MeContainer(props) {
  return (
    <StaticQuery
      query={graphql`
        query MeQuery {
          file(absolutePath: { regex: "/src/assets/images/me_vector/" }) {
            childImageSharp {
              fixed(height: 175) {
                ...GatsbyImageSharpFixed
              }
            }
          }
        }
      `}
      render={data => <Me {...props} image={data} />}
    />
  )
}
