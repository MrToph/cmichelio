import React from 'react'
import PropTypes from 'prop-types'
import Image from 'gatsby-image'

export default function FeaturedImage({ frontmatter = {} }) {
  const { featured, image } = frontmatter

  if (image && image.childImageSharp && image.childImageSharp.fixed) {
    return (
      <span className="featuredImageWrapper">
        <Image fixed={image.childImageSharp.fixed} alt="featured image" />
      </span>
    )
  }

  // featured is legacy non-responsive featured image field
  if (featured) {
    return (
      <span className="featuredImageWrapper">
        <img src={featured} className="featuredImage" />
      </span>
    )
  }

  return null
}

FeaturedImage.propTypes = {
  frontmatter: PropTypes.shape({
    featured: PropTypes.string,
    image: PropTypes.object,
  }),
}
