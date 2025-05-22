
options = {
    'site_root':'/notes',
    'md_base': 'public/md',
    'content_template': 'public/templates/content.ejs',
    'page_template': 'public/templates/page.ejs',
}
default_index = ['index.md', 'README.md'];
katex_macros = {
    "\\R": "\\mathbb{R}",
    // "\\fcolorboxdefault": "\\fcolorbox{#1}{white}{#3}",
}
show_time= true;
filter_options = {
    showYAML: true,

}
module.exports = { options, default_index, katex_macros, filter_options };