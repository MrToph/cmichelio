import React from 'react'
import moment from 'moment'
import ReadNext from '../components/ReadNext'
import { rhythm } from 'utils/typography'

export default class Post extends React.Component {
  static propTypes = {
    route: React.PropTypes.object
  }

  render () {
    const { route } = this.props
    console.log(route)
    const post = route.page.data
    return (
      <div className='layout'>
        <main dangerouslySetInnerHTML={{ __html: post.body }} />
        <em style={{ display: 'block', marginBottom: rhythm(2) }}>Posted {moment(post.date).format('MMMM D, YYYY')}</em>
        <hr style={{ marginBottom: rhythm(2) }} />
        <ReadNext post={post} pages={route.pages} />
      </div>
    )
  }
}
