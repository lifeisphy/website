const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const notes = require('./notes.js');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/notes', notes);
// app.get('/a/b/c', function(req, res,next){
//     console.log('a/b/c');
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     res.write('<p>a/b/c not found</p>');
//     next();
// }, function(req, res){
//     console.log('a/b/c next');
//     res.write('<p>a/b/c not found</p>');
//     res.end();

// });
// Start the server
var server = app.listen(PORT, () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Server is running at http://localhost:${PORT}/notes/`);
});