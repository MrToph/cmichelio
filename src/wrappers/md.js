import React from 'react'
import Helmet from 'react-helmet'
import { config } from 'config'
import layouts from '../layouts'

import '../css/zenburn.css'
import '../css/style.css'

export default class MarkdownWrapper extends React.Component {
  static propTypes = {
    route: React.PropTypes.object
  }

  render () {
    const { route } = this.props
    const post = route.page.data
    const Layout = layouts[post.layout]
    return (
      <div className='markdown'>
        <Helmet title={`${post.title} | ${config.blogTitle}`} />
        <h1 style={{marginTop: 0}}>{post.title}</h1>
        <Layout route={route} />
      </div>
    )
  }
}
