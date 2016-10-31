import React from 'react'
import Helmet from 'react-helmet'
import { config } from 'config'
import { BlogArchive } from '../src/components'

class Start extends React.Component {
  static propTypes = {
    route: React.PropTypes.object
  }

  render () {
    return (
      <div>
        <Helmet title={config.blogTitle} meta={[ {'name': 'description', 'content': 'Sample blog'}, {'name': 'keywords', 'content': 'blog, articles'} ]} />
        <BlogArchive route={this.props.route} />
      </div>
    )
  }
}

export default Start
