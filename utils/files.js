// [{'isfile':true,'filename':'README.md','path':'/README.md'},{'isfile':false,'directory':'1','path':'/1','children':[...]}]
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { type } = require('os');
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
        newEnt.fs_path = path.join(options.md_base, file_path);
        newEnt.site_path = path.join( options.site_root ,file_path);
        newEnt.id = base64(file_path);
        newEnt.isfile = stat.isDirectory() ? false : true;
        if(stat.isDirectory()){
            // newEnt.site_path += path.sep;
            newEnt.directory = file ;
            newEnt.children = readFileTree(file_path);
        }else{
            newEnt.filename = file;
            const data = fs.readFileSync(path.join(options.md_base, file_path), 'utf8');
            newEnt.frontmatter = matter(data).data;
            // const frontmatter = matter(data);
        }
        subtree.push(newEnt);
    });
    return subtree;
}
function setPageUpDownInfo(file_tree){
    var curr_files = file_tree.filter(element => element.isfile);
    file_tree.forEach(element => {
        if(element.isfile && element.frontmatter && element.frontmatter.weight){
            for(var i = 0; i < curr_files.length; i++){
                if(curr_files[i].frontmatter && curr_files[i].frontmatter.weight == element.frontmatter.weight - 1){
                    element.pageup = curr_files[i];
                }
                if(curr_files[i].frontmatter && curr_files[i].frontmatter.weight == element.frontmatter.weight + 1){
                    element.pagedown = curr_files[i];
                }
            }
        }else if(!element.isfile){
            setPageUpDownInfo(element.children);
        }
    });
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
function findInFileTree(file_tree, f) {
    for (const element of file_tree) {
        if (f(element)) {
            return element;
        }
        if (!element.isfile && element.children) {
            const found = findInFileTree(element.children, f);
            if (found) return found;
        }
    }
    return null;
}
function summaryTags(fileTree){
    var tags = {};
    fileTree.forEach(element => {
        if(element.isfile){
            if(element.frontmatter && element.frontmatter.tags){
                // Check if tags is an array or a string
                let mdtags = element.frontmatter.tags;
                if(mdtags instanceof Array){
                    mdtags.forEach(tag => {
                        if(!tags[tag]){ // if tag does not exist, create it
                            tags[tag] = [];
                        }
                        tags[tag].push(element);// Add the file path to the tag
                    });
                }else if(typeof mdtags === 'string'){
                    if(!tags[mdtags]){ // if tag does not exist, create it
                        tags[mdtags] = [];
                    }
                    tags[mdtags].push(element);// Add the file path to the tag
                }
                // console.log(tags);
            }
        } else {
            if(element.children){
                var childTags = summaryTags(element.children);
                for(var tag in childTags){
                    if(!tags[tag]){
                        tags[tag] = [];
                    }
                    tags[tag] = tags[tag].concat(childTags[tag]);
                }
            }
        }
    });
    return tags;
}
function summaryTags_entry(file_tree){
    var tags = summaryTags(file_tree);
    console.log('Tags Summary:');
    for(var tag in tags){
        console.log(`${tag}: ${tags[tag].length} files`);
        console.log(tags[tag]);
    }
    return tags;
}
file_tree = readFileTree('/');
setPageUpDownInfo(file_tree);
tags = summaryTags_entry(file_tree);
module.exports = { readFileTree, printFileTree , file_tree, tags, findInFileTree };