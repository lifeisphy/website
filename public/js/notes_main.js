// Function to toggle visibility of sub-items
function toggleSubItems(id) {
  const subItems = document.getElementById(id);
  if (subItems.style.display === "none" || subItems.style.display === "") {
    subItems.style.display = "block";
  } else {
    subItems.style.display = "none";
  }
}
const sidebar = document.getElementById('sidebar');
const toggleButton = document.getElementById('toggleButton');
const content = document.getElementById('content');
const bgm = document.getElementById('bgm');
const bgmBtn = document.getElementById('bgmPlayButton');
const bgmName = document.getElementById('bgmName');
const bgmChangeBtn = document.getElementById('bgmChangeButton');
const fontSizePlusButton = document.getElementById('fontsize-plus');
const fontSizeMinusButton = document.getElementById('fontsize-minus');
const toolbarButton = document.getElementById('toolbar-button');
const toolbar = document.getElementById('toolbar');
const changePicButton = document.getElementById('bgpicChangeButton');
function toggle() {
  [sidebar, toggleButton, content].forEach(element => {
    element.classList.toggle('collapsed');
  });
}
toggleButton.addEventListener('click', toggle);

let isPlaying = false;
var bgm_idx = 0;
function start_stop_bgm() {
  if (isPlaying) {
    bgm.pause();
    isPlaying = false;
    bgmBtn.textContent = '▶';
  } else {
    bgm.play();
    isPlaying = true;
    bgmBtn.textContent = '⏸';
  }
}
function removeAfterLastDot(str) {
  const idx = str.lastIndexOf('.');
  return idx !== -1 ? str.slice(0, idx) : str;
}
function fontsize_plus() {
  const content = document.getElementById('content');
  const currentSize = parseFloat(window.getComputedStyle(content).fontSize);
  content.style.fontSize = (currentSize + 2) + 'px';
}
function fontsize_minus() {
  const content = document.getElementById('content');
  const currentSize = parseFloat(window.getComputedStyle(content).fontSize);
  content.style.fontSize = (currentSize - 2) + 'px';
}
function roll_bgm() {
  // randomly select a BGM from the list
  const randomIndex = Math.floor(Math.random() * bgmList.length);
  const selectedBgm = bgmList[randomIndex];
  bgm.src = selectedBgm; // Set the BGM source
  bgmName.textContent = removeAfterLastDot(selectedBgm.split('\\').pop()); // Display the name of the selected BGM
  if (isPlaying) {
    bgm.play();
  }
}
document.addEventListener('DOMContentLoaded', () => {
  roll_bgm();

  bgmPlayButton.addEventListener('click', start_stop_bgm);
  bgmChangeBtn.addEventListener('click', roll_bgm);
  document.getElementById('fontsize-plus').addEventListener('click', fontsize_plus);
  document.getElementById('fontsize-minus').addEventListener('click', fontsize_minus);
  document.getElementById('prevBGMButton').addEventListener('click', () => {
    bgm_idx = (bgm_idx - 1 + bgmList.length) % bgmList.length;
    bgm.src = bgmList[bgm_idx];
    bgmName.textContent = removeAfterLastDot(bgmList[bgm_idx].split('\\').pop());
    if (isPlaying) {
      bgm.play();
    }
  });
  document.getElementById('nextBGMButton').addEventListener('click', () => {
    bgm_idx = (bgm_idx + 1) % bgmList.length;
    bgm.src = bgmList[bgm_idx];
    bgmName.textContent = removeAfterLastDot(bgmList[bgm_idx].split('\\').pop());
    if (isPlaying) {
      bgm.play();
    }
  });
});

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
document.addEventListener('DOMContentLoaded', () => {
  // ... 你的其它初始化代码 ...
  changePicButton.addEventListener('click', function() {
  
  const isPortrait = window.innerHeight > window.innerWidth;
  const filteredList = pictureList.filter(pic => {
    if(!pic.width || !pic.height) return true;
    if(isPortrait) return pic.height >= pic.width; // 竖屏时选择高宽比大于1的图片
    else return pic.width >= pic.height; // 横屏时选择高宽比大于1的图片
  }).map(pic => pic.path.replace(/\\/g, '/'));

  const randomIndex = Math.floor(Math.random() * filteredList.length);
  const selectedPicPath = filteredList[randomIndex];
  document.body.style.setProperty('--bg-url', `url('${selectedPicPath}')`);
});
  toolbarButton.addEventListener('click', function(e) {
    e.stopPropagation();
    toolbar.classList.toggle('open');
  });

  // 点击其它区域关闭 toolbar
  document.addEventListener('click', function(e) {
    if (
      toolbar.classList.contains('open') &&
      !toolbar.contains(e.target) &&
      e.target !== toolbarButton
    ) {
      toolbar.classList.remove('open');
    }
  });
});