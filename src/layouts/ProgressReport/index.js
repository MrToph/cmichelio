/* eslint-disable */
import React, { Component, PropTypes } from 'react'
import Page from "../Page"
import ReactDOMServer from 'react-dom/server'
import { Bio, NavigationMenu } from '../../components'

// matches strings like
// <div class='react-visualization' props='{"val":5}'></div>
// <div      class="react-test"    >     </div>
// Make sure to use SINGLE quotes for defining HTML attributes, as we need double quotes to parse the JSON props attribute
const pattern = new RegExp(String.raw`<div\s*class='react-(\S*)'\s*(props='(.*)'\s*)?>\s*</div>`, 'ig') // eslint-disable-line

export default class ProgressReport extends Component {
  // componentWillMount () {
  //   console.log('willMount', this.props)
  //   if (this.props.isLoading) return this.setState({body: undefined})
  //   let { body } = this.props
  //   body = body.replace(pattern, this.replacementBasedOnMatch)
  //   this.setState({body: body})
  // }

   render () {
    const props = this.props
    const frontMatter = props.head
    const pageDate = props.head.date ? new Date(props.head.date) : null
    let { body } = this.props
    if (body) body = body.replace(pattern, this.replacementBasedOnMatch)
    return (
      <Page
        { ...props}
        body={body}
        header={
          <header>
            {
            pageDate &&
            <time key={ pageDate.toISOString() }>
              { pageDate.toDateString() }
            </time>
          }
          </header>
        }
      >
      <marquee>Progress Report</marquee>
      </Page>
    )
  }

  replacementBasedOnMatch (match, name, propsMatch, props) {
    props = propsMatch ? JSON.parse(props) : undefined
    console.log(name, props)
    switch (name) {
      case 'visualization': {
        return ReactDOMServer.renderToStaticMarkup(<Bio {...props} />)
      }
      case 'test': {
        return '<strong>test</strong>'
      }
      default: {
        console.error(`replacementBasedOnMatch: Could not replace ${name} with a React component. ${match}`)
        return '<h1><del>This paragraph should not be here.</del></h1>'
      }
    }
  }
} 

ProgressReport.propTypes = {
  head: PropTypes.object.isRequired,
  body: PropTypes.string,
  type: PropTypes.string
}


