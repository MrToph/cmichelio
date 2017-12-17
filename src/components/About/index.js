import React from 'react'
import ContactForm from './ContactForm'
import PageTitle from '../PageTitle'

export default class AboutContent extends React.Component {
  render() {
    return (
      <section>
        <PageTitle>About</PageTitle>
        <h2>Welcome to cmichel.io</h2>
        <p>
          I {`'`}m <strong>Christoph Michel</strong>. I hold a bachelor{`'`}s
          degree in both <em>Math</em> and <em>Computer Science</em> and
          finished my master studies in <em>(Theoretical) Cryptography</em> last
          year.
        </p>
        <p>
          I have a broad interest in many things, and am always learning. Right
          now, I{`'`}m working as a full stack software engineer in the{' '}
          <em>JavaScript / Node.js</em> eco-system. I dedicate most of my free
          time to the <em>gym</em>, <em>eating</em> a lot, <em>open-source</em>,{' '}
          <em>teaching</em>, and innovative <em>blockchain</em> projects.
        </p>
        <ContactForm />
      </section>
    )
  }
}
