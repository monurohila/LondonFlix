# LondonStream OTT Demo V15 – Fixed Routes + Uncropped Previews

This version fixes the Vercel 404 issue for `/watch/sf-001` by adding both Vercel rewrites and real static fallback folders such as `public/watch/sf-001/index.html`.

It also fixes movie preview cutting by using widescreen YouTube thumbnails with safe fallback and CSS `object-fit: contain` for posters/cards.

## Vercel Settings

- Framework Preset: Other
- Install Command: `npm install --no-audit --no-fund --loglevel=error`
- Build Command: `npm run build`
- Output Directory: `public`

Redeploy with **Clear Build Cache**.

## Test URLs

- `/`
- `/browse`
- `/pricing`
- `/watch/sf-001`
- `/watch/mv-001`
- `/api/content`

## Important

Delete old files before upload: old `api/`, `views/`, `routes/`, `package-lock.json`, `node_modules/`.
