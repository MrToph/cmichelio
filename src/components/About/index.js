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
          finished my master studies in <em>Cryptography</em>
          this year.
        </p>
        <p>
          I have a broad interest in many things, always learning, and on my
          quest to mastery. Right now, I{`'`}m working as a full stack software
          engineer in the <em>JavaScript / Node.js</em> eco-system. I dedicate
          most of my free time to the <em>gym</em>, <em>eating</em> a lot,{' '}
          <em>open-source</em>, and innovative <em>blockchain</em> projects.
        </p>
        <ContactForm />
      </section>
    )
  }
}
