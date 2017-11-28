import React, { Component, PropTypes } from 'react'
import styles from './index.css'

export default class BuiltWith extends Component {
    static propTypes = {
        items: PropTypes.arrayOf(PropTypes.string).isRequired
    }

  render () {
      let items = this.props.items;
    return (
        <div className={styles.container}>
            <h4>Built With:</h4>
            <div className={styles.verticalContainer}>
                {items.map(item => <span key={item}>{item}</span>)}
            </div>
        </div>
    )
  }
}
