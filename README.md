# LondonFlix OTT Demo V16

Functional OTT platform demo for London/UK market with real YouTube embedded playback.

## V16 updates
- Replaced broken REAPPEAR preview video with `9SA_JmEcRAE`.
- Added Upcoming Movies 2026 trailer shelf.
- Added richer watch-page details: availability, release window, director, cast, audio, subtitles, quality, content advice and tags.
- Improved full-screen/card previews using 16:9 contain-fit thumbnails.
- YouTube redirects reduced using privacy-enhanced `youtube-nocookie.com` embed and sandboxed iframe.

## Deploy on Vercel
Use:

```text
Framework Preset: Other
Install Command: npm install --no-audit --no-fund --loglevel=error
Build Command: npm run build
Output Directory: public
```

Then redeploy with Clear Build Cache.

## Test URLs
- `/`
- `/browse`
- `/browse?type=Upcoming%202026%20Trailer`
- `/pricing`
- `/watch/sf-001`
- `/watch/up-001`
- `/api/content`

## Note on YouTube branding
Public YouTube embeds may still display YouTube UI/branding depending on player state and browser. This demo uses privacy-enhanced embeds and iframe sandboxing to restrict external navigation as much as possible. For a commercial OTT launch, use licensed video hosting/CDN with DRM.
