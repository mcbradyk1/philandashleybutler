/* ============================================================================
 *  config.js  —  THE ONLY FILE YOU EDIT TO SET UP YOUR EVENT
 * ----------------------------------------------------------------------------
 *  Everything here is PUBLIC (it ships to every visitor's browser).
 *  Do NOT put secrets here — no PATs, no service-account JSON, no Drive
 *  folder IDs. Those live in GitHub Secrets / Apps Script Properties.
 *  See SETUP.md for the one-time setup steps.
 *
 *  If you can edit text between the quotes, you can rebrand this whole site.
 * ========================================================================== */

window.EVENT_CONFIG = {

  /* ---- 1. Your event ------------------------------------------------------
   * eventName  = the big script title (couple names, "Class of 2027", etc.)
   * subtitle   = the smaller script line under it
   * eventDate  = shown in the footer and on the printable QR sign
   * siteDomain = the full public address of THIS event, used by the QR sign.
   *              For a project-site repo named "eventname" under the account
   *              "mcbradyk1", the address is:  mcbradyk1.github.io/eventname
   *              (no https://, no trailing slash — the QR sign adds those).
   */
  eventName:  "PHIL & ASHLEY",
  subtitle:   "Wedding Guest Photobook",
  eventDate:  "October 17th, 2026",
  siteDomain: "mcbradyk1.github.io/philandashleybutler",

  /* ---- 2. Wording ---------------------------------------------------------
   * Reword anything guests see. Emoji are fine. Leave a value "" to hide it.
   */
  text: {
    heart:           "\uD83D\uDC9A",           // little accent emoji (💚)
    welcome:         "Thank you for celebrating with us",
    footer:          "Thank you for celebrating with us",
    galleryTagline:  "Photos shared by our guests",
    galleryRefresh:  "New photos appear within a few minutes \u267B\uFE0F",
    boothTagline:    "Snapshots from the booth \uD83D\uDCF8",
    boothRefresh:    "New snapshots appear within a few minutes \u23F1\uFE0F",
    uploadPatience:  "Uploads may take a moment to appear \u2014 thank you for your patience.",
    // Upload page copy:
    uploadHeading:   "Share Your Photos",
    uploadHint:      "Tap to add your favorite moments",
    uploadSubhint:   "Photos only, pick as many as you like",
    // Landing-page tiles (icon + title + subtitle):
    tiles: {
      uploadPhotos: { icon: "\uD83D\uDCF7", title: "Upload Photos",       sub: "Add your favorite moments" },
      guestGallery: { icon: "\uD83D\uDDBC\uFE0F", title: "Guest Gallery",  sub: "Photos shared by guests" },
      photobooth:   { icon: "\uD83D\uDCF8", title: "Photo Booth Gallery", sub: "Photos from the booth" },
    },
  },

  /* ---- 3. Turn features on/off -------------------------------------------
   * Set a value to false to remove that feature everywhere (its tile and page
   * disappear). The simplest possible event is just photo upload + gallery.
   *
   *   photoUpload  — the guest upload page + gallery pipeline
   *   guestGallery — the "Guest Gallery" browse page
   *   photobooth   — the separate photo-booth gallery (needs a booth PC; SETUP)
   */
  features: {
    photoUpload:  true,
    guestGallery: true,
    photobooth:   true,   // off by default — turn on only if you run a booth
  },

  /* ---- 4. Colors & fonts --------------------------------------------------
   * Pick TWO colors. Everything (titles, buttons, progress bar, glows) is
   * derived from them automatically — you don't have to match shades.
   *   primary   = titles, "Choose Photos" button, home link
   *   secondary = the Upload button and progress bar
   * Any CSS color works ("#7a8f6a", "rebeccapurple", "rgb(...)").
   */
  theme: {
    primary:    "#6A7280",  // slate blue-gray
    secondary:  "#D8C8A8",  // champagne gold
  
    background: "#F7F5F2",  // warm ivory
    text:       "#4A4A4A",
    muted:      "#999999",
  
    googleFonts: ["Cormorant Garamond", "Montserrat"],
  
    scriptFont: "'Cormorant Garamond', Georgia, serif",
    bodyFont:   "'Montserrat', Arial, sans-serif",
  },

  /* ---- 5. Your upload link  (public — NOT a secret) ----------------------
   * Paste the Apps Script Web App /exec URL here after you deploy it
   * (SETUP.md, step 3). The browser calls it to start uploads; the script
   * itself brokers everything, so no Google credentials ever reach guests.
   * Leave "" until you've deployed.
   */
  endpoints: {
    photoUpload: "https://script.google.com/macros/s/AKfycbwlMbCkxrJtScJYxqBjEPW84K9JZzElUJVKAqpf_oBjkX1Ex0kuLvdiMR3Lm-Arog50gw/exec",
  },
};
