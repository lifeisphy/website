const fs = require('fs');
function formatTime(time) {
    const date = new Date(time);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}
function getTime(path){
    stats = fs.statSync(path);
    return {
        alter_time: formatTime(stats.mtime), // modify time
        create_time: formatTime(stats.ctime), // change time
    };

}

module.exports = getTime;