// sidebar.js

const sidebar = document.getElementById('sidebar');
const toggleButton = document.getElementById('toggleButton');

// Function to toggle visibility of sub-items
function toggleSubItems(id) {
  const subItems = document.getElementById(id);
  if (subItems.style.display === "none" || subItems.style.display === "") {
    subItems.style.display = "block";
  } else {
    subItems.style.display = "none";
  }
}

function toggle() {
  [sidebar, toggleButton, content].forEach(element => {
    element.classList.toggle('collapsed');
  });
}
toggleButton.addEventListener('click', toggle);

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'A' && target.dataset.partial === 'true') {
      event.preventDefault(); // 阻止默认跳转行为
      const url = target.href;

      // 发送异步请求
      fetch(url + '?partial=true')
        .then(response => {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.startsWith('image/')) {
            // If the response is an image
            return response.blob(); // Get the image as a Blob
          } else {
            // Otherwise, assume it's text/HTML
            return response.text();
          }
        })
        .then(data => {
          // 更新 .content 区域
          const contentDiv = document.querySelector('#content');
          if (data instanceof Blob) {
            const imageUrl = URL.createObjectURL(data);
            contentDiv.innerHTML = `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto;"/>`;
          } else {
            contentDiv.innerHTML = data;
          }
          history.pushState(null, '', url);
          if (window.innerWidth < window.SpecifiedScreenWidth && !sidebar.classList.contains('collapsed')) {
            toggle();
          }
          const content_Div = document.getElementById('content');
          if (content_Div) {
            const observer = new MutationObserver(() => {
              // 检查是否有 .comments-section
              if (document.querySelector('.comments-section')) {
                updateCommentSection();
              }
            });
            observer.observe(content_Div, { childList: true, subtree: true });
          }
          // update comments
          
        })
        .catch(err => console.error('Error loading content:', err));
    }
  });
});
window.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth < window.SpecifiedScreenWidth && !sidebar.classList.contains('collapsed')) {
    toggle();
  }
  
});