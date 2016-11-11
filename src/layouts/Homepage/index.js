import React, { PropTypes } from "react"
import enhanceCollection from "phenomic/lib/enhance-collection"
import { isClientSide } from '../../utils'
import Page from "../Page"
import PagesList from "../../components/PagesList"

const Homepage = (props, { collection }) => {
  let category
  if (isClientSide()) {
    category = window.location.hash.slice(1).toLowerCase()  // remove hashtag
    if (category.trim() === '') category = undefined
  } else {
    category = undefined
  }
  const latestPosts = enhanceCollection(collection, {
    filter: ({ layout, categories }) => (layout === 'Post' || layout === 'ProgressReport') && (!category ||
                                        (categories && categories.map(c => c.toLowerCase()).includes(category))),
    sort: "date",
    reverse: true,
  })
  .slice()
  return (
    <Page { ...props }>
      <h2>{ `Latest Posts${category ? ' for category: ' + category : ''}` }</h2>
      <PagesList pages={ latestPosts } />
    </Page>
  )
}

Homepage.contextTypes = {
  collection: PropTypes.array.isRequired,
}

export default Homepage
