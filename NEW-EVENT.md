# Spin up a new event (~5 minutes)

Do this each time you take on a new event. Assumes the **one-time setup** in
[SETUP.md](SETUP.md) is done (template repo exists, shared service account +
PAT + Apps Script `code.gs` are ready).

The result is a site at **`mcbradyk1.github.io/eventname`** with its own Drive
folder, fully isolated from every other event.

> Replace **`eventname`** below with the actual slug you want in the URL — keep
> it lowercase, no spaces (e.g. `smith-wedding`, `jones-grad-2027`).

> **Photo booth?** The steps below cover a normal photos-only event. If this
> event also has a photo booth, do the **[Photo booth add-on](#photo-booth-add-on-optional)**
> section at the end too.

---

## 1. Create the repo from the template

1. On the template repo, click **Use this template → Create a new repository**.
2. Owner: **mcbradyk1**. Repository name: **`eventname`** (this becomes the URL).
3. Create it, then in the new repo: **Settings → Pages → Source: GitHub Actions.**

The site will live at `https://mcbradyk1.github.io/eventname/` once it deploys.

## 2. Make the Drive folder

1. In your Google Drive, create a folder (name it after the event).
2. **Share it with your shared service account's `client_email`** (from SETUP
   step 2), role **Viewer**.
3. Open the folder and copy its **ID** from the URL:
   `drive.google.com/drive/folders/`**`<THIS_PART>`**.

## 3. Add the repo secrets

In the new repo: **Settings → Secrets and variables → Actions → New repository
secret.** Add:

| Secret | Value |
|--------|-------|
| `GDRIVE_FOLDER_ID` | the folder ID from step 2 |
| `GDRIVE_SA_FILE` | paste the **same** service-account JSON you use for every event |

## 4. Deploy the upload broker (Apps Script) — ~3 min

You keep one master copy of `code.gs`. Each event gets its **own deployment** of
it so the events stay isolated. Follow this exactly:

1. Go to **[script.google.com](https://script.google.com) → New project** (or
   open your master `PhotoUploader` project and **Make a copy**).
2. Paste in your `code.gs`. Near the top, change **these two constants only**:

   ```js
   const PHOTO_FOLDER_ID = 'PASTE_THIS_EVENTS_FOLDER_ID';   // from step 2
   const ALLOWED_ORIGINS = ['https://mcbradyk1.github.io']; // origin only, NO path
   ```

3. **Project Settings (gear icon) → Script Properties → Add script property**,
   twice:

   | Property | Value |
   |----------|-------|
   | `GITHUB_PAT` | your shared PAT (from SETUP step 3) |
   | `GITHUB_REPO` | `mcbradyk1/eventname` |

4. **Deploy → New deployment → gear icon → Web app.** Set:
   - **Execute as:** *Me*
   - **Who has access:** *Anyone*
   - Click **Deploy**, authorize when prompted, and **copy the `/exec` URL.**

5. In the Apps Script editor, run **`installGalleryFlushTrigger`** once
   (Run menu → select the function → Run) to install the 5-minute debounce.

