import React, { PropTypes, Component } from 'react'
// import { joinUri } from 'phenomic'
import { Link } from 'react-router'
import styles from './index.css'

export default class CategoryBar extends Component {
    static propTypes = {
        categories: PropTypes.arrayOf(PropTypes.string)
    }
    
    render() {
        const categories = this.props.categories
        return (
            categories ?
            <div className={styles.categories}>
                <i>
                {
                    categories.length >= 2 ? 'Categories: ' : 'Category: '
                }
                </i>
                <nav className={styles.nav}>
                {
                    categories.map((category,i) => <Link key={i} className={styles.navItem} to={ `/#${category}` }>
                                                { category }
                                            </Link>)
                }
                </nav>
            </div>
            : null
        )
    }
}