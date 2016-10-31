import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import sortBy from 'lodash/sortBy'
import { prefixLink } from 'gatsby-helpers'
import { rhythm } from 'utils/typography'
import access from 'safe-access'
import include from 'underscore.string/include'

export default class BlogArchive extends Component {
  static propTypes = {
    route: PropTypes.object
  }

  render () {
    const pageLinks = []
    // Sort pages.
    const sortedPages = sortBy(this.props.route.pages, (page) => access(page, 'data.date')
    ).reverse()
    sortedPages.forEach((page) => {
      if (access(page, 'file.ext') === 'md' && !include(page.path, '/404')) {
        const title = access(page, 'data.title') || page.path
        pageLinks.push(
          <li key={page.path} style={{ marginBottom: rhythm(1 / 4) }}>
            <Link style={{boxShadow: 'none'}} to={prefixLink(page.path)}>
            {title}
            </Link>
          </li>
        )
      }
    })
    return (
      <ul>
        {pageLinks}
      </ul>
    )
  }
}
