// [{'isfile':true,'filename':'README.md','path':'/README.md'},{'isfile':false,'directory':'1','path':'/1','children':[...]}]
const fs = require('fs');
const path = require('path');
const options = require("../options.js").options;
const base64 = (str) => {
    return Buffer.from(str).toString('base64');
}
function readFileTree(pathname){
    var subtree = [];
    var files = fs.readdirSync(path.join(options.md_base, pathname));
    files.forEach(file => {
        var file_path = path.join(pathname, file);
        var stat = fs.statSync(path.join(options.md_base, file_path));
        var newEnt = new Object();
        newEnt.path = path.join( options.site_root ,file_path);
        newEnt.id = base64(file_path);
        newEnt.isfile = stat.isDirectory() ? false : true;
        if(stat.isDirectory()){
            newEnt.path += '\\';
            newEnt.directory = file ;
            newEnt.children = readFileTree(file_path);
        }else{
            newEnt.filename = file;
        }
        subtree.push(newEnt);
    });
    return subtree;
}

function printFileTree(tree){
    tree.forEach(element => {
        if(element.isfile){
            console.log(`file: ${element.filename}, path: ${element.path}`);
        }else{
            console.log(`directory: ${element.directory}, path: ${element.path}`);
            printFileTree(element.children);
        }
    });
}
file_tree = readFileTree('/');
// console.log(file_tree,file_tree[0].children);
// printFileTree(file_tree);
module.exports = { readFileTree, printFileTree , file_tree };