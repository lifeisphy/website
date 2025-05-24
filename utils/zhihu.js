
function do_markdown_import(markdown){
  // TODO
  // why use this? The PPT mode cannot work well with built-in @import.
}
function on_will_parse_main(markdown){
  //passage,powerpoint,post,none
  markdown = getYAML(markdown); // load YAML to docjson_global, and hide the YAML information in the final text.
  mode=docjson_global['mode'];
  // markdown = do_md_import(markdown);

  if(mode != "none"){
    markdown = do_css_import(markdown,mode);
    // markdown = katex_macro_replace(markdown);
    if(mode =="zhihu"){
      markdown = transform_zhihu_type(markdown);
    } else {
      markdown = column(markdown);
      markdown = transform_labels(markdown);
      markdown = transform_unclosed_labels(markdown);
      if(mode == "passage"){
        markdown = passage_addHeader(markdown,docjson_global);
      }
      if(mode=="powerpoint"){
        // markdown =transform_zhihu_type(markdown);
        
        markdown = transform_content(markdown,level=4);
        markdown = transform_biaoti(markdown,level=4);//通过把####级数以上的标题渲染时加入<!--slide -->和其内容加入\content，实现对markdown转ppt的自动排版，不用手动加入
        markdown = addHeader(markdown,docjson_global);
        markdown = addFooter(markdown,docjson_global);
        
      }
    }
  }
  return markdown;
};
function passage_addHeader(markdown,docjson_global) {
  if(!docjson_global['header']||docjson_global['header']==false){
    return markdown;
  }
  date = docjson_global['date'];
  author = docjson_global['author'];
  title = docjson_global['title'];
  institute = docjson_global['institute'];

  // var match = markdown.match(/---\r?\n[\w\W]*?\r?\n---\s*/gm);

  // res='';
  // pair = match[0];
  
  // idx= markdown.search(pair);
  // markdown1=markdown.slice(0,idx+pair.length);
  // markdown2=markdown.slice(idx);
  var insert = ''
  if(title){
    insert+= `<div class="title_passage"> ${title}</div>\n`
  }
  if(author){
    insert += `<div class="author">${author}</div>\n`
  }
  if(institute){
    insert += `<div class="institute">${institute}</div>\n`;
  }
  if(date){
    insert += `<div class="date">${date}</div>\n`;
  }
  
  return insert + markdown;

}
function on_did_parse_main(mdhtml){
  //加入脚本/fontsize.js
  mode = docjson_global['mode'];
  if(mode=="powerpoint"){
    var string = "";
    string = fs.readFileSync(__dirname+"/fontsize.js");
    mdhtml+="<script>\n"+string+"\n</script>"; 
  }
  
  return mdhtml; 
}

