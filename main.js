const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const HOST = 'localhost';
const notes = require('./notes.js');
const matter = require('gray-matter');
const { marked } = require('marked');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/notes', notes);

if(process.argv.length > 2){
    if(process.argv[2] == 'convert'){
        console.log('convert mode');
        var filename = process.argv[3];
        if(!filename){
            console.log('no filename');
            process.exit(1);
        }
        const {filter_before, filter_after} = require('./utils/mdFilter.js');
        const fs = require('fs');
        const options = require('./options.js').filter_options;
        // const {open} = import('open');

        options.zhihu = true;
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            // console.log(data);
            var md = filter_before(data,options);
            var html = marked(md);
            html = filter_after(html);
            console.log('writing to file'+filename + '.html');
            fs.writeFile(filename + '.html', html, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('File has been saved!');
                
                import('open').then(({default: open}) => {
                    open(filename + '.html');
                });
            });
        });
        
    }
}else {
    // app.listen()
    var server = app.listen(PORT, HOST, () => {
        console.log(`Server is running at http://${HOST}:${PORT}`);
        console.log(`Notes page is running at http://${HOST}:${PORT}/notes/`);
    });
}