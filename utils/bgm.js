const fs = require('fs');
const path = require('path');
bgmList = fs.readdirSync('public/audios')
    .filter(file => file.endsWith('.mp3') || file.endsWith('.wav'))
    .map(file => path.join('/audios/', file));
module.exports = bgmList;