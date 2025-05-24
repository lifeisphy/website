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

  toggleButton.addEventListener('click', () => {
    // if(sidebar.classList.contains('collapsed')){
    //   toggleButton.innerHTML = '≡'; // Show the button when collapsed
    //   sidebar.style.width = '250px';
    //   content.style.marginLeft = '250px';
    // }else {
    //   toggleButton.innerHTML = '×'; // Hide the button when expanded
    //   sidebar.style.width = 0;
    //   content.style.marginLeft = 0;
    // }
    [sidebar,toggleButton,content].forEach(element => {
      element.classList.toggle('collapsed');
    });
  })
  document.addEventListener('DOMContentLoaded', () => {
    const bgm = document.getElementById('bgm');
    const bgmBtn = document.getElementById('bgmButton');
    let isPlaying = false;
    bgmBtn.addEventListener('click', () => {
        if(isPlaying) {
          bgm.pause();
          isPlaying = false;
          bgmBtn.textContent = 'start bgm';
        } else {
          bgm.play();
          isPlaying = true;
          bgmBtn.textContent = 'stop bgm';
        }
      });
    });
  // content loading function
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
                    if(data instanceof Blob){
                      const imageUrl = URL.createObjectURL(data);
                      contentDiv.innerHTML = `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto;"/>`;
                    }else{
                      contentDiv.innerHTML = data;
                    }
                    history.pushState(null, '', url);
                })
                .catch(err => console.error('Error loading content:', err));
        }
    });
});