function in_(query,array) {
  // a wheel.Just ignore it.
  for(var i=0;i<array.length;i++) {
    if(query == array[i]){
      return true;
    }
  }
  return false;
}
MaxRecursionDepth=4;
function transform_labels(markdown,zhihu=false){ 
   /**
   * transform unclosed labels like:
   * \def[definition1]{
   * 123
   * }
   *    |
   *    V
   * <div class="def">123</div>
   * 
   */
  // reg= /\\(.*?)\[(.*?)\]{(([^{}]|(\${1,2}[^\$]+?\${1,2}))+?)}/gm;
  var reg_=/\\(!?)([\w]*?)((\[[^\[\]]*?\])+?){(([^{}]|(\${1,2}[^\$]+?\${1,2}))+?)\n?}/gm; 
  //\xxx[a][b]{content} create an HTML element <div a..b>content</div>
  //\!xxx[a][key=val]{content} create an inline HTML element.

  var style_attributes = ['width','height','font','font-size','font-family','text-align','font-weight','font-style','background-color','color']; // these attributes will be put in "style" like:  "style":"width:100px;height:100px;"

  var default_attributes = ["name"]; // its order is important
  
  replacement_ = function(whole,bang,barname,attrs,lastlabel,content){
    if(zhihu){
      return `${content}\n`;
    }
    
    // labellist=labels.match(/\[[^\[^\]]*?\]/gm);
    attrs = attrs.slice(1,-1);
    labellist = attrs.split("][");
    properties={"other":{},"style":{}};
    cnt = 0;
    
    for(var i = 0;i<labellist.length;i++){
      if(labellist[i].search("=") != -1){ //key=value
        
        key = labellist[i].split("=")[0];
        value = labellist[i].split("=")[1];
        properties['other'][key]=value;
      } else if(labellist[i].search(':') != -1) { // key: value
        key = labellist[i].split(':')[0];
        value = labellist[i].split(':')[1];
        properties['style'][key] = value;
      } else {
        if(labellist[i]){
        properties['other'][default_attributes[cnt]]=labellist[i];// use default attribute
        cnt = ( cnt + 1 ) % default_attributes.length;
        }
      }
    }
    style="";
    nonstyle = "";
    if(bang){
     style+="display:inline;"; 
    }
    // other 部分查表处理，style部分直接进入样式表
    for (key in properties['other']){
      value = properties['other'][key];
      if(in_(key,style_attributes)){
        style+= `${key}:${value};`;
      } else {
        if (value[0] != '"'){
          value = `"${value}"`
        }
        nonstyle += `${key}=${value} `;
      }
    }
    for(key in properties['style']){
      value = properties['style'][key];
      nonstyle += `${key}:${value};`;
    }
    // ret= `<xxx class="${barname}" ${nonstyle} style="${style}">${content}</xxx>`;
    if(bang)
      ret= `<div class="${barname}" ${nonstyle} style="${style}">${content}</div>`;
    else
      ret= `<div class="${barname}" ${nonstyle} style="${style}">\n${content}</div>\n`;
    return ret;
  }
  for(var i=0;i<MaxRecursionDepth;i++){
    markdown = markdown.replace(reg_,replacement_);
  }
// -------------------------------------
  return markdown;
};

