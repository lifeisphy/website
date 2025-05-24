var beginSet = ['$','`'];
var endSet = [ '$' , '`'];
function endLabelof(label){
    return endSet[beginSet.indexOf(label)];
}
function NextMove(beginSet, end, lvl, label){
    if(lvl === 0){
        return [['$'], endLabelof(label)];
    }
    return [beginSet, endLabelof(label)];
}
function get_min_element(begin_idx){
    var min = 10000000;
    var label = undefined;
    for(var i = 0; i < begin_idx.length; i++){
        if(begin_idx[i] !== -1 && (begin_idx[i] < min)){
            min = begin_idx[i];
            label = beginSet[i];
        }
    }
    if(min === 10000000){ 
        return [-1, undefined];
    }else {
        return [min, label];
    }
}
function genTree(str ,beginSet, end, lvl){
    const tree =[];
    let pos = 0;
    console.log(`str: ${str}, strSLC:${str.slice(pos)}, beginSet: ${beginSet}, end: ${end} `);
    while(pos < str.length){
        console.log(`pos: ${pos} lvl:${lvl} ${str.slice(pos)}`);
        // get minimum index of beginSet
        const begin_idx = beginSet.map(element => str.indexOf(element, pos));
        console.log(`begin_idx: ${begin_idx}`);
        const [begin_idx_min, label] = get_min_element(begin_idx); // using nearest label.
        const endIdx = str.indexOf(end, pos);
        console.log(`begin_idx_min: ${begin_idx_min}, label: ${label},end: ${end}, endIdx: ${endIdx}`);
        if(endIdx === -1 && begin_idx_min === -1){
            console.error('no end tag');
            process.exit(1);
        }
        var err = (begin_idx_min === -1 && endIdx === -1);

        var isBegin = (endIdx === -1 || (begin_idx_min !== -1 && begin_idx_min < endIdx));
        var isEnd = (endIdx !== -1);
        if(err){
            console.error('no end tag');
            process.exit(1);
        }
        if(isBegin){ // go to next level
            if(begin_idx_min > pos){
                tree.push(str.slice(pos, begin_idx_min));
            }
            var [beginSetNext, endNext] = NextMove(beginSet, end, lvl, label);
            // tree.push(str.slice(pos, begin_idx_min));
            var [ret, ends] = genTree(str.slice(begin_idx_min + label.length), beginSetNext, endNext, lvl+1);
            tree.push(ret);
            console.log(`ret: ${ret}, ends: ${ends}`);
            var endLabel = endLabelof(label); // corresponding end label to label
            pos = begin_idx_min + label.length + ends + endLabel.length;
        }else {
            if(endIdx > pos){
                tree.push(str.slice(pos, endIdx));
            }
            console.log(`str: ${str}strSLC: ${str.slice(pos, endIdx)},endIdx: ${endIdx}`);
            // tree.push(str.slice(pos, endIdx));
            console.log('\n\n\n');
            return [tree, endIdx];
        }
        // else{
        //     tree.push(str.slice)
        // }
        console.log();
    }
    // console.error('no end tag');
    // process.exit(1);
    return tree;
}

console.log(genTree('$a`b`$`c`', beginSet, undefined,0));