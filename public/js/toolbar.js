
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
  const currentSize = parseFloat(window.getComputedStyle(content).fontSize);
  content.style.fontSize = (currentSize + 2) + 'px';
}
function fontsize_minus() {
  const currentSize = parseFloat(window.getComputedStyle(content).fontSize);
  content.style.fontSize = (currentSize - 2) + 'px';
}
function roll_bgm() {
  // randomly select a BGM from the list
  if(bgmList.length === 0) {
    console.warn('BGM list is empty. Please check your configuration.');
    return;
  }
  const randomIndex = Math.floor(Math.random() * bgmList.length);
  bgm_idx = randomIndex;
  const selectedBgm = bgmList[bgm_idx];
  bgm.src = selectedBgm; // Set the BGM source
  bgmName.textContent = removeAfterLastDot(selectedBgm.split('\\').pop()); // Display the name of the selected BGM
  if (isPlaying) {
    bgm.play();
  }
}
document.addEventListener('DOMContentLoaded', () => {
  roll_bgm();
  roll_picture();
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
  document.getElementById('switch-mode-button').textContent = 
    window.location.search.includes('slides=true') ? 'Switch to normal mode' : 'Switch to slide mode';
  document.getElementById('switch-mode-button').addEventListener('click', () => {
    const url = new URL(window.location.href);
    if(url.searchParams.get('slides') === 'true') {
      window.location.href= url.pathname; // Switch to normal mode
    }else{
      window.location.href= url.pathname + '?slides=true';
    }
  });
});



function roll_picture() {
  if(!pictureList || pictureList.length === 0) {
    console.warn('Picture list is empty. Please check your configuration.');
    return;
  }
  const isPortrait = window.innerHeight > window.innerWidth;
  const filteredList = pictureList.filter(pic => {
    if(!pic.width || !pic.height) return true;
    if(isPortrait) return pic.height >= pic.width; // 竖屏时选择高宽比大于1的图片
    else return pic.width >= pic.height; // 横屏时选择高宽比大于1的图片
  }).map(pic => pic.path.replace(/\\/g, '/'));

  const randomIndex = Math.floor(Math.random() * filteredList.length);
  const selectedPicPath = filteredList[randomIndex];
  document.body.style.setProperty('--bg-url', `url('${selectedPicPath}')`);
  // remove the background color
  document.body.style.backgroundColor = 'transparent';
}
document.addEventListener('DOMContentLoaded', () => {
  changePicButton.addEventListener('click', roll_picture);
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
document.querySelectorAll('.toolbar-color-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    // remove background picture
    document.body.style.setProperty('--bg-url', 'none');
    document.body.style.background = this.getAttribute('data-bg');
  });
});