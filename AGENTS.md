# Base44 Dev Environment

## Project
Static single-page marketing site for "2L² | ONE WORLD" — pure HTML/CSS/JS, no build step, no backend, no dependencies, no external services.

## Stack
- `index.html`, `styles.css`, `content.js` (3-language copy), `main.js` (scroll-driven background animation)
- Assets in `assets/` (brand-logo.png, favicon.png)

## Running
- `docker compose -f docker-compose.base44.yml up -d` — nginx:alpine serves the repo root on host port 3000.
- No live-reload dev server; the static files are bind-mounted read-only. Edits appear on browser refresh — call `reload_preview` after changes.
- The repo root dir must be world-traversable (chmod 755) or nginx's worker user gets 403.

## Editing
- Copy/translations: `content.js` (`window.SITE_COPY.ja/en/th`, `window.SITE_CONFIG.contactEmail`).
- Design tokens: `styles.css` `:root`.
- Motion: `main.js` `draw()`.

## Verification
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200.
- No secrets, no migrations, no seeds.
