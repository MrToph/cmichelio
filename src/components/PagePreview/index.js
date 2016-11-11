import React, { PropTypes } from "react"
import { Link } from "react-router"
import { CategoryBar } from '../../components'

const PagePreview = ({ __url, title, date, description, featured, categories }) => {
  const pageDate = date ? new Date(date) : null

  return (
    <div style={{clear: 'both', marginBot: '1rem'}}>
      <Link to={ __url }>
        { title }
      </Link>
      <small style={{display: 'block'}}>
      <CategoryBar categories={categories} />
      {
        pageDate &&
          <time key={ pageDate.toISOString() }>
            { pageDate.toDateString() }
          </time>
      }
      </small>
      {
        featured && 
        <img src={featured} style={{maxWidth: '200px', maxHeight: '200px', float: 'left', margin: '1rem 0.5rem 1rem 0.5rem'}}/>
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
