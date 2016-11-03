import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'
import moment from 'moment'
import { rhythm } from 'utils/typography'
import { Bio, NavigationMenu } from '../components'

// matches strings like
// <div class='react-visualization' props='{"val":5}'></div>
// <div      class="react-test"    >     </div>
// Make sure to use SINGLE quotes for defining HTML attributes, as we need double quotes to parse the JSON props attribute
const pattern = new RegExp(String.raw`<divs*class='react-(S*)'s*(props='(.*)'s*)?>s*</div>`, 'ig') // eslint-disable-line

export default class Post extends Component {
  static propTypes = {
    route: PropTypes.object
  }

  render () {
    const { route } = this.props
    const post = route.page.data
    // console.log(post.body)
    let body = post.body.replace(pattern, this.replacementBasedOnMatch)
    return (
      <div id='layout'>
        <main dangerouslySetInnerHTML={{ __html: body }} />
        <em style={{ display: 'block', marginBottom: rhythm(2) }}>Posted {moment(post.date).format('MMMM D, YYYY')}</em>
        <p>
          OMG IT IS A PROGRESS REPORT
        </p>
      </div>
    )
  }

  replacementBasedOnMatch (match, name, propsMatch, props) {
    props = propsMatch ? JSON.parse(props) : undefined
    switch (name) {
      case 'visualization': {
        return ReactDOMServer.renderToStaticMarkup(<Bio {...props} />)
      }
      case 'test': {
        return '<strong>test</strong>'
      }
      default: {
        console.error(`replacementBasedOnMatch: Could not replace ${name} with a React component.
${match}`)
        return '<h1><del>This paragraph should not be here.</del></h1>'
      }
    }
  }
}
