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
  // hello
  // reverse so newest is first
  let items = data.slice().reverse();
  if (limit) {
    items = items.slice(0, limit);
  }

  items.forEach(item => {
    const d = document.createElement('div');
    d.className = 'card';
    d.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.text}</p>
      ${item.media ? `<p><a href="${item.media}" target="_blank">Media</a></p>` : ''}
    `;
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
      } else {
        mediaHtml = `<img src="${item.media}" alt="${item.caption||''}" style="max-width:100%; height:auto;">`;
      }
    }
    d.innerHTML=`${mediaHtml}<p>${item.caption||''}</p>`;
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
});
