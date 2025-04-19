const fs = require('fs');
const { marked } = require('marked');
const path = require('path');
const markedKatex = require("marked-katex-extension");
const express = require("express");
const router = express.Router();
const katexExtension = require("./katex_ext.ts");
options = {
    'site_root':'/notes',
    'md_base': 'public/md',
}
// Serve static files (CSS, JS, etc.)

marked.use({
    gfm: true,
    breaks: true,
})
marked.use(katexExtension({throwOnError: false}));
// marked.use(markedKatex({
//     nonStandard: true,
//     throwOnError: false,
//     delimiters : [
//         {left: "$$", right: "$$", display: true},
//         {left: "\\[", right: "\\]", display: true},
//         {left: "\\(", right: "\\)", display: false},
//         {left: "$", right: "$", display: false},
//     ]
// }))
function genTableOfFiles(pathname){
    // return a list of markdown files in the directory
    var files = fs.readdirSync(path.join(options.md_base, pathname));
    var md_files = files.filter(file => file.endsWith('.md') || fs.statSync(path.join(options.md_base,pathname, file)).isDirectory());

    var file_list = '<ul>';
    md_files.forEach(file => {
        file_list += `<li><a href="${path.join(options.site_root, pathname, file)}">${file}</a></li>`;
    });
    file_list += '</ul>';
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${pathname}</title>
            <link rel="stylesheet" href="/css/styles.css">
        </head>
        <body>
            <div class="content">
                <h1>${pathname}</h1>
                ${file_list}
            </div>
        </body>
        </html>
    `;
}
function genFileContent(title,content){
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" href="/css/styles.css">
    </head>
    <body>
        <div class="content">
            ${content}
        </div>
    </body>
    </html>
    `
}
var handler = function(req, res) {
    console.log(`${req.baseUrl},${req.url},${req.originalUrl}`);
    const pathList = req.params.pathlist;
    console.log(`pathList:${pathList}`);
    const pathname = pathList ? pathList.join('/'):  '/' ;
    console.log(pathname);
    // const filename = req.query.filename;
    // string is a path if ends with / or the last part do not contain a dot
    const isPath = pathname.endsWith('/') || pathname.split('/').pop().indexOf('.') === -1;
    const filename = isPath? undefined : pathname.split('/').pop();
    console.log(`isPath:${isPath}, pathname:${pathname}, filename: ${filename}`);

    if(isPath){
        if(!fs.statSync(path.join(options.md_base, pathname)).isDirectory()){
            return res.status(404).send('Directory not found:'+` ${pathname}`);
        }
        // try to find index.md or README.md in the path
        var found = false;
        for(var file in ['index.md', 'README.md']){
            res_path = path.join(options.md_base, pathname, file);
            if(fs.existsSync(res_path)){
                found = true;
                break;
            }
        }
        // if not found, return a list of files in the directory
        if(!found) {
            res.send(genTableOfFiles(pathname));
            return;
        }
    }else{
        res_path = path.join(options.md_base,pathname);
    }
    fs.readFile(res_path, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).send('File not found');
            }
            return res.status(500).send('Error reading the file');
        }
        const htmlContent = marked(data);
        res.send(genFileContent(filename, htmlContent));
    });
};
router.get('/',handler);
router.get('/*pathlist', handler);

// Home page route
// router.get("/", function (req, res) {
//   res.send("Wiki home page");
// });

// About page route
// router.get("/about", function (req, res) {
//   res.send("About this wiki");
// });

module.exports = router;