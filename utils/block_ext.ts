function BlockExtensionGenerator(_name, _color){
    return {
        name: `${_name}Block`,
        level: 'block',
        start(src){
            var regexp = new RegExp(`^\\$\\\\fcolorbox\\{${_color}\\}\\{\\}\\{${_name}(.*?)\\}\\$\\s*`,"m");
            return src.match(regexp)?.index;
        },
        tokenizer(src, tokens) {
            const startPattern = new RegExp(`^\\$\\\\fcolorbox\\{${_color}\\}\\{\\}\\{${_name}(.*?)\\}\\$\\s*`);
            const endPattern = new RegExp(  `^\\$\\\\fcolorbox\\{${_color}\\}\\{\\}\\{End ${_name}\\}\\$\\s*`,"m");
            
            if (startPattern.test(src)) {
                let match = src.match(startPattern);
                let title = match[1] ? match[1].trim() : '';
                let rest = src.slice(match[0].length);
                let endMatch = rest.match(endPattern);
                if (endMatch) {
                    // 找到结束标记
                    const endIdx = endMatch.index;
                    const content = rest.slice(0, endIdx);
                    const raw = src.slice(0, match[0].length + endIdx + endMatch[0].length);
                    return {
                        type: `${_name}Block`,
                        raw,
                        title: title,
                        text: content.trim(),
                        tokens: this.lexer.blockTokens(content.trim(), [])
                    };
                }
            }
        },
        renderer(token) {
          if(_name.toLowerCase() === 'proof'){
            return `<div class="${_name.toLowerCase()}-block" name="Proof">${this.parser.parse(token.tokens)}</div>`;
          }else{
            return `<div class="${_name.toLowerCase()}-block" name="${token.title}">${this.parser.parse(token.tokens)}</div>`;
          }
        }
    }
}
const theoremBlockExtension = {
  name: 'theoremBlock',
  level: 'block',
  start(src) {
    // 快速定位可能的起始位置
    return src.match(/\$\\fcolorbox\{red\}\{\}\{Definition/)?.index;
  },
  tokenizer(src, tokens) {
    const startPattern = /^\$\\fcolorbox\{red\}\{\}\{Definition(.*?)\}\$\s*/;
    const endPattern = /^\$\\fcolorbox\{red\}\{\}\{End Definition\}\$\s*/m;
    // const startPattern = /^\$\\fcolorbox\{red\}\{\}\{Definition(.*?)\}\$\s*/;
    // const endPattern = /^\$\\fcolorbox\{red\}\{\}\{End Definition\}\$\s*/m;
    // console.log('theoremBlockExtension tokenizer', src);
    if (startPattern.test(src)) {
      let match = src.match(startPattern);
      let content = '';
      let rest = src.slice(match[0].length);
      let endMatch = rest.match(endPattern);
      if (endMatch) {
          // 找到结束标记
          const endIdx = endMatch.index;
          content = rest.slice(0, endIdx);
          const raw = src.slice(0, match[0].length + endIdx + endMatch[0].length);
        //   console.log( match[0], endMatch[0],content);
        return {
          type: 'theoremBlock',
          raw,
          text: content.trim(),
          tokens: this.lexer.blockTokens(content.trim(), [])
        };
      }
    }
  },
  renderer(token) {
    return `<div class="theorem-block">${this.parser.parse(token.tokens)}</div>`;
  }
};

module.exports = {BlockExtensionGenerator,theoremBlockExtension};