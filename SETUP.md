# One-time operator setup

You run every event yourself off the **`mcbradyk1`** GitHub account and your own
Google Drive. Guests never fork anything — they just open a URL and upload.

Do the steps below **once, ever.** After that, spinning up a new event is the
short checklist in **[NEW-EVENT.md](NEW-EVENT.md)** — no new credentials, no code
changes.

> **The model:** 1 event = 1 GitHub repo named `eventname` (served at
> `mcbradyk1.github.io/eventname`) + 1 Google Drive folder. Deleting an event is
> just deleting that repo and that folder. Everything else below is shared
> infrastructure you set up once and reuse for all events.

---

## 1. Make this a **template repository**

So each event is "Use this template" instead of copy-paste:

1. Push this project to a repo on the `mcbradyk1` account (e.g. `event-photo-template`).
2. **Settings → General → check "Template repository".**

That's the button that makes NEW-EVENT.md a 5-minute job.

## 2. Create ONE shared service account (reused for every event)

The sync job needs read-only access to Drive. Make **one** service account and
reuse it forever — you'll just *share* each new event's folder with it.

1. In Google Cloud Console, create a project (or reuse one).
2. Enable the **Google Drive API**.
3. Create a **Service Account**, then create a **JSON key** and download it.
4. Note the SA's `client_email` (looks like `…@….iam.gserviceaccount.com`).

Keep that JSON somewhere safe. It becomes the `GDRIVE_SA_FILE` secret in **every**
event repo — the *same* JSON pasted each time. You never make another one.

## 3. Create ONE reusable GitHub PAT (reused for every event)

So new photos appear within minutes (not just on the daily cron), the Apps
Script tells GitHub to run the sync. Make one fine-grained token:

- GitHub → **Settings → Developer settings → Fine-grained tokens.**
- **Repository access:** *All repositories* (or a select set you'll keep adding
  event repos to).
- **Permissions:** *Repository → Actions → Read and write*. Nothing else.
- Set an expiry **and a calendar reminder to rotate it.** An expired token just
  disables the instant trigger; the daily cron still catches everything.

> Tradeoff: "All repositories" is broader than a single-repo token, but it means
> one token for all events instead of one per event. For a solo operator that's
> the right call. Store it only in the Apps Script (step 4) — never in any repo.

## 4. Deploy the upload broker (Apps Script)

The uploader is a Google Apps Script (`code.gs` from the companion
`PhotoUploader`) that mints **signed, resumable Drive upload URLs** — it never
touches the photo bytes.

You have two ways to run it; pick one:

- **Simple (per-event copy):** deploy a fresh copy of the script for each event,
  changing just its folder ID + target repo. Easiest to reason about; a little
  clicking each time. Covered in NEW-EVENT.md.
- **Advanced (one central "hub"):** deploy the script **once** with an
  event→folder allow-list, and each event's `config.js` sends its own `eventId`.
  One deployment forever. (Ask me for the hub `code.gs` when you want this.)

Either way, the script's **Script Properties** hold the shared `GITHUB_PAT` from
step 3, and its OAuth scopes are `drive`, `script.external_request`,
`script.scriptapp`. Deploy as **Web app**, *execute as: me*, *access: Anyone*.

---

## You're done with setup

From here on, every new event is just **[NEW-EVENT.md](NEW-EVENT.md)**:
use the template → name the repo `eventname` → make a Drive folder → paste 2
secrets → edit `config.js` → print the sign.

## Local preview of any event

```bash
python -m http.server 8000
# visit http://localhost:8000/
```

The galleries read `manifest.json` / `booth_manifest.json`; a fresh copy ships
empty ones so pages load and show "Photos coming soon" until the first sync.
