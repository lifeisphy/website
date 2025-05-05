const fs = require('fs');
const { marked } = require('marked');
const path = require('path');
const markedKatex = require("marked-katex-extension");
const express = require("express");
const router = express.Router();
const katexExtension = require("./katex_ext.ts");
const ftree = require("./files.js");
const ejs = require("ejs");
const options = require("./options.js").options;
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
var handler = function(req, res) {
    console.log(`${req.baseUrl},${req.url},${req.path}`);
    const pathname = decodeURIComponent(req.path);
    
    console.log(pathname);
    const partial = req.query.partial === 'true'; // 是否为局部请求
    
    // const filename = req.query.filename;
    // string is a path if ends with / or the last part do not contain a dot
    const isPath = pathname.endsWith('/') || pathname.split('/').pop().indexOf('.') === -1;
    const filename = isPath? undefined : pathname.split('/').pop();
    console.log(`isPath:${isPath}, pathname:${pathname}, filename: ${filename}`);

    var err=false;
    var errmsg = null;
    if(isPath){ // 目录
        var path_ = path.join(options.md_base, pathname);
        if(!fs.statSync(path_).isDirectory()){
            err = true;
            errmsg = 'Directory Not Found: ' + pathname;
        }
        // try to find index.md or README.md in the path
        var found = false;
        for(const file of ['index.md', 'README.md']){
            res_path = path.join(path_, file);
            console.log(`checking ${res_path}`);
            if(fs.existsSync(res_path)){
                found = true;
                break;
            }
        }
        // if not found, return a list of files in the directory
        if(!found) {
            err = true;
            errmsg = 'Directory Description Not Found: ' + pathname;
        }
    } else {
        // check extension 
        res_path = path.join(options.md_base,pathname);
    }
    try {
        data = fs.readFileSync(res_path, 'utf8');
    } catch (error){
        if(error.code === 'ENOENT') {
            data = '## File not found: ' + res_path;
        }else{
            data = '## Error reading file: ' + error.message;
        }
    }
    var ext = path.extname(res_path);
    var servestatic = ext == '.md' ? false : true;
    var htmlContent = null;
    if(err){
        htmlContent = '<h1>ERROR</h1><p>' + errmsg + '</p>';
    } else {
        var data;
        
        if(ext === '.md'){
            // 处理markdown文件
            htmlContent = marked(data);
        }else {
            // 按照静态文件处理
            htmlContent = data;
        }
        htmlContent = marked(data);
    }
    if (!partial) {
        // 渲染完整页面
        if(ext === '.md'){
         ejs.renderFile(options.template, { 'file_tree': file_tree, 'content': htmlContent }, function (err, str) {
             htmlContent = str;
         });
    }
    if(servestatic){
        
    }else{
    res.send(htmlContent);
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