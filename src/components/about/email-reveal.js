import React, { useState } from 'react'
import { decodeMail } from './utils'

export default function EmailReveal() {
  const [reveal, setReveal] = useState(false)

  let decoded = decodeMail(`L@HMaBLHBIDMHN`)

  return (
    <React.Fragment>
      {`E-Mail: `}
      {reveal ? (
        <a href={`mailto:${decoded}`}>{`${decoded}`}</a>
      ) : (
        <a onClick={() => setReveal(true)}>Click to reveal</a>
      )}
      <noscript>Please enable Javascript to see the email address.</noscript>
    </React.Fragment>
  )
}
