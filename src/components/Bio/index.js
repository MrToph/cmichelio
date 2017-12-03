import React from 'react'
import metadata from '../../metadata'
import profilePic from '../../../content/assets/me_cut.png'

class Bio extends React.Component {
  render () {
    return (
      <div className='Bio verticalContainer'>
        <img src={profilePic} alt={`author ${metadata.authorName}`} style={{ width: '6rem', marginBottom: 0 }} />
        <h2 style={{marginTop: '1.5rem'}}><a href='/'>cmichel.io</a></h2>
        <p style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
          {`${metadata.authorName}`}
        </p>
      </div>
    )
  }
}

export default Bio
