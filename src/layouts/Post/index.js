/* eslint-disable */
import React, { PropTypes } from 'react'
import ReactDisqusThread from 'react-disqus-thread'
import Page from '../Page'
import metadata from '../../metadata'
import { isClientSide } from '../../utils'
import { joinUri } from 'phenomic'

const Post = (props) => {
  const pageDate = props.head.date ? new Date(props.head.date) : null
  const url = props.head.route ? joinUri(metadata.pkg.homepage, props.head.route) : joinUri(metadata.pkg.homepage, props.__url)

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
    {isClientSide() ? 
      <ReactDisqusThread
      shortname='cmichel'
      identifier={props.head.disqus_identifier ? props.head.disqus_identifier : url}
      title={props.head.title}
      url={url} />
      : undefined
    }
    </Page>
  )
}

Post.propTypes = {
  head: PropTypes.object.isRequired,
}

export default Post
