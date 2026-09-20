# 2L² — Atelier / continuous-scroll website

## Preview locally
Unzip the archive, then double-click `index.html`. No installation or build tools are required. Use Chrome, Edge or Safari. The six HTML pages share the same visual language and navigation; the **home page is one uninterrupted long scroll**, not a slideshow.

## Edit the website
- `content.js`: editable Japanese, English and Thai text. Edit text only inside the quotation marks. For a heading line break use `\n`. Also set `window.SITE_CONFIG.contactEmail` to a *tested* inbox before announcing the website; while empty the contact CTA displays an honest setup notice.
- `styles.css`: colors (`--gold`, `--night`), font sizes, spacing, cinematic animations and responsive layout.
- `main.js`: structure, language switching, animated scene and smooth scroll.
- `assets/brand-logo.png`: official shield logo shown in the upper-left header and small footer.
- `assets/hero-chip.webp`, `compute-stack.webp`, `light-portal.webp`: illustration-only crops of **your supplied reference concept image**; the text/menu are real HTML, not embedded in these graphics. Replace the graphics with originals later if you wish.

## GitHub workflow
1. Push the whole unzipped folder (files at repo root, assets in `assets/`). Keep file names and folder structure. Do not upload the ZIP itself.
2. In GitHub, open `content.js`, click the pencil icon, edit the relevant locale, click **Commit changes**.
3. Connect the repository to Cloudflare Pages: Framework preset `None`, build command empty, output directory `.`. If the repository is private, authorize the GitHub integration. Test on the Pages preview URL before attaching twoltwo.com.
4. Before public launch, verify company registration/address, data protection and contact details; confirm that setting up hosting DNS does not interrupt existing MX/SPF/DKIM mail forwarding.

## Accessibility and technical notes
The page uses semantic sections and headings, focusable links, a keyboard-operable mobile menu, a skip link, reduced-motion support and passive/RAF-based scroll animation. All graphics have been separated from live website text; motion is purely decorative.
