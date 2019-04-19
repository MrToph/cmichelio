import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'
import './index.css'
import { useApi } from '../../utils'
import { fetchMakerlog } from '../../api'

function MakerlogInner(props) {
  const { loading, data, image } = props

  const renderListContent = () => {
    if (loading) return <li className="makerlog__item justify-center">Loading ...</li>

    if (Array.isArray(data.makerlog)) {
      return data.makerlog.map((task, index) => (
        <li className="makerlog__item" key={index}>
          <span>✅</span>
          <span className="flex-1 ml-2">{task.description}</span>
          <time>{`${task.date} ago`}</time>
        </li>
      ))
    }

    return null
  }

  return (
    <div className="makerlog">
      <div className="makerlog__header">
        <Image
          className="rounded-full ml-4"
          fixed={image.file.childImageSharp.fixed}
          alt="me"
        />
        <h3 className="ml-4 flex-1">Makerlog - Done this week</h3>
        <a
          href="https://getmakerlog.com/@cmichel"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-black font-bold bg-green pl-2 mr-4"
        >
          Follow 🏃‍♂️
        </a>
      </div>
      <ol className="makerlog__list scrollbar">{renderListContent()}</ol>
    </div>
  )
}

MakerlogInner.propTypes = {
  image: PropTypes.shape({
    file: PropTypes.object.isRequired,
  }).isRequired,
  data: PropTypes.shape({
    makerlog: PropTypes.array,
  }),
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
}

export function Makerlog(props) {
  return (
    <StaticQuery
      query={graphql`
        query MakerlogQuery {
          file(absolutePath: { regex: "/src/assets/images/me_mug/" }) {
            childImageSharp {
              fixed(height: 40) {
                ...GatsbyImageSharpFixed
              }
            }
          }
        }
      `}
      render={data => <MakerlogInner {...props} image={data} />}
    />
  )
}

export default function MakerlogContainer() {
  const makerlogResult = useApi(fetchMakerlog)

  return <Makerlog {...makerlogResult} />
}
