# Base44 Dev Environment

## Overview
This is a **pure static website** (HTML/CSS/JS, no build step, no backend, no dependencies).
The entry point is `index.html` at the repo root.

## Running
- Served via `nginx:alpine` in `docker-compose.base44.yml` on host port 3000.
- Source is bind-mounted read-only into the container, so file edits appear on refresh.
- No live-reload dev server; call `reload_preview` after edits to force a refresh.

## Structure
- `index.html` — main landing page
- `customer.html`, `onboarding.html`, `privacy.html`, `security.html` — sub-pages
- `content.js` — all copy in 3 languages (ja/en/th) via `window.SITE_COPY`
- `main.js` — scroll-driven background animation logic
- `styles.css`, `journey.css`, `customer*.css`, `privacy.css` — styles
- `assets/` — logo, favicon, and webp/png images

## Notes
- No external credentials or secrets required.
- No form backend; contact button is hidden until `window.SITE_CONFIG.contactEmail` is set in `content.js`.
