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
  preview.innerHTML = marked.parse(text);
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
window.updateCommentSection = updateCommentSection;
document.addEventListener('DOMContentLoaded', function() {
  updateCommentSection();
});

