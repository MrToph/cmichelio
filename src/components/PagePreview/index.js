import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { CategoryBar } from '../../components'
import styles from './index.css'

const PagePreview = ({ __url, title, date, description, featured, categories }) => {
  const pageDate = date ? new Date(date) : null
  return (
    <div className={styles.clear}>
      <Link to={__url}>
        { title }
      </Link>
      <small className={styles.small}>
      <CategoryBar categories={categories} />
      {
        pageDate &&
          <time key={pageDate.toISOString()}>
            { pageDate.toDateString() }
          </time>
      }
      </small>
      {
        featured &&
        <span className={styles.featuredWrapper}>
          <img src={featured} className={styles.featured} />
        </span>
      }
      {
        description &&
        <p>{description}</p>
      }
    </div>
  )
}

PagePreview.propTypes = {
  __url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  date: PropTypes.string,
  description: PropTypes.string,
  featured: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string)
}

export default PagePreview
