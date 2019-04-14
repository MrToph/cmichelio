import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import get from 'lodash/get'

const formatDate = date => {
  const s = date.toDateString().split(` `)
  s.shift()
  return s.join(` `)
}

const calculatePostsPerWeek = (numPosts, fromDate) => {
  const weeksPassed =
    (Date.now() - fromDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  return (numPosts / weeksPassed).toFixed(2)
}

function AboutSection(props) {
  const totalPosts = get(props, `totalMarkdownRemark.totalCount`)
  const oldestPostDate = new Date(
    get(props, `oldestMarkdownRemark.edges.0.node.frontmatter.date`)
  )
  const postsPerWeek = calculatePostsPerWeek(totalPosts, oldestPostDate)

  return (
    <ul>
      <li>
        I wrote a 260 pages book about{` `}
        <span className="font-semibold italic">
          Learning EOS Blockchain Development
        </span>
        . Available at{` `}
        <a
          href="https://learneos.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          learneos.dev
        </a>
        .
      </li>
      <li>
        I write tech tutorials and articles on this blog since{` `}
        <span className="font-semibold">{formatDate(oldestPostDate)}</span>. I
        wrote <span className="font-semibold">{totalPosts}</span> posts since
        then. That's an average of{` `}
        <span className="font-semibold">{postsPerWeek}</span>
        {` `}
        posts per week.
      </li>
      <li>
        My writings can also be found on{` `}
        <a href="TODO" target="_blank" rel="noopener noreferrer">
          Medium
        </a>
        {` `},{` `}
        <a href="TODO" target="_blank" rel="noopener noreferrer">
          Steem
        </a>
        , or{` `}
        <a href="TODO" target="_blank" rel="noopener noreferrer">
          Twitter
        </a>
        .
      </li>
    </ul>
  )
}

AboutSection.propTypes = {
  data: PropTypes.shape({
    totalMarkdownRemark: PropTypes.shape({
      totalCount: PropTypes.number.isRequired,
    }).isRequired,
    oldestMarkdownRemark: PropTypes.shape({
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          node: PropTypes.shape({
            frontmatter: PropTypes.shape({
              data: PropTypes.string,
            }),
          }),
        })
      ).isRequired,
    }).isRequired,
  }).isRequired,
}

export default function AboutSectionContainer() {
  return (
    <StaticQuery
      query={graphql`
        query AboutSectionQuery {
          ...PostStatisticFragment
        }
      `}
      render={AboutSection}
    />
  )
}

export const PostStatisticFragment = graphql`
  fragment PostStatisticFragment on Query {
    totalMarkdownRemark: allMarkdownRemark(
      filter: { frontmatter: { draft: { ne: true } } }
    ) {
      totalCount
    }
    oldestMarkdownRemark: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: ASC }
      filter: { frontmatter: { draft: { ne: true } } }
      limit: 1
    ) {
      totalCount
      edges {
        node {
          frontmatter {
            date
          }
        }
      }
    }
  }
`
