import React, { Component, PropTypes } from 'react'
import { prefixLink } from 'gatsby-helpers'
import { rhythm } from 'utils/typography'
import { Bio, SocialBar } from '../components'

export default class NavigationMenu extends Component {
  static propTypes = {
  }

  render () {
    /* 17 pixels is size of scrollbar */
    return (
      <nav id='nav'>
        <div className='scrollHide' style={{}}>
          <Bio />
          <div className='horizontalContainer' style={{justifyContent: 'space-around', width: '100%'}}>
            <a href={prefixLink('/')}>Blog</a>·
            <a href={prefixLink('/about')}>About</a>·
            <a href={prefixLink('/portfolio')}>Portfolio</a>
          </div>
          <SocialBar />
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero
            eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet,
            consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo
            duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
            elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
            Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie
            consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis
            dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam
            erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel
            eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio
            dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.
          </p>
        </div>
      </nav>
    )
  }


  checkHeight() {
    // possible resize depending on if the scroll-bar is shown or not
  }
}
