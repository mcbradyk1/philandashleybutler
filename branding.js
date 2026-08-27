/* ============================================================================
 *  branding.js  —  applies config.js to the page. You should not need to edit this.
 * ----------------------------------------------------------------------------
 *  Load order in every page's <head>:
 *      <script src="config.js"></script>
 *      <script src="branding.js"></script>     (this file)
 *      <link rel="stylesheet" href="shared.css">
 *
 *  Two phases:
 *   1. Immediately (script runs in <head>): push theme colors/fonts into CSS
 *      custom properties so there's no flash of the default palette.
 *   2. On DOMContentLoaded: fill text, toggle features, set the document title.
 *
 *  Hooks the pages use:
 *   - data-brand="key"        -> textContent set from a value below
 *   - data-brand-html="key"   -> innerHTML set (use for values with emoji/markup)
 *   - data-feature="name"     -> element removed if EVENT_CONFIG.features[name] is false
 *   - data-endpoint="name"    -> element's href set from EVENT_CONFIG.endpoints[name]
 * ========================================================================== */
(function () {
  var C = window.EVENT_CONFIG || {};
  var T = C.theme || {};

  /* ---- Phase 1: theme (runs synchronously, before body paints) ---------- */
  var root = document.documentElement;
  function setVar(name, val) { if (val != null) root.style.setProperty(name, val); }
  /* ---- Phase 1: theme colors, with JS-derived tints (no color-mix needed) --- */
  function hexToRgb(h) {
    h = String(h).trim().replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c){ return c + c; }).join('');
    var n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgba(hex, a) {
    var c = hexToRgb(hex);
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
  }
  function darken(hex, keep) {           // keep=0.82 -> 82% of the color, toward black
    var c = hexToRgb(hex);
    var f = function (v){ return Math.round(v * keep); };
    return 'rgb(' + f(c.r) + ',' + f(c.g) + ',' + f(c.b) + ')';
  }
  
  var primary   = T.primary   || '#7a8f6a';
  var secondary = T.secondary || '#8b7db8';
  
  setVar('--cfg-script-font', T.scriptFont);
  setVar('--cfg-body-font',   T.bodyFont);
  setVar('--cfg-background',   T.background);
  setVar('--cfg-text',         T.text);
  setVar('--cfg-muted',        T.muted);
  
  // Base colors
  setVar('--primary',   primary);
  setVar('--secondary', secondary);
  // Derived shades — these override the color-mix() versions in shared.css
  setVar('--primary-dark',    darken(primary, 0.82));
  setVar('--primary-soft',    rgba(primary, 0.40));
  setVar('--primary-shadow',  rgba(primary, 0.25));
  setVar('--secondary-dark',  darken(secondary, 0.80));
  setVar('--secondary-soft',  rgba(secondary, 0.30));
  setVar('--secondary-glow',  rgba(secondary, 0.40));

  /* ---- Optional: load fonts from Google Fonts by name ------------------ */
  var gfonts = T.googleFonts || [];
  if (gfonts.length) {
    var fam = gfonts.map(function (f) {
      return 'family=' + encodeURIComponent(f).replace(/%20/g, '+');
    }).join('&');
  
    var pre1 = document.createElement('link');
    pre1.rel = 'preconnect'; pre1.href = 'https://fonts.googleapis.com';
    var pre2 = document.createElement('link');
    pre2.rel = 'preconnect'; pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://fonts.googleapis.com/css2?' + fam + '&display=swap';
  
    document.head.appendChild(pre1);
    document.head.appendChild(pre2);
    document.head.appendChild(css);
  }

  /* ---- Value lookup for data-brand keys --------------------------------- */
  var txt = C.text || {};
  var VALUES = {
    eventName:      C.eventName || '',
    subtitle:       C.subtitle || '',
    eventDate:      C.eventDate || '',
    siteDomain:     C.siteDomain || '',
    heart:          txt.heart || '',
    welcome:        txt.welcome || '',
    footer:         txt.footer || '',
    galleryTagline: txt.galleryTagline || '',
    galleryRefresh: txt.galleryRefresh || '',
    boothTagline:   txt.boothTagline || '',
    boothRefresh:   txt.boothRefresh || '',
    uploadPatience: txt.uploadPatience || '',
    uploadHeading:  txt.uploadHeading || '',
    uploadHint:     txt.uploadHint || '',
    uploadSubhint:  txt.uploadSubhint || '',
    // Convenience combos:
    eventDateLine:  (C.eventName ? C.eventName + ' \u00B7 ' : '') + (C.eventDate || ''),
    welcomeHeart:   (txt.welcome || '') + (txt.heart ? ' ' + txt.heart : ''),
    footerHeart:    (txt.footer  || '') + (txt.heart ? ' ' + txt.heart : ''),
  };

  function apply() {
    /* document.title */
    if (C.eventName) {
      var base = document.title || '';
      document.title = base ? base + ' \u00B7 ' + C.eventName : C.eventName;
    }

    /* text nodes */
    document.querySelectorAll('[data-brand]').forEach(function (el) {
      var v = VALUES[el.getAttribute('data-brand')];
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll('[data-brand-html]').forEach(function (el) {
      var v = VALUES[el.getAttribute('data-brand-html')];
      if (v != null) el.innerHTML = v;
    });

    /* tile text (icon/title/sub) for landing page: data-tile="uploadPhotos" */
    var tiles = txt.tiles || {};
    document.querySelectorAll('[data-tile]').forEach(function (el) {
      var t = tiles[el.getAttribute('data-tile')];
      if (!t) return;
      var i = el.querySelector('[data-tile-icon]'); if (i && t.icon)  i.textContent = t.icon;
      var h = el.querySelector('[data-tile-title]');if (h && t.title) h.textContent = t.title;
      var s = el.querySelector('[data-tile-sub]');  if (s && t.sub)   s.textContent = t.sub;
    });

    /* feature toggles: remove element if its feature is off */
    var feats = C.features || {};
    document.querySelectorAll('[data-feature]').forEach(function (el) {
      if (feats[el.getAttribute('data-feature')] === false) el.remove();
    });
    /* remove a section only if ALL of its listed features are off */
    document.querySelectorAll('[data-feature-any]').forEach(function (el) {
      var any = el.getAttribute('data-feature-any').split(',').some(function (n) {
        return feats[n.trim()] !== false;
      });
      if (!any) el.remove();
    });

    /* any .hub left with exactly one visible tile -> centered single layout */
    document.querySelectorAll('.hub').forEach(function (hub) {
      if (hub.querySelectorAll('a').length === 1) hub.classList.add('single');
    });

    /* endpoint wiring: set href / expose value */
    var eps = C.endpoints || {};
    document.querySelectorAll('[data-endpoint]').forEach(function (el) {
      var url = eps[el.getAttribute('data-endpoint')];
      if (url) el.setAttribute('href', url);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  /* Expose config to inline page scripts (e.g. upload.html reads the endpoint). */
  window.eventEndpoint = function (name) {
    return (C.endpoints || {})[name] || '';
  };
})();
