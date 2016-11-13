import React, { Component } from 'react'
import Page from '../Page'

export default class About extends Component {
    render() {
        let props = this.props
        return (
            <Page { ...props }>
            </Page>
        )
    }
}
