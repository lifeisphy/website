const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size')
bgmList = fs.readdirSync('public/audios')
    .filter(file => file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.flac'))
    // .map(file => file.replace('\\','/'))
    .map(file => path.join('/audios/', file));
pictureList = fs.readdirSync('public/pics')
    .filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.webp'))
    // .map(file => file.replace('\\','/'))
    .map(file => {
        var width, height, dimensions;
        const fsPath = path.join('public/pics', file);
        try {
            const buffer = fs.readFileSync(fsPath);
            const dimensions = imageSize(buffer);
            width = dimensions.width;
            height = dimensions.height;
        } catch (e) {
            console.log(e);
            width = undefined;
            height = undefined;
        }
        return {
            path: path.join('/pics/', file),
            width: width,
            height: height
        }
    });

module.exports = { bgmList, pictureList };