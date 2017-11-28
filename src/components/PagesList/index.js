import React, { PropTypes } from "react"

import PagePreview from "../PagePreview"

const featuredImageLimit = 5
const descriptionLimit = 5

const PagesList = ({ pages }) => {
  return (
    <div>
      {
      pages.length
      ? (
        <ul>
          {
          pages.map((page, i) => {
            let pageProps = {...page}
            if (i >= featuredImageLimit) delete pageProps.featured
            if (i >= descriptionLimit) delete pageProps.description
            return (<li key={ pageProps.title }><PagePreview { ...pageProps }/></li>)
          }
          )
        }
        </ul>
      )
      : "No posts yet."
    }
    </div>
  )
}

PagesList.propTypes = {
  pages: PropTypes.array.isRequired,
}

export default PagesList
