import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { primaryColorInverted, primaryColorLight } from '../../../styling'

const svgStyles = css({
  /* Svg is inline and has a vertical-align: baseline which makes it jump up a bit */
  display: 'block',
  '& path': {
    fill: primaryColorInverted,
    stroke: primaryColorInverted,
  },
})

const containerStyles = css({
  /* background-image: radial-gradient(#ccc, #fff), radial-gradient(#ccc, #fff); */
    backgroundImage: `radial-gradient(${primaryColorLight}, ${primaryColorLight})`,
    backgroundSize: '2px 50px',
    backgroundPosition: '0 0',
    backgroundRepeat: 'no-repeat',
    '& > svg': {
      // otherwise it's not visible for some reason
      marginLeft: '1%',
    }
})

export default class PortfolioItemDividerBefore extends React.PureComponent {
  static propTypes = {
    isFirst: PropTypes.bool.isRequired,
  }

  render() {
    if (this.props.isFirst) return null
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
          <path d="m0.0 0.0 0.0 100.0 100.0 0.0z" />
        </svg>
      </div>
    )
  }
}

export { svgStyles }
