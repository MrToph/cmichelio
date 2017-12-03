import React from 'react'
import PropTypes from 'prop-types'
import { css, after, before } from 'glamor'
import BuiltWith from './BuiltWith'
import DividerBefore from './DividerBefore'
import DividerAfter from './DividerAfter'
import {
  primaryColorInverted,
  primaryColorLight,
  primaryColor,
} from '../../../styling'

const horizontalContainerStyles = css({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'flex-start',
})

const contentContainerStyles = css({
  background: primaryColorInverted,
  width: '100%',
  padding: '0.75rem',
  /* Collapsing margins */
  /* display: inline-block; */

  /* background-image: radial-gradient(#ccc, #fff), radial-gradient(#ccc, #fff); */
  /* Two backgrounds, position for each of these */
  backgroundImage: `linear-gradient(to bottom, ${primaryColorLight}, ${
    primaryColor
  }, ${primaryColorLight}), linear-gradient(to bottom, ${primaryColorLight}, ${
    primaryColor
  }, ${primaryColorLight})`,
  backgroundSize: '2px 100%',
  backgroundPosition: '0 0, 100% 0',
  backgroundRepeat: 'no-repeat',

  '& h3': {
    textAlign: 'center',
    color: primaryColor,
  },
})

const horizontalShadowStyles = css(
  {
    position: 'relative',
  },
  after({
    zIndex: '-1',
    position: 'absolute',
    content: '""',
    bottom: '15px',
    width: '50%',
    top: '80%',
    maxWidth: '300px',
    background: '#777',
    boxShadow: '0 15px 10px #777',
    transform: 'rotate(3deg)',
    right: '10px',
    left: 'auto',
  }),
  before({
    zIndex: '-1',
    position: 'absolute',
    content: '""',
    bottom: '15px',
    left: '10px',
    width: '50%',
    top: '80%',
    maxWidth: '300px',
    background: '#777',
    boxShadow: '0 15px 10px #777',
    transform: 'rotate(-3deg)',
  })
)

const imageStyles = css({
  display: 'block',
  width: '60%',
})

export default class PortfolioItem extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    imgSrc: PropTypes.string.isRequired,
    builtWith: PropTypes.arrayOf(PropTypes.string),
    isFirst: PropTypes.bool,
    isLast: PropTypes.bool,
    children: PropTypes.node,
  }
  render() {
    let { title, imgSrc, builtWith, children, isFirst, isLast } = this.props
    return (
      <section>
        <DividerBefore isFirst={isFirst} />
        <div {...contentContainerStyles} css={isLast && horizontalShadowStyles}>
          <h3>{title}</h3>
          <div {...horizontalContainerStyles}>
            <img src={imgSrc} {...imageStyles} />
            <BuiltWith items={builtWith} />
          </div>
          {children}
        </div>
        <DividerAfter isLast={isLast} />
      </section>
    )
  }
}
