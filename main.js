const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const notes = require('./notes.js');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/notes', notes);

// Start the server
var server = app.listen(PORT, () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log(`Server is running at http://localhost:${PORT}`);
});