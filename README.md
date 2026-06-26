# LondonStream OTT Platform Demo V14

Full functional OTT demo for London / UK market.

## Features
- Home page with hero and rails
- Browse page with search, type filter, and genre/tag filter
- Watch page with embedded YouTube player
- Short Films + Full Movies + Web Series rail
- Demo login using localStorage
- Watchlist using localStorage
- GBP pricing page
- Static `/api/content` demo endpoint
- Vercel-ready with `public` output directory
- Node 24 compatible

## Given YouTube content included
Short films:
- REAPPEAR — 22l6w8n9iCc
- COPE — JnXOE6FFoWA
- Timepiece — X4EcUcoo0r4
- One Brother — 9V-pqcssF68
- The Darkest Blue — xhSuFVnoTNk
- Big Take — GDv8Iei3h4Y

Full movies:
- Lost in Love — PMeHdc25BGE
- Based on a True Story — 6D_gmtQ7avg
- The Wrath of Cain — 0s8ry-22gjA

## Local test
```bash
npm install
npm run build
npm start
```
Open `http://localhost:3000`.

## Vercel settings
- Framework Preset: Other
- Install Command: `npm install --no-audit --no-fund --loglevel=error`
- Build Command: `npm run build`
- Output Directory: `public`

## Important
Before deploy, delete old project files from earlier builds:
- old `api/`
- old `views/`
- old `routes/`
- old `package-lock.json`
- old `node_modules/`

This package can keep `server.js`; it is a local preview entrypoint only. Vercel serves the `public` output.
