import React from 'react'
import profilePic from './me_cut.png'

export default class Bio extends React.Component {
  render () {
    return (
      <div className='Bio verticalContainer'>
        <img src={profilePic} alt={`author Christoph Michel`} style={{ width: '6rem', marginBottom: 0 }} />
        <h2 style={{marginTop: '1.5rem'}}><a href='/'>cmichel.io</a></h2>
        <p style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
          {`Christoph Michel`}
        </p>
      </div>
    )
  }
}
