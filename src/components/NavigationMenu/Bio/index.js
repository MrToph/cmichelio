import React from 'react'
import { css } from 'glamor'
import Link from 'gatsby-link'
import profilePic from './me_cut.png'
// import profilePic from './me_mug.jpg'

const imageStyles = css({
  width: `6rem`,
  marginBottom: `0`,
})

export default class Bio extends React.Component {
  render() {
    return (
      <div>
        <img
          src={profilePic}
          alt={`author Christoph Michel`}
          {...imageStyles}
        />
        <h2>
          <Link to="/">cmichel.io</Link>
        </h2>
        <p style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
          {`Christoph Michel`}
        </p>
      </div>
    )
  }
}
