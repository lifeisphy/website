const katex = require('katex');
const marked = require('marked');



function inlineKatex(options) {
    return {
        name: 'inlineKatex',
        level: 'inline',
        start(src) {
            return src.indexOf('$')
        },
        tokenizer(src, _tokens) {
            const match = src.match(/^\$+([^$\n]+?)\$+/)
            if (match) {
                return {
                    type: 'inlineKatex',
                    raw: match[0],
                    text: match[1].trim()
                }
            }
        },
        renderer(token) {
            options.displayMode = false
            return katex.renderToString(token.text, options)
        }
    }
}

function blockKatex(options) {
    return {
        name: 'blockKatex',
        level: 'block',
        start(src) {
            return src.indexOf('$$')
        },
        tokenizer(src, _tokens) {
            const match = src.match(/^\$\$[\n]?([^$]+?)[\n]?\$\$/)
            if (match) {
                return {
                    type: 'blockKatex',
                    raw: match[0],
                    text: match[1].trim()
                }
            }
        },
        renderer(token) {
            options.displayMode = true
            return `<p>${katex.renderToString(token.text, options)}</p>`
        }
    }
}
module.exports = {inlineKatex, blockKatex};