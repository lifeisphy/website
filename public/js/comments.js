function addShowMoreLink(contentDiv) {
  if (contentDiv.scrollHeight > contentDiv.clientHeight + 2) {
      // 创建“show more ...”链接
      var showMore = document.createElement('a');
      showMore.className = 'show-more-link button';
      showMore.textContent = 'show more ...';
      showMore.href = 'javascript:void(0)';
      showMore.addEventListener('click', function() {
        if (contentDiv.classList.contains('expanded')) {
          contentDiv.classList.remove('expanded');
          showMore.textContent = 'show more ...';
        } else {
          contentDiv.classList.add('expanded');
          showMore.textContent = 'collapse';
        }
      });
      contentDiv.parentNode.appendChild(showMore);
    }
}
function toLocalTime(isoString) {
  const date = new Date(isoString);
  // 可根据需要自定义格式
  return date.toLocaleString();
}
function renderMarkdownWithMath(text, preview) {
  // 先用 marked 渲染 markdown
  // preview.innerHTML = marked.parse(text);
  text = text.replace(/\$\$[\n]?([^$]+?)[\n]?\$\$/g, function(match, tex) {
      try {
        return '<span class="math-block">' + katex.renderToString(tex, {displayMode: true}) + '</span>';
      } catch (e) {
        return match;
      }
    });
  text = text.replace(/\$([^$\n]+?)\$/g, function(match, tex) {
      try {
        return '<span class="math-inline">' + katex.renderToString(tex, {displayMode: false}) + '</span>';
      } catch (e) {
        return match;
      }
    });
  preview.innerHTML = DOMPurify.sanitize( marked.parse(text));
}

function updateCommentSection() {
  var updated = document.querySelector('.comments-section').getAttribute('data-updated') === 'true';
  if(updated) return; // 防止重复初始化
  document.querySelector('.comments-section').setAttribute('data-updated', 'true');
  document.querySelectorAll('.comment-content').forEach( addShowMoreLink);
  document.querySelectorAll('.markdown-content').forEach(function(div) {
    var raw = decodeURIComponent(div.getAttribute('data-raw') || '');
    renderMarkdownWithMath(raw, div);
    // div.innerHTML = marked.parse(raw);
  });
  document.querySelectorAll('.comment-time[data-iso]').forEach(function(span) {
    const iso = span.getAttribute('data-iso');
    span.textContent = toLocalTime(iso);
  });
  var textarea = document.getElementById('comment-content');
  // var form= textarea.form;
  var preview = document.getElementById('markdown-preview');
  var typeRadios = document.querySelectorAll('input[name="type"]');
  var editor = CodeMirror.fromTextArea(textarea, {
    mode: 'markdown',
    lineNumbers: false,
    lineWrapping: true,
    theme: 'monokai',
    placeholder: 'Your comment'
  });
  textarea.style.display = '';
  textarea.style.visibility = 'hidden';
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  // 替换 updatePreview 函数
  function updatePreview() {
    textarea.value = editor.getValue();
    var type = Array.from(typeRadios).find(r => r.checked)?.value;
    if (type === 'markdown') {
      renderMarkdownWithMath(editor.getValue(), preview);
      preview.style.display = '';
      document.getElementById('form-left').style.flex = '0 0 50%';
      document.getElementById('form-right').style.display = '';
      editor.setOption('mode', 'markdown');
    } else {
      preview.style.display = 'none';
      document.getElementById('form-left').style.flex = '0 0 100%';
      document.getElementById('form-right').style.display = 'none';
      editor.setOption('mode', 'null');
    }
  }
  editor.on('change',updatePreview);
  // textarea.addEventListener('input', updatePreview);
  typeRadios.forEach(radio => radio.addEventListener('change', updatePreview));
}
const renderer = new marked.Renderer();
renderer.image = function(href, title, text) {
  // return '';
  // 如果是本地图片，添加 class
  if (href.startsWith('/')) {
    return `<img src="${href}" class="local-image" alt="${text}" title="${title || ''}">`;
  }
  // 否则正常渲染
  return `<img src="${href}" alt="${text}" title="${title || ''}">`;
}
marked.setOptions({
  gfm: true,
  sanitize: false,
  headerPrefix: ''
})
window.updateCommentSection = updateCommentSection;
document.addEventListener('DOMContentLoaded', function() {
  updateCommentSection();
});


// comment pagination
let commentStart = 0;
let pageSize = 10;

function loadComments(start = 0) {
  console.log('Loading comments from start:', start);
  const postPath = document.querySelector('input[name="postPath"]').value;
  // construct current url + ?get ...

  fetch(`?get_comment=true&comment_start=${start}&postPath=${encodeURIComponent(postPath)}`)
    .then(res => res.json())
    .then(data => {
      console.log('Comments loaded:', data);
      renderComments(data);
      commentStart = start;
      // 更新按钮状态
      document.getElementById('comments-prev').disabled = commentStart <= 0;
      document.getElementById('comments-next').disabled = data.length < pageSize;
    });
}

function renderComments(comments) {
  const list = document.querySelector('.comments-list');
  list.innerHTML = '';
  comments.forEach(comment => {
    const li = document.createElement('li');
    li.className = 'comment';
    li.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${comment.name}</span>
        <span class="comment-time" data-iso="${comment.time}"></span>
      </div>
      ${
        comment.type === 'markdown'
          ? `<div class="comment-content markdown-content" data-raw="${encodeURIComponent(comment.content)}"></div>`
          : `<div class="comment-content plain-content">${comment.content}</div>`
      }
    `;
    list.appendChild(li);
  });
  // 渲染 markdown
  document.querySelectorAll('.markdown-content').forEach(div => {
    const raw = decodeURIComponent(div.getAttribute('data-raw') || '');
    renderMarkdownWithMath(raw,div);
  });
  // 时间本地化
  document.querySelectorAll('.comment-time[data-iso]').forEach(span => {
    const iso = span.getAttribute('data-iso');
    span.textContent = new Date(iso).toLocaleString();
  });
}
document.addEventListener('DOMContentLoaded', function(){
  
  if(document.getElementById('comments-prev')){
    pageSize = parseInt(document.querySelector('.comments-list').dataset.maxPerPage,10);
    document.getElementById('comments-prev').onclick = function() {
      if (commentStart > 0) loadComments(commentStart - pageSize);
    };
    document.getElementById('comments-next').onclick = function() {
      loadComments(commentStart + pageSize);
    };
  }
  
  // 初始化加载第一页
  loadComments(0);
});