const fs = require('fs');
const { marked } = require('marked');
const path = require('path');
const markedKatex = require("marked-katex-extension");
const express = require("express");
const {inlineKatex, blockKatex} = require("./utils/katex_ext.ts");
const { tags, file_tree, findInFileTree }= require("./utils/files.js");
const ejs = require("ejs");
const matter = require('gray-matter');
const { options, default_index, katex_macros, tag_options } = require("./options.js");
const {BlockExtensionGenerator, theoremBlockExtension} = require("./utils/block_ext.ts");
// Serve static files (CSS, JS, etc.)
// 读取文件树为json备用
// 打开template备用
const { filter_before, filter_after } = require('./utils/mdFilter.js');
const getTime = require('./utils/file_stat.js');
const {bgmList, pictureList} = require('./utils/sources.js');
const { render } = require('less');

const data = require('./data.js');
const session = require('express-session');
const svgCaptcha = require('svg-captcha');

var {add_comment, ensure_post_exists} = require("./utils/comments.js");
const router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.use(session({
    secret: data.secret_key,
    resave: false,
    saveUninitialized: true
}));

opt = { throwOnError: false, macros: katex_macros ,strict: false};
marked.use({
  gfm: true,
  breaks: true,
  extensions: [
    BlockExtensionGenerator('Definition','red'),
                // theoremBlockExtension,
                BlockExtensionGenerator('Theorem','blue'),
                BlockExtensionGenerator('Proposition','purple'),
                BlockExtensionGenerator('Proof','yellow'),
                BlockExtensionGenerator('Remarks','aqua'),
                BlockExtensionGenerator('Example','green'),
                inlineKatex(opt), 
                blockKatex(opt)],
});


function parseRequest(req) {
    // console.log(`Request path: ${req.path}`);
    const pathname = decodeURIComponent(req.path);
    const partial = req.query.partial === 'true'; // 是否为局部请求
    const slides = req.query.slides === 'true'; // 是否为幻灯片请求
    const get_comment = req.query.get_comment === 'true'; // 是否为获取评论请求
    
    const comment_start = req.query.comment_start ? parseInt(req.query.comment_start) : 0; // 评论起始位置
    // string is a path if it ends with a /, or the last part do not contain a dot
    // something like /a/b/c/, or /a/b/c
    const comment_post_path = get_comment ? req.query.postPath : undefined; // 评论的文章路径

    const isPath = pathname.endsWith('/') || pathname.split('/').pop().indexOf('.') === -1;
    const filename = isPath ? undefined : pathname.split('/').pop();
    return {
        pathname: pathname,
        partial: partial,
        isPath: isPath,
        filename: filename,
        slides: slides,
        ext: isPath ? undefined : path.extname(pathname),
        get_comment: get_comment,
        comment_post_path : comment_post_path,
        comment_start: comment_start,
    };
}

