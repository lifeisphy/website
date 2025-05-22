const options = require('./options.js').filter_options;

function filter_before(md){
// 处理markdown文件, before converting to html
    
    md = md.replaceAll(/\\fcolorbox\{(.*?)\}\{(.*?)\}\{(.*?)\}/g, function(match, p1, p2, p3) {
        return '\\fcolorbox{' + p1 + '}{white}{' + p3 + '}';
    });
    
    return md;
}
function filter_after(html){
    // 处理html文件, after converting to html
    
    return html;
}
module.exports = { filter_before, filter_after };