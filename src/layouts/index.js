import React from 'react'
import Link from 'gatsby-link'
import { css } from 'glamor'
import 'glamor/reset'
import NavigationMenu from '../components/NavigationMenu'
import { pageWidth, navBarWidth } from '../styling'

const mainStyles = css({
  width: `calc(100% - ${navBarWidth} - 1.8rem)`,
  marginLeft: `calc(${navBarWidth} + 1.8rem)`,
})

const pageStyles = css({
  maxWidth: `${pageWidth}`,
  width: `100%`,
  margin: `0 auto`,
  padding: `0`,
  '& *': {
    boxSizing: `border-box`,
  },
})

export default class Template extends React.Component {
  render() {
    const { location, children } = this.props
    return (
      <section {...pageStyles}>
        <NavigationMenu />
        <main {...mainStyles}>{children()}</main>
      </section>
    )
  }
}
