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
          I {`'`}m <strong>Christoph Michel</strong>. I hold bachelor{`'`}s
          degree and master's degrees in both <em>Math</em> and <em>Computer Science</em> with a focus on <em>(Theoretical) Cryptography</em>.
        </p>
        <p>
          I have a broad interest in many things, and am always curious. Right
          now, I{`'`}m working as a full stack software engineer in the{' '}
          <em>JavaScript / Node.js</em> eco-system. I dedicate most of my free
          time to the <em>gym</em>, <em>eating</em> a lot, <em>open-source</em>,{' '}
          <em>teaching</em>, and innovative <em>blockchain</em> projects.
        </p>
        <h3>What other people say about me</h3>
        <ul>
          <li>
            Mark Erikson, maintainer of Redux, in his <a href="https://www.reddit.com/r/reactjs/comments/5t8loz/what_are_your_top_reactreact_native_blogs_that/" rel="nofollow">high quality blogs</a> reddit post:
            <blockquote>Christoph Michel has written a number of good articles about React, React Native, and Redux</blockquote>
          </li>
          <li>
            Considered one of the <a href="https://ideamotive.co/blog/best-react-native-experts-blogs/" rel="nofollow">17 React Native experts and Blogs To follow in 2018</a>.
            <blockquote>Christoph has written a number of good articles about React, React Native, and Redux. Although he doesn’t exclusively write about mobile app development, his blog is still worth visiting.</blockquote>
          </li>
          <li>
            Receiver of <a href="https://www.fdsi.org/index.php?id=7">2016's "Günter Hotz medal"</a> for outstanding academical graduate studies.
          </li>
        </ul>
        <ContactForm />
      </section>
    )
  }
}

// * https://www.reddit.com/r/reactjs/comments/5t8loz/what_are_your_top_reactreact_native_blogs_that/
// * Expert React Native