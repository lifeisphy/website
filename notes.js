const fs = require('fs');
const { marked } = require('marked');
const path = require('path');
const markedKatex = require("marked-katex-extension");
const express = require("express");
const router = express.Router();
const katexExtension = require("./utils/katex_ext.ts");
const {ftree, tags }= require("./utils/files.js");
const ejs = require("ejs");
const matter = require('gray-matter');
const { options, default_index, katex_macros } = require("./options.js");
// Serve static files (CSS, JS, etc.)
// 读取文件树为json备用
// 打开template备用
const { filter_before, filter_after } = require('./utils/mdFilter.js');
const getTime = require('./utils/file_stat.js');
const {bgmList, pictureList} = require('./utils/sources.js');
// const template_string = fs.readFileSync(options.page_emplate, 'utf8');
console.log(ftree,tags);
marked.use({
    gfm: true,
    breaks: true,
})



marked.use(katexExtension({
    throwOnError: false,
    macros: katex_macros
}));

function parseRequest(req) {
    console.log(`Request path: ${req.path}`);
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
    const Info = parseRequest(req);
    console.log(Info);
    var fs_path = path.join(options.md_base, Info['pathname']);
    if (Info['isPath']) { // accessing a directory, make sure which file to show
        if(!fs.existsSync(fs_path,)){
            res.status(404).send('Directory Not Found: ' + Info['pathname']);
            return;
        }
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
    }
    console.log(`fs_path: ${fs_path}`);
    fs.readFile(fs_path, 'utf8', (err, data) => {
        if (err) {
            res.status(404).send('File Not Found: ' + fs_path);
            return;
        }
        var servestatic = Info['ext'] != '.md';

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
            var Results = matter(data);
            data = Results.content; // get the content of the markdown file
            data = filter_before(data); // execute filter to the file
            var htmlRawContent = marked(data);
            htmlRawContent = filter_after(htmlRawContent); // execute filter to the file
            opts = {
                show_header: false,
                show_footer: false,
                show_time: true,
                t: getTime(fs_path),
                tags: Results.data.tags || [],
                tagsurl: path.join(options.site_root , 'tags'),
                content: htmlRawContent,
            };
            ejs.renderFile(options.content_template, opts, function (err, htmlContent) {
                if (!Info['partial']) {
                    // 渲染完整页面
                    if (err) {
                        console.error('Error rendering template:', err);
                        res.status(500).send('Error rendering template');
                        return;
                    }
                    // console.log(`${pictureList},${bgmList}`);
                    opts = { 
                        'file_tree': file_tree,
                        'content': htmlContent,
                        'SpecifiedScreenWidth': 500,
                        'bgmList': bgmList,
                        'pictureList': pictureList,
                    };
                    ejs.renderFile(options.page_template, opts
                        , function (err, str) {
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

router.get('/tags/:tag', (req, res) => {
    const tag = req.params.tag;
    // 假设你有所有文章的元数据列表 allPosts
    if( !tags[tag]) {
        res.status(404).send('Tag Not Found: ' + tag);
        return;
    }else{
        const summaries = {};
        const posts = tags[tag];
        posts.forEach(post => {
            // convert webpath to fs path
            post_path = post.replace(options.site_root, options.md_base);
            const content = fs.readFileSync(post_path, 'utf8');
            const parsed = matter(content);
            summaries[post] = marked(parsed.content.trim().slice(0,100) + '...');
        });
        
        ejs.renderFile(options.tags_template, {
            'tag': tag,
            'posts': posts,
            'summaries': summaries,
        },function (err, str) {
            if (err) {
                console.error('Error rendering template:', err);
                res.status(500).send('Error rendering template');
                return;
            }
            res.send(str);
        });
    }
});
router.get('/', handler);
router.get('/*pathlist', handler);
// Home page route
module.exports = router;