import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import PostOutline from './PostOutline'
import IndexHeader from './IndexHeader'
import filterPosts from './filterPosts'

const postContainerStyles = css({
  display: `flex`,
  flexWrap: `wrap`,
  justifyContent: `space-between`,
  padding: `0`,
  margin: `0`,
})

export default class BlogIndexPosts extends React.Component {
  static propTypes = {
    posts: PropTypes.arrayOf(
      PropTypes.shape({
        node: PropTypes.object.isRequired,
      }).isRequired
    ).isRequired,
    tag: PropTypes.string,
  }

  static defaultProps = {
    tag: ``,
  }

  render() {
    const { posts, tag } = this.props
    const filteredPosts = filterPosts(posts, tag)
    return (
      <section id="blogIndex">
        <IndexHeader key="indexHeader" selectedCategory={tag} />
        <ol id="postsList" key="postsList" {...postContainerStyles}>
          {filteredPosts.map(({ node }, index) => (
            <PostOutline post={node} key={node.fields.slug} short={index >= 5} />
          ))}
        </ol>
      </section>
    )
  }
}
