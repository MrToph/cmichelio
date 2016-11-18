import React, { Component, PropTypes } from 'react'
import ReactDOMServer from 'react-dom/server'
import { Chart } from '../../components'

// matches strings like
// <div class='react-chart' props='{"val":5}'></div>
// <div      class='react-test'    >     </div>
// Make sure to use SINGLE quotes for defining HTML attributes, as we need double quotes to parse the JSON props attribute
const pattern = new RegExp(String.raw`<div\s*class='react-(\S*)'\s*(props='(.*)'\s*)?>\s*</div>`, 'ig') // eslint-disable-line
export default class PostWithCharts extends Component {

  render () {
    let { body, ...otherProps } = this.props
    if (body) body = body.replace(pattern, this.replacementBasedOnMatch)
    return (
         <div
           dangerouslySetInnerHTML={{ __html: body }}
           {...otherProps}
        />
    )
  }

  replacementBasedOnMatch (match, name, propsMatch, props) {
    props = propsMatch ? JSON.parse(props) : undefined
    switch (name) {
      case 'chart': {
        return ReactDOMServer.renderToStaticMarkup(<Chart {...props} />)
      }
      default: {
        console.error(`replacementBasedOnMatch: Could not replace ${name} with a React component. ${match}`)
        return '<h1><del>This paragraph should not be here.</del></h1>'
      }
    }
  }
}

PostWithCharts.propTypes = {
  body: PropTypes.string.isRequired   // Markdown post containing the react-div
}
