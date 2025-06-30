
options = {
    'site_root':'/',
    'md_base': 'public/md',
    'content_template': 'public/templates/content.ejs',
    'page_template': 'public/templates/page.ejs',
    'tags_template': 'public/templates/tags.ejs',
    'toc_template': 'public/templates/toc.ejs',
    'slides_template': 'public/templates/slides.ejs',
    'comments_dir': 'public/comments',
    'comments_template': 'public/templates/comments.ejs',
    HOST: 'localhost',
    PORT: 80,
    allow_comments: true,
    max_comment_limit: 10,
}
const path = require('path');
function normalizePath(p) {
    if (typeof p === 'string') {
        return p.replace(/[\\/]/g,path.sep);
    }else {
        return p;
    }
}
// go over all keys in options and normalize them
Object.keys(options).forEach(key => {
    options[key] = normalizePath(options[key]);
});

default_index = ['index.md', 'README.md'];
katex_macros = {
    "\\R": "\\mathbb{R}",
    "\\ket": "\\left| #1 \\right\\rangle",
    "\\bra": "\\left\\langle #1 \\right|",
    "\\braket": "\\left\\langle #1 \\middle| #2 \\right\\rangle",
    "\\fcolorbox": "\\fcolorbox{blue}{white}{#3}",
    // "\\fcolorboxdefault": "\\fcolorbox{#1}{white}{#3}",
}
show_time= true;
filter_options = {
    showYAML: true,
    zhihu: false,
}
tag_options = {
    truncationLength: 200,
}
module.exports = { options, default_index, katex_macros, filter_options, tag_options };