import React from 'react'
import Link from 'gatsby-link'
import { css, before, after } from 'glamor'
import 'glamor/reset'
import NavigationMenu from '../components/NavigationMenu'
import {
  pageWidth,
  navBarWidth,
  primaryColor,
  primaryColorLight,
  primaryColorInverted,
} from '../styling'

const mainStyles = css({
  width: `calc(100% - ${navBarWidth} - 1.8rem)`,
  marginLeft: `calc(${navBarWidth} + 1.8rem)`,
})

const pageStyles = css({
  maxWidth: `${pageWidth}`,
  width: `100%`,
  margin: `0 auto`,
  padding: `0`,
})

css.global('html, body', {
  fontFamily: `"Helvetica Neue", Roboto, "Segoe UI", Calibri, sansserif`,
  boxSizing: `border-box`,
})

const classesToIgnore = ['no-style', 'gatsby-resp-image-link'].map(className => `:not(.${className})`).join('')
css.global(`body a${classesToIgnore}`, {
  display: 'inline-block',
  position: 'relative',
  color: primaryColor,
  outline: 'none',
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'color 0.2s',
})
css.global(
  `body a${classesToIgnore}:hover, body a${
    classesToIgnore
  }:focus`,
  {
    color: primaryColorInverted,
  }
)
css.global(`body a${classesToIgnore}::before`, {
  position: `absolute`,
  top: `0px`,
  left: `-5px`,
  zIndex: `-1`,
  boxSizing: `content-box`,
  padding: `0 5px`,
  width: `100%`,
  height: `100%`,
  background: primaryColor,
  content: `''`,
  opacity: `0`,
  transition: `transform 0.2s, opacity 0.2s`,
  transform: `skewY(-3deg) skewX(-11deg)`,
})
css.global(
  `body a${classesToIgnore}:hover::before, body a${
    classesToIgnore
  }:focus::before`,
  {
    opacity: 1,
    transform: `skewY(0) skewX(0)`,
  }
)

export default class MainTemplate extends React.Component {
  render() {
    const { location, children } = this.props
    return (
      <section {...pageStyles}>
        <NavigationMenu data={this.props.data} />
        <main {...mainStyles}>{children()}</main>
      </section>
    )
  }
}

export const query = graphql`
  query MainTemplateQuery {
    ...socialMedia
  }
`
