const express = require('express');
const path = require('path');
const app = express();
var { HOST,PORT } = require('./data.js');
const notes = require('./notes.js');

const { file_convert } = require('./utils/converter.js');
app.use(express.static(path.join(__dirname, 'public')));
app.use(options.site_root, notes);

// parse from command line arguments
process.argv.forEach((arg, idx, arr) => {
    if (arg === '--port' && arr[idx + 1]) {
        PORT = parseInt(arr[idx + 1], 10);
    }
    if (arg === '--host' && arr[idx + 1]) {
        HOST = arr[idx + 1];
    }
    if (arg == '--convert' && arr[idx + 1]) {
        console.log('convert mode');
        var filename = arr[idx + 1];
        file_convert(filename);
        process.exit(0);
    }
});
var server = app.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
    console.log(`Notes page is running at http://${HOST}:${PORT}`+options.site_root);
});
