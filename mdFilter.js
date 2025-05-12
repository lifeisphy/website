const options = require('./options.js').filter_options;

function filter(md){
// 处理markdown文件
    md = md.replaceAll(/\\fcolorbox\{(.*?)\}\{(.*?)\}\{(.*?)\}/g, function(match, p1, p2, p3) {
        return '\\fcolorbox{' + p1 + '}{white}{' + p3 + '}';
    });
    
    return md;
}

module.exports = filter;