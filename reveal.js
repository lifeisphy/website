const Reveal = require("reveal.js");
const Markdown = require("reveal.js/plugin/markdown/markdown.js");


let deck = new Reveal({
    plugins: [Markdown]
})
deck.initialize();