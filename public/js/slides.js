document.addEventListener('DOMContentLoaded', () => {
var reveal_content = document.getElementsByClassName('reveal')[0];
  document.getElementById('fontsize-plus').addEventListener('click', () => {
    const currentSize = parseFloat(window.getComputedStyle(reveal_content).fontSize);
    reveal_content.style.fontSize = (currentSize + 2) + 'px';
  });
  document.getElementById('fontsize-minus').addEventListener('click', () => {
    const currentSize = parseFloat(window.getComputedStyle(reveal_content).fontSize);
    reveal_content.style.fontSize = (currentSize - 2) + 'px';
  });
  
});