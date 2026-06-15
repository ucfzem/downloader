# UCF ZEM - Full Session Backup

## Date: June 14-15, 2026

---

## Projects Overview

### Lingotech (Learning Platform)
- URL: https://ucfzem.github.io/lingotech/
- Vercel: https://lingotech-six.vercel.app
- GitHub: https://github.com/ucfzem/lingotech
- Amis version: https://ucfzem.github.io/lingotech/amis/
- Files: /tmp/lingotech/
- Status: Maintenance/Finished

### Downloader (TikTok + Instagram)
- GitHub: https://github.com/ucfzem/downloader
- Vercel: https://downloader-sepia-delta.vercel.app
- Cloudflare Worker: https://downloader.azer-tyu199p.workers.dev
- Files: /tmp/downloader/
- Status: TikTok working, Instagram blocked

### Instagram API (Puppeteer service for Render)
- Original: https://github.com/XRoiDX/Instagram-media-downloader-API
- Local copy: /tmp/ig-api/
- Status: Ready to deploy on Render

### Photographer Site
- URL: https://ucfzem.github.io/photographer/
- Vercel: https://photographer-push.vercel.app

---

## Lingotech Details

### Features
- 6 lessons (A1-A2 English)
- Conjugator (4 tenses)
- Translator (fr, en, es, nl, ar) with flag icons
- Pomodoro timer
- Vocabulary quiz
- Donations (3 payment methods)
- Assistant IA (Groq API primary, Gemini fallback)

### API Keys Used
- Groq: `***` (referrer-restricted)
- Gemini: `***` (referrer-restricted)

### Tracking
- Spy system: tracker.js, spy.html, dashboard.html
- GitHub Issues for logging
- Cloudflare Web Analytics: a30fd89985dc4555b08862b0d83bb975
- Vercel Web Analytics: prj_k2A5jIZIIBA4JNWfB03ZC0NowEDc
- Google Search Console: kgaiVtITflzkTc27Z2fTV45r_LzlFfajzPxwQp_Ja14

---

## Downloader Details

### Architecture
- Cloudflare Worker (module format): /tmp/downloader/worker.js
- Cloudflare Worker (service-worker format, deployed): /tmp/downloader/worker-sw.js
- Vercel function (Node.js): /tmp/downloader/api/download.mjs
- Proxy download endpoint: /tmp/downloader/api/dl.mjs
- Frontend: /tmp/downloader/index.html

### TikTok Downloads
- Uses tikwm.com API (POST https://www.tikwm.com/api/)
- Fixed absolute URL handling with fullUrl() helper
- Downloads: No Watermark, With Watermark, Audio

### Instagram Status - BLOCKED
All approaches tried:
1. instasave.website - Cloudflare Turnstile blocked from datacenter
2. dumpoir - blocked
3. saveinsta.to - Cloudflare protected
4. instagram-url-direct npm (doc_id outdated) - returns null
5. Instagram embed page - no longer ships video URLs
6. Instagram GraphQL - 403 from datacenter IP
7. Instagram private API - login_required

### Instagram Solution (Pending)
- Deploy XRoiDX/Instagram-media-downloader-API on Render
- Uses instagram-url-direct first, falls back to Puppeteer
- Dockerfile ready at /tmp/ig-api/
- Deploy from: https://github.com/XRoiDX/Instagram-media-downloader-API

---

## GitHub Repos Restored
All 10 repos + Lingotech + photographer + downloader verified working:
- ucfzem.github.io (restored from commit 43dfff50)
- projets, quran-majeed-v3, tanger, nanogen, tmpdrop
- drawingsand, liens, snap-describe, ultralengua-pro
- ai-image-enhancer, photographer, lingotech, downloader

---

## Credentials (Internal Use)
- Vercel token: `***`
- Cloudflare token: `***`
- GitHub PAT: `***` (fine-grained, doesn't work with git HTTPS)
- Instagram: @ucfzem
- TikTok: @ucfzem
- Email: hassanzem62@gmail.com

---

## Key Files Location
- /tmp/lingotech/ - All Lingotech files
- /tmp/downloader/ - Downloader project files
- /tmp/ig-api/ - Instagram API for Render deployment
- /tmp/parth-dl/ - Python Instagram extractor (research)

---

## Session 2026-06-15 — Quick Check

- User asked about `/tmp/ucfzem.github.io/` contents — full GitHub Pages site listed
- User asked about TikTok/Instagram downloader — found at `/tmp/downloader/`
- Downloader endpoints:
  - Vercel: https://downloader-sepia-delta.vercel.app
  - Cloudflare Worker: https://downloader.azer-tyu199p.workers.dev
- Status: TikTok works via tikwm.com API, Instagram blocked (all approaches hit Cloudflare/Captcha)
- Conversation backup saved to this file

