import React, { PropTypes } from "react"

import styles from "./index.css"

const Content = (props) => (
  <section className={ styles.content }>
    { props.children }
  </section>
)

Content.propTypes = {
  children: PropTypes.node,
}

export default Content
