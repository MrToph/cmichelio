import React, { Component, PropTypes } from 'react'
import styles from './index.css'
import BuiltWith from '../BuiltWith'

export default class PortfolioItem extends Component {
  render () {
    let {title, imgSrc, builtWith, children, isFirst, isLast} = this.props
    return (
        <section>
            {
                !isFirst
                ? <div className={`${styles.borderLeft}`}>
                    <svg className={`${styles.svg}`} xmlns='http://www.w3.org/2000/svg' height='50' width='99%' version='1.1' preserveAspectRatio='none' viewBox='0 0 100 100'>
                        <path d='m0.0 0.0 0.0 100.0 100.0 0.0z' />
                    </svg>
                </div>
            : null
            }
            <div className={`${styles.portfolio} ${styles.borderBoth} ${isLast ? styles.shadowHorizontal : ''}`}>
                <h3>{title}</h3>
                <div className={styles.horizontalContainer}>
                    <img src={imgSrc} className={styles.img} />
                    <BuiltWith items={builtWith} />
                </div>
                {
                    children
                }
            </div>
            {
                !isLast
                ? <div className={`${styles.shadowTriangle} ${styles.borderRight}`}>
                    <svg className={`${styles.svg}`} xmlns='http://www.w3.org/2000/svg' height='50' width='99%' version='1.1' preserveAspectRatio='none' viewBox='0 0 100 100'>
                        <path d='m0.0 0.0 100.0 0.0 0.0 100.0z' />
                    </svg>
                </div>
            : null
            }
            
        </section>
        )
  }
}

PortfolioItem.propTypes = {
  title: PropTypes.string.isRequired,
  imgSrc: PropTypes.string.isRequired,
  builtWith: PropTypes.arrayOf(PropTypes.string),
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  children: PropTypes.node
}
