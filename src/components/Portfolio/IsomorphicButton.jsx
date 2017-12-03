import React from 'react'
import PropTypes from 'prop-types'
import Link from 'gatsby-link'
import { css, after } from 'glamor'
import { primaryColor, primaryColorLight } from '../../styling'

const buttonStyles = css(
  {
    position: 'relative',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '1px 15px',
    display: 'inline-block',
    margin: '15px 0',
    textTransform: 'uppercase',
    // letterSpacing: '1px',
    fontWeight: '700',
    outline: 'none',
    textDecoration: 'none',
    background: `${primaryColorLight}`,
    color: '#fff',
    // background: '#f0f0f0',
    // color: '#3a3a3a',

    boxShadow: `0 3px ${primaryColor}`,
    top: 0,
    transition: 'none',
    borderRadius: '40px',

    '&:hover': {
      boxShadow: `0 2px ${primaryColor}`,
      top: '1px',
    },

    '&:active': {
      boxShadow: `0 0 ${primaryColor}`,
      top: '4px',
    },
  },
  after({
    content: '',
    position: 'absolute',
    zIndex: '-1',
    transition: 'all 0.3s',
  })
)

export default class IsomorphicButton extends React.Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  }
  render() {
    return (
      <Link to={this.props.url} className="no-style" {...buttonStyles}>
        {this.props.children}
      </Link>
    )
  }
}

export { buttonStyles }
