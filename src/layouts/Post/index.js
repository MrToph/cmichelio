import React, { PropTypes } from 'react'
import ReactDisqusThread from 'react-disqus-thread'
import Page from '../Page'

const Post = (props) => {
  const pageDate = props.head.date ? new Date(props.head.date) : null
  return (
    <Page
      { ...props }
      header={
        <header>
          {
          pageDate &&
          <time key={ pageDate.toISOString() }>
            { pageDate.toDateString() }
          </time>
        }
        </header>
      }
    >
    <ReactDisqusThread
      shortname='cmichel'
      identifier={props.head.disqus_identifier}
      title={props.head.title}
      url={props.head.route} />
    </Page>
  )
}

Post.propTypes = {
  head: PropTypes.object.isRequired,
}

export default Post
