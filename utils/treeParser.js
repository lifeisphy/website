
function get_min_element(beginSet,begin_indices){
    var min = 10000000;
    var label = undefined;
    for(var i = 0; i < begin_indices.length; i++){
        if(begin_indices[i] !== -1 && (begin_indices[i] < min)){
            min = begin_indices[i];
            label = beginSet[i];
        }
    }
    if(min === 10000000){ 
        return [-1, undefined];
    }else {
        return [min, label];
    }
}
function genTree(str ,beginSet, end, lvl,NextMove){
    const tree =[];
    let pos = 0;
    console.log(`str: ${str}, strSLC:${str.slice(pos)}, beginSet: ${beginSet}, end: ${end} `);
    while(pos < str.length){
        console.log(`pos: ${pos} lvl:${lvl} ${str.slice(pos)}`);
        // get minimum index of beginSet. If the same, then use the longest match.
        res = []
        for(var i = 0; i < beginSet.length; i++){
            if(beginSet[i] instanceof RegExp){
                var match = str.slice(pos).match(beginSet[i]);
                if(match){
                    idx = match.index + pos;
                    // match[0] is the matched string, match.index is the index of the match in str.slice(pos)
                    res.push([i,match[0], idx, idx + match[0].length]);
                }else{
                    res.push([i,undefined, -1, -1]);
                }
            }else if(typeof beginSet[i] === 'string'){
                idx = str.indexOf(beginSet[i], pos);
                if(idx === -1){
                    res.push([i,undefined, -1, -1]);
                } else {
                    res.push([i,beginSet[i], idx, idx + beginSet[i].length]);
                }
            }
        }
        console.log(res);
        // choose the minimum start index(2) and if the same choose the maximum stop index(3).

        var begin_idx = -1;
        var begin_start = 10000000;
        var begin_stop = -1;
        for(var i = 0; i < res.length; i++){
            if(res[i][2] !== -1 && (res[i][2] < begin_start || res[i][2] == begin_start && res[i][3] > begin_stop)){
                begin_idx = i;
                begin_start = res[i][2];
                begin_stop = res[i][3];
            }
        }
        // const begin_indices = beginSet.map(element => str.indexOf(element, pos));
        // console.log(`begin_indices: ${begin_indices}`);
        // const [begin_idx, label] = get_min_element(beginSet,begin_indices); // using nearest label.
        var label = begin_idx === -1 ? undefined : res[begin_idx][1];
        if(end instanceof RegExp){
            var endIdx = str.slice(pos).search(end);
            if(endIdx !== -1){
                endIdx += pos; // adjust the index to the original string
            }
        }else if(typeof end === 'string'){
            endIdx = str.indexOf(end, pos);
        }
        // const endIdx = str.indexOf(end, pos);
        console.log(`begin_idx: ${begin_idx}, label: ${label},end: ${end}, endIdx: ${endIdx}`);
        if(endIdx === -1 && begin_idx === -1){
            console.error('no end tag');
            process.exit(1);
        }
        var err = (begin_idx === -1 && endIdx === -1);

        var isBegin = (endIdx === -1 || (begin_idx !== -1 && begin_idx < endIdx));
        var isEnd = (endIdx !== -1);
        if(err){
            console.error('no end tag');
            process.exit(1);
        }
        if(isBegin){ // go to next level
            if(begin_idx > pos){
                tree.push(str.slice(pos, begin_idx));
            }
            var [beginSetNext, endNext] = NextMove(beginSet, end, lvl, label);
            // tree.push(str.slice(pos, begin_idx));
            var [ret, ends] = genTree(str.slice(begin_idx + label.length), beginSetNext, endNext, lvl+1);
            tree.push(ret);
            console.log(`ret: ${ret}, ends: ${ends}`);
            var endLabel = endLabelof(label); // corresponding end label to label
            pos = begin_idx + label.length + ends + endLabel.length;
        }else {
            if(endIdx > pos){
                tree.push(str.slice(pos, endIdx));
            }
            console.log(`str: ${str}strSLC: ${str.slice(pos, endIdx)},endIdx: ${endIdx}`);
            console.log('\n\n\n');
            return [tree, endIdx];
        }

        console.log();
    }
    return tree;
}
function genTree_entry(str,NextMove){
    var [beginSet, end] = NextMove(undefined,undefined,0,undefined);
    return genTree(str, beginSet, end, 1, NextMove);
}

var beginSet = ['$','`'];
var endSet = [ '$' , '`'];
function endLabelof(label){
    return endSet[beginSet.indexOf(label)];
}
function NextMove(beginSet, end, lvl, label){
    // returns: the next string set that can begin with, and the end label of current level.
    // params: 
    // beginSet: the current character begin set
    // endSet: the current end string
    // lvl: tree depth level
    // label: the begin label that currently meets
    if(lvl === 0 ) {
        return [['$','$$',], undefined];
    }
    if(lvl === 1 ){
        if(label === '$'){
            return [[], '$'];
        }else if(label==='$$'){
            return [[],'$$'];
        }
        // return [[], endLabelof(label)];
    }
    return [beginSet, endLabelof(label)];
}
var fs = require('fs');
str = fs.readFileSync('temp/2.md', 'utf8');
console.log(genTree_entry(str, NextMove));