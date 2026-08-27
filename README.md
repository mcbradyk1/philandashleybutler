# Event Guest Photobook — a configurable static photo site

A lightweight, static **event photo site** for GitHub Pages. Guests upload
photos from their phones; a serverless pipeline pulls new photos from Google
Drive, generates thumbnails, and republishes the site. No server, no database,
no storage of your own — just static files plus a sync that runs on upload and
on a scheduled cron as a safety net. **Photos only, by design** (no video, so
there's nothing extra to host).

**You configure the whole thing by editing one file: [`config.js`](config.js).**
Secrets stay out of the repo.

### This is an operator template — one repo per event

You run every event yourself (guests never fork anything). Each event is its own
repo named `eventname`, served at **`mcbradyk1.github.io/eventname`**, with its
own Google Drive folder. Delete an event = delete that repo + that folder;
nothing else is affected.

- **First time only:** [SETUP.md](SETUP.md) — mark this a template repo, make one
  shared service account + one PAT, deploy the upload broker. Done once, ever.
- **Every new event (~5 min):** [NEW-EVENT.md](NEW-EVENT.md) — use the template,
  name the repo, make a Drive folder, paste 2 secrets, edit `config.js`, print
  the QR sign.

---

## Rebrand in one file

`config.js` controls everything public and cosmetic:

```js
window.EVENT_CONFIG = {
  eventName:  "Kyle & Elly",
  subtitle:   "Wedding Guest Photobook",
  eventDate:  "August 8th, 2026",
  siteDomain: "mcbradyk1.github.io/eventname",   // match the repo name
  features: { photoUpload:true, guestGallery:true, photobooth:false },
  theme: { primary:"#7a8f6a", secondary:"#8b7db8", /* background, text, fonts… */ },
  text:  { welcome:"Thank you for celebrating with us", /* … */ },
  endpoints: { photoUpload:"" },   // your Apps Script /exec URL
};
```

`branding.js` applies it at load with **no build step**: it pushes your two
theme colors into CSS variables (every button, glow and gradient is derived
from them), fills text via `data-brand` hooks, and removes any feature you turn
off. Flip `features.photobooth` to `true` only if you run a booth PC.

---

## How it works (at a glance)

```
Guest phone            Apps Script broker        Google Drive          GitHub Actions        GitHub Pages
-----------            ------------------        ------------          --------------        ------------
upload.html ─▶ mint resumable upload URL ─▶ browser PUTs bytes ─▶ Drive (guest photos) ─▶ sync_gallery.py ─▶ thumbnails/ + manifest.json
Booth PC    ─▶ post-capture upload ───────▶ Drive (booth photos) ─▶ sync_booth.py ─▶ booth_thumbnails/ + booth_manifest.json  (optional)
                                                                          static.yml deploys ──▶ live site
```

- **Uploads use a signed-URL (resumable) pattern.** The Apps Script mints a
  Drive resumable-upload session with its own OAuth token; the browser PUTs
  bytes straight to Drive. No Drive credentials reach the browser and large
  files never pass through the script.
- **Only 600px thumbnails live in the repo.** Full images stream from the Drive
  CDN (`lh3.googleusercontent.com`) at view time; downloads come from
  `drive.usercontent.google.com`.
- **The two galleries share `gallery.js`.** `gallery.html` and `photobooth.html`
  differ only by two globals set inline before the script loads
  (`MANIFEST_URL` / `THUMB_DIR`).

---

## Repository layout

```
.
├── config.js            # ← EDIT THIS. All branding, theme, labels, features, endpoints.
├── branding.js          # Applies config.js (no build step). You shouldn't need to edit it.
│
├── index.html           # Landing page (Share / Browse hubs) — config-driven
├── gallery.html         # Guest gallery (manifest.json + thumbnails/)
├── photobooth.html      # Booth gallery (booth_manifest.json + booth_thumbnails/)
├── upload.html          # Guest photo upload  (working uploader; URL comes from config.js)
├── photoboothSign.html  # Printable QR sign (renders a QR to siteDomain)
│
├── gallery.js           # Shared gallery + lightbox logic (both galleries)
├── shared.css           # Themeable styling (reads --cfg-* variables)
├── favicon.ico
├── fonts/               # Bundled script font (Alex Brush); swap freely
│
├── manifest.json / thumbnails/            # Guest gallery data (seeded empty)
├── booth_manifest.json / booth_thumbnails/# Booth gallery data (seeded empty)
│
├── docs/PHOTOBOOTH_SETUP.md               # Optional booth PC setup
├── scripts/             # imaging.py, sync_*.py, prune_*.py (env-driven; generic)
├── requirements.txt
└── .github/workflows/   # sync-gallery, sync-booth, prune-*, static (deploy)
```

---

## The upload page

`upload.html` is a complete, working uploader (multi-select, per-photo progress,
sequential Drive PUTs, retry, batched `initPhotoUploadBatch`). It is fully
config-driven — the only per-event value is the Apps Script URL, which it reads
from `config.js`:

```js
APPS_SCRIPT_URL: window.EVENT_CONFIG.endpoints.photoUpload
```

You do **not** edit `upload.html` to rebrand — its title, heading, and colors
all come from `config.js`.

---

## Quick start

1. Fork → set **Pages source: GitHub Actions**.
2. Edit `config.js`.
3. Follow **[SETUP.md](SETUP.md)** for Drive folders, the Apps Script broker,
   the 2–4 repo Secrets, and the fine-grained PAT.
4. Push; run the **Sync Guest Gallery** workflow once; print the QR sign.

Local preview:

```bash
python -m http.server 8000   # http://localhost:8000/
```
