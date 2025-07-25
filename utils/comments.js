const fs = require('fs');
const path = require('path');
const options = require('../options.js').options;
function get_comment_path(postPath) {
    return path.join(options.comments_dir, postPath + '.jsonl');
}
function comment_exists(postPath) {
    const fs_path = get_comment_path(postPath);
    console.log('comment_exists', fs_path);
    return fs.existsSync(fs_path);
}
function ensure_post_exists(postPath){
    const fs_path = path.join(options.md_base, postPath );
    return fs.existsSync(fs_path);
}
function get_comments_count(postPath) {
    const fs_path = get_comment_path(postPath);
    if (!fs.existsSync(fs_path)) {
        return 0; // No comments file exists, return count as 0
    }
    const lines = fs.readFileSync(fs_path, 'utf8').split('\n');
    const nonEmptyLines = lines.filter(line => line.trim() !== ''); // Filter out empty lines
    console.log('get_comments_count', fs_path, nonEmptyLines.length);
    return nonEmptyLines.length; // Return the count of non-empty lines
}


function get_comments(postPath, start=0, limit=options.max_comment_limit_per_page) {
    ret = [];
    var fs_path = get_comment_path(postPath);
    if(!fs.existsSync(fs_path)) {
        fs.writeFileSync(fs_path, '', 'utf8'); // Create an empty file if it doesn't exist
    }
    console.log('get_comments', fs_path, start, limit);
    lines= fs.readFileSync(fs_path, 'utf8').split('\n');
    lines = lines.filter(line => line.trim() !== ''); // Filter out empty lines
    console.log('Filtered lines', lines);
    ret = lines.slice(start, start + limit).map(line => {
        try {
            return JSON.parse(line);
        } catch (e) {
            console.error('Error parsing comment:', e);
            return null; // Return null for invalid JSON lines
        }
    }).filter(comment => comment !== null); // Filter out null values
    console.log(ret);
    return ret;
}

function add_comment(comment,postPath){
    var fs_path = get_comment_path(postPath);
    if(!fs.existsSync(fs_path)) {
        // Ensure the file exists
        fs.mkdirSync(path.dirname(fs_path), { recursive: true });
    }
    fs.appendFileSync(fs_path, JSON.stringify(comment) + '\n', 'utf8');
    return;
}

module.exports = { add_comment, get_comments, comment_exists, ensure_post_exists, get_comments_count };