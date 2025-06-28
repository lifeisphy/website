const {filter_before, filter_after} = require('./mdFilter.js');
const fs = require('fs');
const matter = require('gray-matter');
const {marked} = require('marked');
const options = require('../options.js').filter_options;
// const open = require('open'); // 先注释掉

function file_convert(filename) {
    options.zhihu = true;
    if (!fs.existsSync(filename)){
        console.error('File does not exist:', filename);
        return;
    }
    data = fs.readFileSync(filename, 'utf8'); // 先同步读取一次，确保文件存在
    var md = filter_before(data,options);
    var html = marked(md);
    html = filter_after(html);
    fs.writeFileSync(filename + '.html', html, 'utf8'); // 同步写入文件
    console.log('file saved to ' + filename + '.html');
}
module.exports = { file_convert };