var handler = function (req, res) {
    const Info = parseRequest(req);
    // console.log(Info);
    var fs_path = path.join(options.md_base, Info['pathname']);
    var posts, summaries;
    var content;
    var opts = {};
    opts.full_page = !Info['partial'];
    opts.is_slides = Info['slides'];
    opts.file_tree = file_tree;
    opts.gen_toc = false;
    opts.SpecifiedScreenWidth = 500; // for mobile devices
    if (Info['isPath']) { // accessing a directory, make sure which file to show
        if(!fs.existsSync(fs_path)){
            res.status(404).send('Directory Not Found: ' + Info['pathname']);
            return;
        }
        if (!fs.statSync(fs_path).isDirectory()) {
            res.status(404).send('Not a directory: ' + Info['pathname']);
            return;
        }
        var ent = findInFileTree(file_tree, (element) => {
            return element.fs_path === fs_path || element.fs_path+ path.sep === fs_path ;
        });
        var res_path ='';
        var found = false;
        for (const file of default_index) {
            // fill in the information of the requested file
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
            // show table of contents
            fs_path = null;
            posts = ent.children.filter(element => element.isfile && element.filename.endsWith('.md'));
            summaries = {};
            posts.forEach(post => {
                const parsed = matter(fs.readFileSync(post.fs_path, 'utf8'));
                summaries[post.site_path] = marked(parsed.content.trim().slice(0,tag_options.truncationLength) + '...');
            });
            opts.has_md = false;
            opts.gen_toc = true;
            opts.toc_info = {
                'posts': posts,
                'summaries': summaries,
            }
        }
    }
    if(fs_path){
        if (Info['ext'] && Info['ext'] != '.md') {
            // serve static file directly.
            if(!fs.existsSync(fs_path)){
                res.status(404).send('File Not Found: ' + fs_path);
                return;
            }
            res.sendFile(path.resolve(fs_path), function (err) {
                if (err) {
                    console.error('Error serving file:', err);
                    res.status(err.status || 404).send('Error serving file');   
                }
            });
            return;
        } 
        opts.has_md = true;
        try{
            var data = fs.readFileSync(fs_path, 'utf8');
        } catch (err) {
            res.status(404).send('File Not Found: ' + fs_path);
            return;
        }
        // process markdown content
        var Results = matter(data);
        data = Results.content; // get the content of the markdown file
        data = filter_before(data); // execute filter to the file
        var htmlRawContent = marked(data);
        htmlRawContent = filter_after(htmlRawContent); // execute filter to the file
        
        // look up the corresponding entry in file_tree
        var ent = findInFileTree(file_tree, (element) => {
        return element.fs_path === fs_path;
        });
        console.log(ent);
        var { comment_exists, get_comments, get_comments_count } = require("./utils/comments.js");
        if(Info['get_comment']) {
            res.status(200).json(get_comments(Info['comment_post_path'],Info['comment_start'], options.max_comment_limit_per_page));
            return;
        }
        opts.postPath = ent.site_path;
        opts.show_pageupdown_button = Results.data.weight !== undefined;
        opts.pageup = ent.pageup;
        opts.pagedown = ent.pagedown;
        opts.show_header = false;
        opts.show_footer = false;
        opts.show_time = true;
        opts.time = getTime(fs_path);
        opts.tags = Results.data.tags || [];
        opts.tagsurl = path.join(options.site_root, 'tags');
        opts.content = htmlRawContent;
        opts.allow_comments = options.allow_comments;
        opts.show_comments = comment_exists(ent.site_path);
        // opts.comments =  comment_exists(ent.site_path) ? get_comments(ent.site_path) : [];
        opts.comments_count = comment_exists(ent.site_path) ? get_comments_count(ent.site_path) : 0;
        opts.max_comment_limit_per_page = options.max_comment_limit_per_page;
    }
    console.log(opts.show_comments, opts.comments_count,opts.comments);
    ejs.renderFile(options.page_template, opts, function (err, str) {
        if (err) {
            console.error('Error rendering template:', err);
            res.status(500).send('Error rendering template');
            return;
        }
        res.send(str);
        return;
    });
};

router.get('/tags/:tag', (req, res) => {
    const Info = parseRequest(req);
    const tag = req.params.tag;
    
    if( !tags[tag]) {
        res.status(404).send('Tag Not Found: ' + tag);
        return;
    }
    const summaries = {};
    const posts = tags[tag];
    posts.forEach(post => {
        const content = fs.readFileSync(post.fs_path, 'utf8');
        const parsed = matter(content);
        summaries[post.site_path] = marked(parsed.content.trim().slice(0,tag_options.truncationLength) + '...');
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
        if(! Info['partial']){
            renderFullPage(str).then((result) => {
                res.send(result);
            });
        }else{
            res.send(str);
        }
    });
    
});
router.get('/captcha', (req, res) => {
    const captcha =  svgCaptcha.create();
    req.session.captcha = captcha.text;
    res.type('svg');
    res.status(200).send(captcha.data);
});

router.get('/', handler);
router.get('/*pathlist', handler);



router.post('/comments', (req, res) => {
    const userCaptcha = req.body.captcha || undefined;
    if(userCaptcha !== req.session.captcha) {
        res.status(400).send('Captcha error');
        return;
    }
    const postPath = req.body.postPath || undefined;
    const type = req.body.type || 'plain'; // 默认为 plain
    const name = req.body.name || undefined;
    const content = req.body.content || undefined;
    if(!postPath || !content || !name) {
        res.status(400).send('Post path, name and content are required.');
        return;
    }
    console.log(`Received comment for post: ${postPath}, name: ${name}, content: ${content}`);
    if (!postPath || !content) {
        res.status(400).send('Post path and content are required.');
        return;
    }
    if(!ensure_post_exists(postPath)) {
        res.status(404).send('Post not found: ' + postPath);
        return;
    }
    const comment = {
        name: name,
        type: type,
        content: content,
        time: new Date().toISOString(),
    };
    add_comment(comment, postPath);
    res.redirect(postPath);
});
// Home page route
module.exports = router;