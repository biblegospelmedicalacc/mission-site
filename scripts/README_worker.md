Cloudflare Worker for secure GitHub commits (used by Admin page)
---------------------------------------------------------------

Overview
--------
This Worker acts as a small server endpoint your Admin page POSTs to.
It holds your GitHub token and repo settings as environment variables (kept secret in Cloudflare).
The Worker verifies the secret key provided by the admin link, then updates content/*.json in your repo via GitHub API.

Environment variables to set in the Worker (in Cloudflare dashboard or wrangler):
 - GITHUB_TOKEN    (Personal Access Token with repo:contents write for this repo)
 - REPO_OWNER      (your GitHub username or org)
 - REPO_NAME       (mission-site)
 - SECRET_KEY      (same key you give to admins, e.g. gospel2025)

Endpoints
 - POST /commit
   Body JSON: { type: "news"|"gallery"|"resources", secret: "<key>", item: { ... } }

Behavior
 - Worker will fetch current content/<type>.json from GitHub, append new item with timestamp, and update the file.
 - Response JSON: { ok: true } on success or { ok:false, message:"..." } on failure.

Deploy
 - You can deploy the Worker via Cloudflare dashboard or wrangler CLI.
 - If using dashboard, create a Worker, paste worker.js contents, and add the env vars there.
 - The worker's route can be a custom subdomain (e.g. admin.mydomain.com/*) or workers.dev subdomain.

Set ADMIN_API_URL
 - After deploying, set the ADMIN_API_URL in your admin client (assets/admin.js) to point to the worker's commit endpoint,
   e.g. https://your-worker-subdomain.workers.dev/commit
 - Alternatively, set window.ADMIN_API_URL in the browser, or modify the file before uploading.

Security notes
 - Keep GITHUB_TOKEN secret. Do not embed it in client-side code.
 - SECRET_KEY is a second check; if leaked, rotate SECRET_KEY in worker env and update admin links.
