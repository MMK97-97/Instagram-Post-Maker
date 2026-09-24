# MK97 Creative Studio — ICAT-style App Shell

This package adds an app-style shell around the existing MK97 Creative Studio without rewriting the current Poster Editor or Video Editor engines.

## Upload to your existing site root
Place these files in the same folder as your existing:
- `poster-editor.html`
- `video-editor.html`
- `assets/`

Upload/replace:
- `index.html`
- `poster.html`
- `video.html`
- `library.html`
- `more.html`
- `mk97-app.css`
- `mk97-app.js`
- `manifest.webmanifest`
- `sw.js`

Do **not** delete or replace your current `poster-editor.html`, `video-editor.html`, their JavaScript, CSS, templates, media, or assets.

## What changes
- Fixed app header and bottom navigation
- Home / Poster / Video / Library / More pages
- Only inside content scrolls
- Responsive typography using `clamp()`
- Safe-area support for iPhone/Android
- Smooth low-noise page transitions
- Browser back/swipe restoration
- Installable PWA shell
- Existing editors remain functional and load inside the app shell

## Important
Your public GitHub repository currently appears empty on its default branch even though GitHub Pages is serving the website. Make sure you upload this package to the branch/folder that actually publishes the current site.
