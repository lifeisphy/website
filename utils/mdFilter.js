// const options = require('../options.js').filter_options;

function match(str,pat){
    var matches = str.split(pat)
    .filter(function(v){ return v.indexOf(pat) > -1})
    .map( function(value) { 
        return value.split(pat)[0]
    })
}
function genTree(str ,begin, end){
    const tree =[];
    let pos = 0;
    while(pos < str.length){
        const startIdx = str.indexOf(begin, pos);
        if(startIdx === -1){
            tree.push(str.slice(pos));
            break;
        }
        if(startIdx > pos){
            tree.push(str.slice(pos, startIdx));
        }
        const endIdx = str.indexOf(end, startIdx);
        if(endIdx === -1){
            tree.push(str.slice(startIdx));
            break;
        }
        const subtreeStr = str.slice(startIdx + begin.length, endIdx);
        tree.push({
            type: 'subtree',
            content: genTree(subtreeStr, begin, end)
        });

        pos = endIdx + end.length;
    }
    return tree;
}
function filter_before(md,options){
// 处理markdown文件, before converting to html
    
    // md = md.replaceAll(/\\fcolorbox\{(.*?)\}\{(.*?)\}\{(.*?)\}/g, function(match, p1, p2, p3) {
    //     return '\\fcolorbox{' + p1 + '}{white}{' + p3 + '}';
    // });
    if(options !== undefined && options.zhihu){
        const {transform_zhihu_type} = require('./zhihu.js');
        md = transform_zhihu_type(md);
    }
    return md;
}
function filter_after(html){
    // 处理html文件, after converting to html
    
    return html;
}
module.exports = { filter_before, filter_after };