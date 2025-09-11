/**
Cloudflare Worker to accept POST /commit and update GitHub file.
Set env vars: GITHUB_TOKEN, REPO_OWNER, REPO_NAME, SECRET_KEY
*/
addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});

async function handle(request){
  const url = new URL(request.url);
  if(request.method !== 'POST' || !url.pathname.endsWith('/commit')){
    return new Response(JSON.stringify({ok:false, message:'invalid endpoint'}), {status:400, headers:{'content-type':'application/json'}});
  }
  try{
    const body = await request.json();
    const { type, secret, item } = body;
    if(!type || !secret || !item) return new Response(JSON.stringify({ok:false,message:'missing fields'}),{status:400,headers:{'content-type':'application/json'}});
    // env vars available via globalThis (Cloudflare binds)
    const GITHUB_TOKEN = GITHUB_TOKEN || globalThis.GITHUB_TOKEN;
    const REPO_OWNER = REPO_OWNER || globalThis.REPO_OWNER;
    const REPO_NAME = REPO_NAME || globalThis.REPO_NAME;
    const SECRET_KEY = SECRET_KEY || globalThis.SECRET_KEY;
    if(!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME || !SECRET_KEY){
      return new Response(JSON.stringify({ok:false,message:'server not configured'}), {status:500, headers:{'content-type':'application/json'}});
    }
    if(secret !== SECRET_KEY) return new Response(JSON.stringify({ok:false,message:'invalid secret'}), {status:403, headers:{'content-type':'application/json'}});

    const filePath = `content/${type}.json`;
    const apiBase = 'https://api.github.com';
    // get current file to obtain sha
    const getRes = await fetch(`${apiBase}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if(!getRes.ok){
      return new Response(JSON.stringify({ok:false,message:'failed to read existing content file', status:getRes.status}), {status:500, headers:{'content-type':'application/json'}});
    }
    const getJson = await getRes.json();
    const sha = getJson.sha;
    const contentStr = atob(getJson.content.replace(/\n/g,''));
    let arr = [];
    try{ arr = JSON.parse(contentStr); if(!Array.isArray(arr)) arr = []; }catch(e){ arr = []; }
    // append item with timestamp
    const timestamp = new Date().toISOString();
    arr.push(Object.assign({ _created: timestamp }, item));
    const newContent = JSON.stringify(arr, null, 2);
    const b64 = btoa(newContent);
    // commit update
    const putRes = await fetch(`${apiBase}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
      method: 'PUT',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' },
      body: JSON.stringify({ message: `Update ${filePath} via admin`, content: b64, sha })
    });
    if(!putRes.ok){
      const txt = await putRes.text();
      return new Response(JSON.stringify({ok:false,message:'failed to update file', status: putRes.status, detail: txt}), {status:500, headers:{'content-type':'application/json'}});
    }
    return new Response(JSON.stringify({ok:true}), {status:200, headers:{'content-type':'application/json'}});
  }catch(e){
    return new Response(JSON.stringify({ok:false, message: e.message}), {status:500, headers:{'content-type':'application/json'}});
  }
}
