import React, { Component } from 'react'

export default class ContactForm extends Component {
    state = {
        reveal: false,
    }

    decodeMail(encodedMail) {
        let decoded = ''
        for(let i = 0; i < encodedMail.length; i++){
            decoded += String.fromCharCode(encodedMail.charCodeAt(i) ^ 33)
        }
        return decoded
    }

    onReveal = () => {
        this.setState({ reveal: true })
    }

    render() {
        let decoded = this.decodeMail('L@HMaBLHBIDMHN')
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
}
