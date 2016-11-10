/* eslint-disable */
import katex from 'katex'
import he from 'he'

const pattern = new RegExp(String.raw`\$\$([\s\S]*?)\$\$`, 'ig') // eslint-disable-line
export default function parseMath(obj) {
    let body = obj.result.body
    body = body.replace(pattern, replaceLatex)
    return {
        ...obj.result,
        body: body
    }
}

const replaceLatex = (fullMatch, latex) => {
    latex = he.decode(latex).replace(' ', ' ')  // replace non-breaking space with normal space as katex parser can't read it
    // unfortunately the string is not escaped, i.e. \\ will be single backslash
    // there is no easy fix as \t\t\tHello should not be converted whereas \text should
    // so make sure to write escaped Latex:
    // \\ => \\\\   &#38 => &   ' '/&nbsp; => ' '
    // Make sure to leave no empty lines between $$ and $$ so no <p>s get inserted from parsing the markdown later
    return katex.renderToString(latex)
}
