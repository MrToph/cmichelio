import React from 'react'
import PropTypes from 'prop-types'
import { css, before } from 'glamor'
import { svgStyles } from './DividerBefore'
import { primaryColorLight } from '../../../styling'

const containerStyles = css(
  {
    /* backgroundImage: 'radial-gradient(#ccc, #fff), radial-gradient(#ccc, #fff) */
    backgroundImage: `radial-gradient(${primaryColorLight}, ${
      primaryColorLight
    })`,
    backgroundSize: '2px 50px',
    backgroundPosition: '100% 0',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
  },
  before({
    zIndex: '-1',
    content: '""',
    position: 'absolute',
    bottom: '40px',
    top: '0',
    left: '10px',
    right: '10px',
    background: '#777',
    boxShadow: '0 15px 10px #777',
    transform: 'rotate(+4deg)',
  })
)

export default class PortfolioItemDividerAfter extends React.PureComponent {
  static propTypes = {
    isLast: PropTypes.bool.isRequired,
  }

  render() {
    if (this.props.isLast) return null
    return (
      <div {...containerStyles}>
        <svg
          {...svgStyles}
          xmlns="http://www.w3.org/2000/svg"
          height="50"
          width="99%"
          version="1.1"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path d="m0.0 0.0 100.0 0.0 0.0 100.0z" />
        </svg>
      </div>
    )
  }
}
