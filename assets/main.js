async function fetchJSON(path){
  try{
    const r = await fetch(path);
    if(!r.ok) return [];
    return await r.json();
  }catch(e){
    console.error(e);
    return [];
  }
}

async function renderNews(containerId, limit = null) {
  const data = await fetchJSON('content/news.json');
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';

  if (data.length === 0) {
    c.innerHTML = '<p>No news yet.</p>';
    return;
  }

  let items = data.slice().reverse();
  if (limit) items = items.slice(0, limit);

  items.forEach(item => {
    const d = document.createElement('div');
    d.className = 'card';

    // Title
    const h3 = document.createElement('h3');
    h3.textContent = item.title;
    d.appendChild(h3);

    // Quill text (HTML)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'formatted';
    contentDiv.innerHTML = item.text || '';
    d.appendChild(contentDiv);

    // Media
    if (item.media) {
      if (item.media.includes("youtube.com/watch?v=")) {
        const id = new URL(item.media).searchParams.get("v");
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${id}`;
        iframe.width = "100%";
        iframe.height = "315";
        iframe.frameBorder = "0";
        iframe.allowFullscreen = true;
        const wrapper = document.createElement('div');
        wrapper.className = 'video';
        wrapper.appendChild(iframe);
        d.appendChild(wrapper);
      } else if (item.media.includes("youtu.be/")) {
        const id = item.media.split("/").pop();
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${id}`;
        iframe.width = "100%";
        iframe.height = "315";
        iframe.frameBorder = "0";
        iframe.allowFullscreen = true;
        const wrapper = document.createElement('div');
        wrapper.className = 'video';
        wrapper.appendChild(iframe);
        d.appendChild(wrapper);
      } else if(item.media.includes('facebook.com/')) {
        const encoded = encodeURIComponent(item.media);
        const fbWrapper = document.createElement('div');
        fbWrapper.className = 'video';
        fbWrapper.innerHTML = `
          <iframe src="https://www.facebook.com/plugins/video.php?href=${encoded}"
            width="560" height="315"
            style="border:none;overflow:hidden"
            scrolling="no" frameborder="0"
            allowfullscreen="true"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
          </iframe>`;
        d.appendChild(fbWrapper);
      } else {
        const img = document.createElement('img');
        img.src = item.media;
        img.alt = item.title || '';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        d.appendChild(img);
      }
    }

    c.appendChild(d);
  });
}

async function renderArticles(containerId, limit = null) {
  const data = await fetchJSON('content/articles.json');
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';

  if (data.length === 0) {
    c.innerHTML = '<p>No articles yet.</p>';
    return;
  }

  let items = data.slice().reverse();
  if (limit) items = items.slice(0, limit);

  items.forEach(item => {
    const d = document.createElement('div');
    d.className = 'card';

    // Title
    const h3 = document.createElement('h3');
    h3.textContent = item.title;
    d.appendChild(h3);

    // Quill text
    const contentDiv = document.createElement('div');
    contentDiv.className = 'formatted';
    contentDiv.innerHTML = item.text || '';
    d.appendChild(contentDiv);

    // Media
    let mediaHtml = '';
    if (item.media) {
      if (item.media.includes("youtube.com/watch?v=")) {
        const id = new URL(item.media).searchParams.get("v");
        mediaHtml = `<div class="video"><iframe width="100%" height="315"
          src="https://www.youtube.com/embed/${id}"
          frameborder="0" allowfullscreen></iframe></div>`;
      } else if (item.media.includes("youtu.be/")) {
        const id = item.media.split("/").pop();
        mediaHtml = `<div class="video"><iframe width="100%" height="315"
          src="https://www.youtube.com/embed/${id}"
          frameborder="0" allowfullscreen></iframe></div>`;
      } else if(item.media.includes('facebook.com/')) {
        const encoded = encodeURIComponent(item.media);
        mediaHtml = `<div class="video">
          <iframe src="https://www.facebook.com/plugins/video.php?href=${encoded}"
            width="560" height="315"
            style="border:none;overflow:hidden"
            scrolling="no" frameborder="0"
            allowfullscreen="true"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
          </iframe>
        </div>`;
      } else {
        mediaHtml = `<img src="${item.media}" alt="${item.title||''}" style="max-width:100%; height:auto;">`;
      }
    }

    if (mediaHtml) {
      const mediaWrapper = document.createElement('div');
      mediaWrapper.innerHTML = mediaHtml;
      d.appendChild(mediaWrapper);
    }
    c.appendChild(d);
  });
}

async function renderGallery(containerId){
  const data = await fetchJSON('content/gallery.json');
  const c = document.getElementById(containerId);
  if(!c) return;
  c.innerHTML='';
  if(data.length===0){
    c.innerHTML='<p>No gallery items yet.</p>';
    return;
  }
  data.slice().reverse().forEach(item=>{
    const d=document.createElement('div');
    d.className='card';
    let mediaHtml='';
    if(item.media){
      if(item.media.includes('youtube.com/watch?v=')){
        const id = new URL(item.media).searchParams.get("v");
        mediaHtml = `<div class="video"><iframe width="560" height="315"
          src="https://www.youtube.com/embed/${id}"
          frameborder="0" allowfullscreen></iframe></div>`;
      } else if(item.media.includes('youtu.be/')){
        const id = item.media.split('/').pop();
        mediaHtml = `<div class="video"><iframe width="560" height="315"
          src="https://www.youtube.com/embed/${id}"
          frameborder="0" allowfullscreen></iframe></div>`;
      } else if(item.media.includes('facebook.com/')) {
        const encoded = encodeURIComponent(item.media);
        mediaHtml = `<div class="video">
          <iframe src="https://www.facebook.com/plugins/video.php?href=${encoded}"
            width="560" height="315"
            style="border:none;overflow:hidden"
            scrolling="no" frameborder="0"
            allowfullscreen="true"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
          </iframe>
        </div>`;
      } else {
        mediaHtml = `<img src="${item.media}" alt="${item.caption||''}" style="max-width:100%; height:auto;">`;
      }
    }

    // Quill caption
    d.innerHTML = `${mediaHtml}<div class="formatted">${item.caption||''}</div>`;
    c.appendChild(d);
  });
}

async function renderResources(containerId){
  const data = await fetchJSON('content/resources.json');
  const c = document.getElementById(containerId);
  if(!c) return;
  c.innerHTML='';
  if(data.length===0){
    c.innerHTML='<p>No resources yet.</p>';
    return;
  }
  data.slice().reverse().forEach(item=>{
    const d=document.createElement('div');
    d.className='card';
    d.innerHTML=`<h3><a href="${item.link}" target="_blank">${item.title}</a></h3>`;
    c.appendChild(d);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderNews('news-preview', 1);   // only 1 item for preview
  renderNews('news-container');    // all items on full news page
  renderGallery('gallery-container');
  renderResources('resources-container');
  renderArticles('articles-container');
});
