import React, { Component } from 'react'
import Helmet from 'react-helmet'
import { GoogleFont, TypographyStyle } from 'react-typography'
import typography from './utils/typography'
import { Body } from './src/components'
import { hookConsoleLog } from 'stacklogger'

export default class HTML extends Component {
  static propTypes = {
    body: React.PropTypes.string
  }

  constructor (props) {
    super(props)
    hookConsoleLog()
  }

  render () {
    const { body } = this.props
    const head = Helmet.rewind()

    let css
    if (process.env.NODE_ENV === 'production') {
      css = <style dangerouslySetInnerHTML={{ __html: require('!raw!./public/styles.css') }} />
    }

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          {head.title.toComponent()}
          {head.meta.toComponent()}
          <TypographyStyle typography={typography} />
          <GoogleFont typography={typography} />
          {css}
        </head>
        <Body body={body} />
      </html>
    )
  }
}
