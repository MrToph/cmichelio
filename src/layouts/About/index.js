import React, { Component } from 'react'
import Page from '../Page'
import { ContactForm } from '../../components'

export default class About extends Component {
    render() {
        let props = this.props
        return (
            <Page { ...props }>
                <ContactForm />
            </Page>
        )
    }
}
