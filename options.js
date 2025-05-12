
options = {
    'site_root':'/notes',
    'md_base': 'public/md',
    'template': 'public/templates/notes.ejs',
}
default_index = ['index.md', 'README.md'];
katex_macros = {
    "\\R": "\\mathbb{R}",
    // "\\fcolorboxdefault": "\\fcolorbox{#1}{white}{#3}",
}

filter_options = {
    
}
module.exports = { options, default_index, katex_macros, filter_options };