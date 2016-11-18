import React, { Component } from 'react'

export default class ContactForm extends Component {
    constructor(props) {
        super(props)
        this.state = {reveal: false}
    }

    render() {
        let decoded = this.encodeMail('L@HMaBLHBIDMHN')
        return (
            <section>
            <h2>Contact</h2>
            If you want to get in touch with me, just write a mail or contact me on Twitter.
            <div>{'E-Mail: '}
            {this.state.reveal ? <a href={`mailto:${decoded}`}>{`${decoded}`}</a> : <a onClick={this.onReveal}>Click to reveal</a>}
            <noscript>Please enable Javascript to see the email address.</noscript>
            </div>
            </section>
        )
    }

    encodeMail(mail) {
        let encoded = ''
        for(let i = 0; i < mail.length; i++){
            encoded += String.fromCharCode(mail.charCodeAt(i) ^ 33)
        }
        return encoded
    }

    onReveal = () => {
        this.setState({reveal: true})
    }
}
