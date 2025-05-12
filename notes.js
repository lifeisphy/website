const fs = require('fs');
const { marked } = require('marked');
const path = require('path');
const markedKatex = require("marked-katex-extension");
const express = require("express");
const router = express.Router();
const katexExtension = require("./katex_ext.ts");
const ftree = require("./files.js");
const ejs = require("ejs");
const {options, default_index} = require("./options.js");
// Serve static files (CSS, JS, etc.)
// 读取文件树为json备用
// 打开template备用
const template_string = fs.readFileSync(options.template, 'utf8');
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
// function genTableOfFiles(pathname){
//     // return a list of markdown files in the directory
//     var files = fs.readdirSync(path.join(options.md_base, pathname));
//     var md_files = files.filter(file => file.endsWith('.md') || fs.statSync(path.join(options.md_base,pathname, file)).isDirectory());

//     var file_list = '<ul>';
//     md_files.forEach(file => {
//         file_list += `<li><a href="${path.join(options.site_root, pathname, file)}">${file}</a></li>`;
//     });
//     file_list += '</ul>';
//     return file_list;
// }
function extractContent(html) {
    const startTag = '<div class="content">';
    const endTag = '</div>';
    const startIndex = html.indexOf(startTag);
    const endIndex = html.indexOf(endTag, startIndex) + endTag.length;
    return html.substring(startIndex, endIndex);
}
function parseRequest(req){
    const pathname = decodeURIComponent(req.path);
    const partial = req.query.partial === 'true'; // 是否为局部请求
    // string is a path if it ends with a /, or the last part do not contain a dot
    // something like /a/b/c/, or /a/b/c
    const isPath = pathname.endsWith('/') || pathname.split('/').pop().indexOf('.') === -1;
    const filename = isPath? undefined : pathname.split('/').pop();
    return {
        pathname: pathname,
        partial: partial,
        isPath: isPath,
        filename: filename,
        ext: isPath? undefined : path.extname(pathname),
    };
}
var handler = function(req, res) {
    // console.log(`${req.baseUrl},${req.url},${req.path}`);
    const Info = parseRequest(req);
    console.log(Info);
    var err=false;
    var errmsg = null;
    var path_ = path.join(options.md_base, Info['pathname']);
    if(Info['isPath']){ // accessing a directory
        if(!fs.statSync(path_).isDirectory()){
            res.status(404).send('Not a directory: ' + path_);
            return;
        }
        // try to find index.md or README.md in the path
        var found = false;
        for(const file of default_index){
            res_path = path.join(path_, file);
            // console.log(`checking ${res_path}`);
            if(fs.existsSync(res_path)){
                found = true;
                path_ = res_path;
                break;
            }
        }
        // if not found, return a list of files in the directory
        if(!found) {
            err=true;
            errmsg = 'Directory Description Not Found: ' + path_;
            // res.status(404).send('Directory Description Not Found: ' + Info['pathname']);
            // return;
            // errmsg = 'Directory Description Not Found: ' + pathname;
        }
    } else { // accessing a file
        // res_path = path.join(options.md_base,Info['pathname']);
    }
    console.log(`path_: ${path_},err: ${err}`);
    if(err){
        data = errmsg;
    }else{
        data = fs.readFileSync(path_, 'utf8');
    }
   
    var servestatic = Info['ext'] == '.md' ? false : true;
    
    if(!Info['isPath'] && servestatic){
        res.sendFile(path.resolve(path_), function (err) {
            if (err) {
                console.error('Error serving file:', err);
                res.status(err.status || 500).send('Error serving file');
            }
        });
    }else{
        var htmlContent = marked(data);
        if (!Info['partial']) {
            // 渲染完整页面
            ejs.renderFile(options.template, { 'file_tree': file_tree, 'content': htmlContent }, function (err, str) {
                if (err) {
                    console.error('Error rendering template:', err);
                    res.status(500).send('Error rendering template');
                    return;
                }
                res.send(str);
            });
        }else {
            // 渲染局部页面
            res.send(htmlContent);
        }
    }
};

router.get('/',handler);
router.get('/files', function(req, res) {
    res.send(ftree.file_tree);
});
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