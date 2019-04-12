import React from 'react'
import PropTypes from 'prop-types'
import PostOutline from './post-outline'
import BlogIndexHeader from './header'
import { filterPosts } from './utils'

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
        <BlogIndexHeader selectedCategory={tag} />
        <ol className="flex flex-wrap justify-between p-0 m-0">
          {filteredPosts.map(({ node }, index) => (
            <PostOutline
              post={node}
              key={node.fields.slug}
              short={index >= 5}
            />
          ))}
        </ol>
      </section>
    )
  }
}