> The `/exec` URL is public by design (guests' browsers call it) but keep it out
> of screenshots. It goes into `config.js` next.

## 5. Edit `config.js` (the only file you touch)

Open `config.js` in the new repo and set:

```js
eventName:  "Smith & Jones",              // the big title
subtitle:   "Share Your Photos",
eventDate:  "June 14th, 2027",
siteDomain: "mcbradyk1.github.io/eventname",   // <-- match the repo name!

theme: { primary: "#7a8f6a", secondary: "#8b7db8" },   // pick two colors

features: { photoUpload:true, guestGallery:true, photobooth:false },  // booth off

endpoints: { photoUpload: "https://script.google.com/…/exec" },  // from step 4
```

Commit. That rebrands every page and wires up uploads.

## 6. Go live

1. The **Deploy** workflow runs on push; wait for it to finish (Actions tab).
2. Kick a first sync: **Actions → "Sync Guest Gallery" → Run workflow.**
3. Open `mcbradyk1.github.io/eventname` and upload a test photo to confirm the
   whole loop works.
4. Print the sign: open **`photoboothSign.html`** and print it — the QR points
   at `mcbradyk1.github.io/eventname`.

---

## Photo booth add-on (optional)

Only if this event has a photo booth. It's a **second, parallel pipeline**: its
own Drive folder, its own secrets, its own sync workflow, feeding the separate
`photobooth.html` gallery. The booth photos never mix with guest photos. Do this
*in addition to* the steps above.

### B1. Make a SECOND Drive folder (for booth photos)

1. Create another Drive folder — a **different** one from the guest folder.
2. **Share it with the same service account** `client_email`, role **Viewer**.
3. Copy its folder **ID** (from the URL, same as step 2).

### B2. Add the booth secrets

In the event repo: **Settings → Secrets and variables → Actions.** Add:

| Secret | Value |
|--------|-------|
| `BOOTH_DRIVE_FOLDER_ID` | the booth folder ID from B1 |
| `BOOTH_DRIVE_SA_FILE` | the **same** service-account JSON again |

### B3. Turn the feature on in `config.js`

Flip the toggle so the booth tile + `photobooth.html` gallery appear:

```js
features: { photoUpload:true, guestGallery:true, photobooth:true },  // booth ON
```

Commit.

### B4. Point the booth PC at the booth folder

Follow **[docs/PHOTOBOOTH_SETUP.md](docs/PHOTOBOOTH_SETUP.md)** on the venue PC:

- Set the booth's post-capture upload to write into the **booth Drive folder**
  (the B1 folder — *not* the guest folder).
- Set its `workflow_dispatch` call to trigger **`sync-booth.yml`** in
  `mcbradyk1/eventname`, using the shared PAT.

Booth photos are auto-captioned "Photobooth" by `sync_booth.py`, so no filename
convention is needed on the booth PC.

### B5. Test the booth loop

1. Take a test capture on the booth PC → confirm the file lands in the **booth**
   Drive folder.
2. **Actions → "Sync Photo Booth Gallery" → Run workflow** (or let the booth's
   dispatch trigger it).
3. Confirm it appears on `mcbradyk1.github.io/eventname/photobooth.html` after
   the deploy.

---

## Handing off & deleting later

When the event's over and you've given the couple their photos:

1. **Delete the Google Drive folder(s)** — the guest folder, and the booth
   folder if you made one. This removes the full-res originals.
2. **Delete the GitHub repo** (removes the site + thumbnails instantly).
3. **Delete the event's Apps Script deployment** (or the whole script project).

All independent — deleting one event never affects another. The shared service
account, PAT, and master `code.gs` stay put for the next event.

## Per-event checklist (copy/paste)

```
[ ] Use template → repo named "eventname"
[ ] Settings → Pages → Source: GitHub Actions
[ ] Guest Drive folder created + shared with service account
[ ] Guest folder ID copied
[ ] Secrets: GDRIVE_FOLDER_ID, GDRIVE_SA_FILE
[ ] Apps Script: copy code.gs, set PHOTO_FOLDER_ID + ALLOWED_ORIGINS
[ ] Apps Script: Script Properties GITHUB_PAT + GITHUB_REPO
[ ] Apps Script: deploy Web app (Me / Anyone) → copy /exec URL
[ ] Apps Script: run installGalleryFlushTrigger once
[ ] config.js: eventName, subtitle, eventDate, siteDomain, colors, endpoint
[ ] (optional) config.js: googleFonts + scriptFont/bodyFont
[ ] Deploy finished, first sync run, test photo uploaded
[ ] photoboothSign.html printed

Photo booth (only if used):
[ ] Second Drive folder created + shared with service account
[ ] Booth folder ID copied
[ ] Secrets: BOOTH_DRIVE_FOLDER_ID, BOOTH_DRIVE_SA_FILE
[ ] config.js: features.photobooth = true
[ ] Booth PC pointed at booth folder + triggers sync-booth.yml
[ ] Booth test capture synced + visible on photobooth.html
```
```
