const fs = require('fs');
const { marked } = require('marked');
const path = require('path');
const markedKatex = require("marked-katex-extension");
const express = require("express");
const router = express.Router();
const katexExtension = require("./katex_ext.ts");
const ftree = require("./files.js");
const ejs = require("ejs");
const { options, default_index, katex_macros } = require("./options.js");
// Serve static files (CSS, JS, etc.)
// 读取文件树为json备用
// 打开template备用
const { filter_before, filter_after } = require('./mdFilter.js');
const getTime = require('./utils/file_stat.js');
// const template_string = fs.readFileSync(options.page_emplate, 'utf8');

marked.use({
    gfm: true,
    breaks: true,
})



marked.use(katexExtension({
    throwOnError: false,
    macros: katex_macros
}));
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
function parseRequest(req) {
    const pathname = decodeURIComponent(req.path);
    const partial = req.query.partial === 'true'; // 是否为局部请求
    // string is a path if it ends with a /, or the last part do not contain a dot
    // something like /a/b/c/, or /a/b/c
    const isPath = pathname.endsWith('/') || pathname.split('/').pop().indexOf('.') === -1;
    const filename = isPath ? undefined : pathname.split('/').pop();
    return {
        pathname: pathname,
        partial: partial,
        isPath: isPath,
        filename: filename,
        ext: isPath ? undefined : path.extname(pathname),
    };
}
var handler = function (req, res) {
    // console.log(`${req.baseUrl},${req.url},${req.path}`);
    const Info = parseRequest(req);
    console.log(Info);
    var fs_path = path.join(options.md_base, Info['pathname']);
    if (Info['isPath']) { // accessing a directory
        if (!fs.statSync(fs_path).isDirectory()) {
            res.status(404).send('Not a directory: ' + Info['pathname']);
            return;
        }
        // try to find index.md or README.md in the path
        var found = false;
        for (const file of default_index) {
            res_path = path.join(fs_path, file);
            Info.filename = file;
            Info.ext = path.extname(file);
            if (fs.existsSync(res_path)) {
                found = true;
                fs_path = res_path;
                break;
            }
        }

        if (!found) {
            var errmsg = 'Directory Description Not Found: ' + fs_path;
            res.status(404).send(errmsg);
            return;
        }
    } else { // accessing a file

    }
    console.log(`fs_path: ${fs_path}`);
    // var data = String();
    fs.readFile(fs_path, 'utf8', (err, data) => {
        if (err) {
            res.status(404).send('File Not Found: ' + fs_path);
            return;
        }
        var servestatic = Info['ext'] == '.md' ? false : true;

        if (servestatic) {
            // serve static file directly.
            const absolutePath = path.resolve(fs_path);
            res.sendFile(absolutePath, function (err) {
                if (err) {
                    console.error('Error serving file:', err);
                    res.status(err.status || 404).send('Error serving file');
                }
            });
        } else {
            data = filter_before(data); // execute filter to the file
            var htmlRawContent = marked(data);
            opts = {
                show_header: false,
                show_footer: false,
                show_time: true,
                t: getTime(fs_path),
                content: htmlRawContent,
            };
            // console.log(opts);
            ejs.renderFile(options.content_template, opts, function (err, htmlContent) {
                if (!Info['partial']) {
                    // 渲染完整页面
                    if (err) {
                        console.error('Error rendering template:', err);
                        res.status(500).send('Error rendering template');
                        return;
                    }
                    ejs.renderFile(options.page_template, { 'file_tree': file_tree, 'content': htmlContent }, function (err, str) {
                        if (err) {
                            console.error('Error rendering template:', err);
                            res.status(500).send('Error rendering template');
                            return;
                        }
                        res.send(str);
                    });
                } else {
                    // 渲染局部页面
                    res.send(htmlContent);
                }
            });
        }
    });


};

router.get('/', handler);
router.get('/files', function (req, res) {
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