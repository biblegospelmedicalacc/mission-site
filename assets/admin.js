/*
Admin JS - posts form data to a secure server endpoint (Cloudflare Worker)
Expectations:
 - The admin HTML must be opened with ?key=SECRET_KEY parameter (the worker will verify)
 - The ADMIN_API_URL must point to your deployed Worker (set below in README or in this file before upload)
*/

// SET THIS to your Worker endpoint that will handle commits, for example:
// const ADMIN_API_URL = "https://your-worker-subdomain.workers.dev/commit";
// You can also leave it as relative '/.netlify/functions/commit' if you deploy differently.
const ADMIN_API_URL = window.ADMIN_API_URL || '';

function qs(name){const u=new URL(window.location);return u.searchParams.get(name);}

function show(str){document.getElementById('notice').innerText = str}

async function postToWorker(payload){
  if(!ADMIN_API_URL){alert('Admin backend not configured. See README.');return {ok:false,message:'no_api'}}
  try{
    const res = await fetch(ADMIN_API_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    return await res.json();
  }catch(e){
    console.error(e);
    return {ok:false,message:e.message}
  }
}

function wireForm(id, type){
  const form = document.getElementById(id);
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const obj = Object.fromEntries(fd.entries());
    const payload = { type, secret: qs('key'), item: obj };
    show('Saving...');
    const r = await postToWorker(payload);
    if(r && r.ok){ show('Saved — deploy triggered. Wait ~1 min then refresh site.'); form.reset(); }
    else show('Error: ' + (r && r.message ? r.message : 'Unknown error'));
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  const key = qs('key');
  if(!key){ document.getElementById('notice').innerText = 'Missing admin key in URL. Ask site owner.'; return; }
  document.getElementById('forms').style.display = 'block';
  wireForm('news-form','news');
  wireForm('gallery-form','gallery');
  wireForm('resource-form','resources');
});
