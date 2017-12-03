import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const containerStyles = css({
  '& > h4': {
    marginTop: 0,
  }
})

const verticalContainerStyles = css({
  display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
})

export default class BuiltWith extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
  }

  render() {
    let items = this.props.items
    return (
      <div {...containerStyles}>
        <h4>Built With:</h4>
        <div {...verticalContainerStyles}>
          {items.map(item => <span key={item}>{item}</span>)}
        </div>
      </div>
    )
  }
}