function transform_unclosed_labels(markdown,restricted_types=null){
  /**
   * transform unclosed labels like:
   * \img["1.png"] ---> <img src="1.png">
   * 
   * some other useage like:
   * \abc[key1="value1"][key2="value2"] ---> <abc key1="value1" key2="value2">
   * 
   * use style_attributes to determine which attribute should be put in the key:style
   * example: 
   * style_attributes = ["width"]
   * \abc[width=100px][class="123"] ---> <abc class="123" style="width:100px">
   * 
   * used default attributes to specify the properties without keys.
   * default_attributes = ["src", "width"]
   * \img["1.png"]["300px"] ---> <img src="1.png" width="300px">
   */
  if(restricted_types != null){
    restricted= true;
  }else{
    restricted = false;    
  }
  reg_=/\\(!?)([\w]*?)((\[[\w :\/%=".-]*?\])+)/gm; 
  //\xxx[a][b]{content} create an HTML element <xxx a..b>content</xxx>
  style_attributes = ['width','height','float','z-index'];
  default_attributes = ["src"]; // its order is important
  replacement_ = function(whole,bang,barname,attrs,lastlabel){
    // f = new FileWriter("D:/PKU/notes/QCQI/1.txt");
    // f.append(`label:${labellist[i]},result:${labellist[i].search("=")}
    // f.append(`restrict:${restricted},types:${restricted_types}\n`)
    if((restricted && !in_(barname,restricted_types))){
      //被限制，直接返回
      return whole;
    }


    attrs = attrs.slice(1,-1);
    labellist = attrs.split("][");
    properties={"other":{},"style":{}};
    cnt = 0;
    
    for(var i = 0;i<labellist.length;i++){
      if(labellist[i][0]=='"' && labellist[i][labellist[i].length-1]=='"'){ //双引号包围

        properties['other'][default_attributes[cnt]]=labellist[i];// use default attribute
        cnt = ( cnt + 1 ) % default_attributes.length;

      } else if(labellist[i].search("=") != -1){ //key=value
      // if(labellist[i].search("=") != -1){ //key=value
        
        key = labellist[i].split("=")[0];
        value = labellist[i].split("=")[1];
        properties['other'][key]=value;
      } else if(labellist[i].search(':') != -1) { // key: value
        key = labellist[i].split(':')[0];
        value = labellist[i].split(':')[1];
        properties['style'][key] = value;
      } else {
        if(labellist[i]){
        properties['other'][default_attributes[cnt]]=labellist[i];// use default attribute
        cnt = ( cnt + 1 ) % default_attributes.length;
        }
      }
    }
    style="";
    nonstyle = "";
    if(bang){
     style+="display:inline;"; 
    }
    // other 部分查表处理，style部分直接进入样式表
    for (key in properties['other']){
      value = properties['other'][key];
      if(in_(key,style_attributes)){
        style+= `${key}:${value};`;
      } else {
        nonstyle += `${key}=${value} `;
      }
    }
    for(key in properties['style']){
      value = properties['style'][key];
      style += `${key}:${value};`;
    }



    // attrs = attrs.slice(1,-1);
    // labellist = attrs.split("][");
    // properties={};
    // cnt = 0;
    
    // for(var i = 0;i<labellist.length;i++){
      
    //   if(labellist[i].search("=") != -1){ //key=value
    //     key = labellist[i].split("=")[0];
    //     value = labellist[i].split("=")[1];
    //     properties[key]=value;
    //   } else {
    //     properties[default_attributes[cnt]]=labellist[i];// use default attribute
    //     cnt = ( cnt + 1 ) % default_attributes.length;
    //   }
    // }
    // style="";
    // nonstyle = "";
    // if(bang){
    //   style+="display:inline;";
    // }
    // for (key in properties){
    //   value = properties[key];
    //   if(in_(key,style_attributes)){
    //     style+= `${key}:${value};`;
    //   } else {
    //     nonstyle += `${key}=${value} `;
    //   }
    // }
    ret= `<${barname} ${nonstyle} style="${style}">\n`;
    return ret;
  }
  markdown = markdown.replace(reg_,replacement_);
  return markdown;
}
function column(markdown,zhihu=false){ 
  // add columns using special grammar
  /**
   * can divide the content by two or three rows. 
   * format:
   * twocolumn:
   * left:
   * [your content here...]
   * right:
   * [your content here...]
   * end.
   * 
   * or:
   * 
   * threecolumn:
   * left:
   * [your content here...]
   * middle:
   * [your content here...]
   * right:
   * [your content here...]
   * end.
   */
  reg=/twocolumn:\s*left:([\w\W]*?)right:([\w\W]*?)end\./gm;
  replacement = '<div class="column"><div class="item">\n$1\n</div><div class="item">\n$2\n</div></div>'
  reg2=/threecolumn:\s*left:([\w\W]*?)middle:([\w\W]*?)right:([\w\W]*?)end\./gm;
  replacement2 = '<div class="column3"><div class="item">$1</div><div class=item">$2</div><div class="item">$3</div></div>'
  replacement_ = "$1\n$2\n"  // delete this information.
  replacement2_ = "$1\n$2\n$3\n" 
  if(zhihu){
    for(var i=0;i<MaxRecursionDepth;i++){
      markdown = markdown.replace(reg,replacement_);
      markdown = markdown.replace(reg2,replacement2_);
    }
  } else{
    for(var i=0;i<MaxRecursionDepth;i++){
      markdown = markdown.replace(reg,replacement);
      markdown = markdown.replace(reg2,replacement2);
    }
  }
  
  return markdown;
}
function transform_header(markdown,replacement){
  // params: whole,sharps,content
  var re = /^(#+)\ (.*?)$/gm;
  markdown = markdown.replace(re,replacement);
  return markdown;
}
function transform_inline(markdown,replacement){
  //行内公式
  //params: whole,tex
  var reg_inline = /\$\$\s*([\w\W]*?)\s*\$\$/gm;
  markdown = markdown.replace(reg_inline,replacement);
  return markdown;
}
function transform_display(markdown,replacement){
  //行间公式
  //params: whole,tex
  var reg_display = /\$\s*([\w\W]*?)\s*\$/gm;
  markdown = markdown.replace(reg_display,replacement);
  return markdown;
}
function transform_zhihu_type(markdown) {
   var replacement_inline = function(whole,tex){
    tex=tex.replace(/\r\n/gm,' '); //去掉所有空行
    return '\n<p><img src="https://www.zhihu.com/equation?tex='+encodeURIComponent(tex)+'" alt="[公式]" eeimg="1" loading="lazy" data-formula="'+tex+'"></p>\n';
  };
  markdown = transform_inline(markdown,replacement_inline);
  //行间公式
  var replacement_display = function(whole,tex){
    return '<img src="https://www.zhihu.com/equation?tex='+encodeURIComponent(tex)+'" alt="[公式]" eeimg="1" loading="lazy" data-formula="'+tex+'">';
  };
  markdown = transform_display(markdown,replacement_display);
  return markdown;
};

function getYAML(markdown){

// 文章开头的yaml使用指南：
// ---
// mode: [powerpoint|passage|zhihu]
// header : true // useful only in powerpoint mode
// footer : true // userful only in powerpoint mode
// date : "22-08-17" 
// author : "eihei"
// title : "slide-test"
// ---

  let re = /-{3}\s*([\w\W]*?)\s*-{3}/sg;
  let s = re.exec(markdown);
  if(!s){
    docjson_global={};
  } else {
    s=s[1].split("\n");
    json={};
    for(var i=0;i<s.length;i++){
      reg=/^\s*(.*?)\s*:\s*"?(.*?)"?\s*$/gm;
      ret=reg.exec(s[i]);
      console.log(ret);
      key=ret[1];
      val=ret[2];
      json[key]=val;
    }
    docjson_global=json;
  }
  default_mode="passage";
  if(!docjson_global['mode']){
    docjson_global['mode']=default_mode;
  }
  markdown = markdown.replace(re,"");
  // function replacement(whole,content){
  //   return `<!-- ${whole} -->`
  // }
  // markdown = markdown.replace(re,replacement);
  return markdown;
};
function addHeader(markdown,docjson_global){
  /**
   * In PPT mode, add a new page befor the first page ,
   * for presenting author,title and date.
   */
  var json_ = docjson_global;
  if(!json_['header']||json_['header']=='false'){
    return markdown;
  }
  date = json_['date'];
  author = json_['author'];
  title = json_['title'];
  var match = markdown.match(/<!-- slide .*?-->\s*/gm);

  res='';
  pair = match[0]; // before the first page
  
  idx= markdown.search(pair);
  markdown1=markdown.slice(0,idx+pair.length);
  markdown2=markdown.slice(idx);
  return markdown1+"<!--slide -->\n"+'<div class="title middle-screen">'+'<div class="title">'+json_['title']+'</div>\n<div class="author">'+json_['author']+'</div>\n<div class="date">'+json_['date']+"</div>\n</div>\n\n" +markdown2;
  // title class: middle-screen 
  // title: class=title 
  // author: class=author 
  //date: class=date
}

function addFooter(markdown,docjson_global){ 
  /**
   * In PPT mode, add footer for each document page,
   * for presenting author,title and date, and page.
   */
  var json_ = docjson_global;
  
  if(!json_['footer'] || json_['footer']=='false'){
    return markdown;
    //undefined 或false，不加入页脚
  }
  date=json_['date'];
  author=json_['author'];
  title=json_['title'];
  console.log(date,author,title);
  var match = markdown.match(/<!-- slide .*?-->\s/gm);
  var total_page=match.length;
  var res='';
  var cnt=1;
  while(match != null){
    pair = match[0];
    idx= markdown.search(pair);
    end = idx+ pair.length;
    res += markdown.slice(0,end);
    res += '<div class="footer column4"><div class="item">'+author+'</div><div class="item" style="text-align:center">'+title+'</div><div class="item" style="text-align:center">'+date+'</div><div class="item" style="text-align:right">'+String(cnt)+'/'+total_page+'</div></div>\n\n';
    markdown = markdown.slice(end);
    console.log(markdown);
    match = markdown.match(/<!-- slide .*?-->\s/gm);
    cnt+=1;
  }
  res+=markdown;
  return res;
};
module.exports = {transform_zhihu_type}