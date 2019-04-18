import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import Image from 'gatsby-image'
import './makerlog.css'
import { useApi } from '../../utils'
import { fetchMakerlog } from '../../api'

function Makerlog(props) {
  const { file } = props.data
  const { loading, error, data } = useApi(fetchMakerlog)

  if (loading) return <p>Loading ...</p>

  if (error) {
    return null
  }
  console.log(data)
  return (
    <div className="makerlog">
      <div className="makerlog__header">
        <Image
          className="rounded-full ml-4"
          fixed={file.childImageSharp.fixed}
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
      <ol>
        {data.makerlog.map((task, index) => (
          <li key={index}>
            {task.description}
            {task.date}
          </li>
        ))}
      </ol>
      <iframe
        title="Makerlog Embed"
        height="200"
        style={{ width: `100%` }}
        scrolling="no"
        frameBorder="0"
        allowTransparency="true"
        src="https://api.getmakerlog.com/users/756/embed"
      />
    </div>
  )
}

Makerlog.propTypes = {
  data: PropTypes.shape({
    file: PropTypes.object.isRequired,
  }).isRequired,
}

export default function MakerlogContainer(props) {
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
      render={data => <Makerlog {...props} data={data} />}
    />
  )
}
