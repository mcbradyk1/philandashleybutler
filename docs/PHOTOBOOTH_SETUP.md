Photo Booth PC — Setup Guide
The photo booth is the open-source
PhotoboothProject/photobooth
app running on a dedicated Linux PC at the venue. It is not part of this
repository. Its only link to the site is a shared Google Drive folder: an
upload cron job on the booth PC pushes new captures there, and the site's
`sync-booth.yml` workflow turns them into `booth_thumbnails/` +
`booth_manifest.json` and publishes them to `photobooth.html`.
> Only relevant if `features.photobooth` is `true` in `config.js`.
```
Booth PC (PhotoboothProject)          Google Drive                Website (GitHub)
----------------------------          ------------                ----------------
Photobooth writes captures            BOOTH Drive folder          sync-booth.yml
to a local output folder                   ▲                       → booth_thumbnails/
   │                                        │                      → booth_manifest.json
   ▼                                        │                      → deployed to photobooth.html
upload cron job (every N min):              │                              ▲
  1. poll the local folder for new files    │                              │
  2. upload new files to Drive ─────────────┘                              │
  3. POST workflow_dispatch (fine-grained PAT) ─────────────────────────────┘
```
1. Create the booth Drive folder
Create a folder used only by the booth (separate from the guest photo
folder). Copy its ID from the URL:
`https://drive.google.com/drive/folders/<THIS_IS_THE_FOLDER_ID>`.
Share it with the identity the booth PC uploads as (a service account with
Editor, or a personal Google account via rclone).
2. Give the website pipeline read access
Set two repository Secrets (used by `sync-booth.yml`):
Secret	Value
`BOOTH_DRIVE_FOLDER_ID`	the folder ID from step 1
`BOOTH_DRIVE_SA_FILE`	a read-only service-account JSON shared on that folder
3. Fine-grained PAT to trigger the sync
So booth photos appear within minutes, the upload job calls the GitHub API to
start `sync-booth.yml` after each upload. Create a fine-grained PAT scoped
to this repo only, Actions: Read and write. Set an expiry + a rotation
reminder. Store it in the booth PC's environment (never commit it).
4. Upload cron job
A minimal `/opt/booth/upload.sh` polls Photobooth's output folder and uploads
new JPEGs with `rclone copy` (idempotent — skips files already in Drive), then
nudges the workflow:
```bash
#!/usr/bin/env bash
set -euo pipefail
BOOTH_LOCAL_DIR="/var/www/html/photobooth/data/images"   # Photobooth output folder
BOOTH_FOLDER_ID="<BOOTH_DRIVE_FOLDER_ID>"
GITHUB_PAT="<fine-grained PAT>"    # source from env in practice
REPO="<owner>/<repo>"

rclone copy "$BOOTH_LOCAL_DIR" booth-drive: \
  --drive-root-folder-id "$BOOTH_FOLDER_ID" \
  --include "*.jpg" --max-age 24h --no-traverse

curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_PAT" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/$REPO/actions/workflows/sync-booth.yml/dispatches" \
  -d '{"ref":"main"}' >/dev/null || true
```
Install it in cron (every 3 minutes):
```
*/3 * * * * /opt/booth/upload.sh >> /var/log/booth-upload.log 2>&1
```
Notes:
Destination = the booth folder, not the guest folder (mixing them
cross-populates the galleries).
JPEG only. The thumbnailer (`scripts/imaging.py`) expects still images.
Booth photos are auto-captioned "Photobooth" by `sync_booth.py`, so no
special filename convention is needed on the booth PC.
5. Test before the event
Take a test capture → run `/opt/booth/upload.sh` by hand → confirm the file
lands in Drive and the `workflow_dispatch` returns HTTP 2xx → confirm it appears
on `photobooth.html` after the deploy. Then verify `crontab -l` and the log.
6. Removing booth photos later
Pruning is manual and defaults to a dry run: delete the capture from Drive,
then run the prune-booth workflow (dry-run first, then re-run with dry-run
off). The pruner refuses to delete anything if Drive returns zero images, so a
transient API hiccup can't wipe the gallery. Remove the file from the booth PC's
local folder too, or the cron job will just re-upload it.
