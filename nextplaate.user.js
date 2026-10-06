// ==UserScript==
// @name         NextPlaate
// @namespace    nextplaate
// @icon         data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20200%20200%22%3E%3Ccircle%20cx=%22100%22%20cy=%22100%22%20r=%2298%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%22100%22%20cy=%22100%22%20r=%2292%22%20fill=%22%233781c5%22/%3E%3Ccircle%20cx=%22100%22%20cy=%22100%22%20r=%2286%22%20fill=%22%23529bde%22/%3E%3Cpath%20d=%22M100%2014a86%2086%200%200%201%2086%2086%2086%2086%200%200%201-30%2065C150%20110%20130%2060%20100%2014z%22%20fill=%22%2382c3ff%22/%3E%3Crect%20x=%2250%22%20y=%2276%22%20width=%2288%22%20height=%2266%22%20rx=%2210%22%20fill=%22%23fff%22/%3E%3Crect%20x=%2266%22%20y=%2266%22%20width=%2230%22%20height=%2214%22%20rx=%224%22%20fill=%22%23fff%22/%3E%3Ccircle%20cx=%2294%22%20cy=%22109%22%20r=%2219%22%20fill=%22none%22%20stroke=%22%233781c5%22%20stroke-width=%229%22/%3E%3Crect%20x=%22124%22%20y=%2284%22%20width=%2210%22%20height=%227%22%20fill=%22%233781c5%22/%3E%3Cpath%20d=%22M160%2040v44M138%2062h44%22%20stroke=%22%23fff%22%20stroke-width=%2226%22%20stroke-linecap=%22round%22/%3E%3Cpath%20d=%22M160%2040v44M138%2062h44%22%20stroke=%22%233781c5%22%20stroke-width=%2214%22%20stroke-linecap=%22round%22/%3E%3C/svg%3E
// @version      5.9
// @license      MIT
// @description  PlatesMania - NextPlaate: post and browse PlatesMania faster. Plate check for 96 countries, Google Lens, batch upload, descriptions, tags, plate preview, lookup links, series and profile statistics, likes, country flags, member shortcuts.
// @description:fr  PlatesMania - NextPlaate : publier et naviguer plus vite sur PlatesMania. Vérification de plaque (96 pays), Google Lens, envoi par lots, descriptions, tags, aperçu de plaque, liens de recherche, séries et statistiques de profil, likes, drapeaux des pays, raccourcis de membres.
// @match        https://platesmania.com/*
// @match        https://*.platesmania.com/*
// @match        https://www.google.com/*
// @match        https://www.google.*/*
// @match        https://lens.google.com/*
// @require      https://cdn.jsdelivr.net/npm/libheif-js@1.19.8/libheif-wasm/libheif-bundle.js
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';
  if (window.top !== window.self) return;           // ignore iframes
  if (document.getElementById('pmg-host')) return;  // already loaded
  // A Google page (the script also matches Google, for Lens): the photo goes into Google's box, nothing else starts here
  if (!/(^|\.)platesmania\.com$/.test(location.hostname)) { lensOnGoogle(); return; }

  /* =====================================================================
   *  STORAGE  (survives page navigation)
   * ===================================================================== */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('pmg_' + k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('pmg_' + k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem('pmg_' + k); } catch (e) {} }
  };
  // Console log of what the script sees (keys, window, drawers). Off with: localStorage.setItem('pmg_debug', '0')
  // logs are on in the dev build only: scripts/build.mjs sets the default ('1' dev, '0' public)
  const log = (...args) => { if (store.get('debug', '0') === '1') console.log('[NextPlaate]', ...args); };
  const loadPhoto = k => { try { return JSON.parse(store.get(k, 'null')); } catch (e) { return null; } };

  const state = {
    front: loadPhoto('front'),
    rear: loadPhoto('rear'),
    mode: null // 'front' | 'rear' | null  (selection mode)
  };

  // Photos already handled for the current pair (prevents auto-edit loops)
  const doneSet = () => { try { return new Set(JSON.parse(store.get('done', '[]'))); } catch (e) { return new Set(); } };
  const markDone = id => { const s = doneSet(); s.add(id); store.set('done', JSON.stringify([...s])); };
  const clearDone = () => { store.set('done', '[]'); store.set('filled', '[]'); store.set('returnPending', '0'); };

  // Photos whose description was actually filled (used to know when the whole pair is finished)
  const filledSet = () => { try { return new Set(JSON.parse(store.get('filled', '[]'))); } catch (e) { return new Set(); } };
  const markFilled = id => { const s = filledSet(); s.add(id); store.set('filled', JSON.stringify([...s])); };

  /* =====================================================================
   *  SETTINGS  (the user's choices, in one place)
   *    A setting is defined once, with its default and the label shown in the Settings drawer:
   *      settings.define('feature_likes', '1', 'Likes', 'features')
   *    and read anywhere with settings.get(id) (a string) or settings.on(id) (true when '1').
   *    The value is kept in the browser (key pmg_set_<id>). Every feature that has an id and a label
   *    gets a "feature_<id>" setting from registerFeature: that is how a feature is switched off.
   * ===================================================================== */
  const settings = (() => {
    const defs = [];
    const find = id => defs.find(d => d.id === id);
    const api = {
      define(id, def, label, group) { if (!find(id)) defs.push({ id, def: String(def), label, group: group || 'general' }); },
      list: group => defs.filter(d => !group || d.group === group),
      get: id => store.get('set_' + id, (find(id) || { def: '' }).def),
      on: id => api.get(id) === '1',
      set: (id, value) => store.set('set_' + id, String(value)),
      isDefault: id => api.get(id) === (find(id) || { def: '' }).def
    };
    return api;
  })();
  /* =====================================================================
   *  WHERE AM I  (which kind of PlatesMania page is open, decided once when the script loads)
   * ===================================================================== */
  const here = {
    country: (location.pathname.match(/^\/([a-z]{2})\//i) || [])[1] || '',   // country code of the page (fr, de...)
    add: /^\/[a-z]{2}\/add\/?$/i.test(location.pathname),   // upload page of a country
    addAny: /^\/([a-z]{2}\/)?add\/?$/i.test(location.pathname),   // that one, or /add (the page that comes before the choice of a country)
    profile: /^\/user\d+\/?$/i.test(location.pathname),   // a member's profile page
    gallery: /\/gallery(\.php)?$/i.test(location.pathname) || /\/user\d+\/?$/i.test(location.pathname),
    photo: (location.pathname.match(/\/nomer(\d+)/i) || [])[1] || null,    // photo page: the photo id
    // Edit page: <textarea name="dop"> + <input type="hidden" name="id" value="{photo id}">
    edit: !!(document.querySelector('textarea[name="dop"]') && document.querySelector('form input[name="id"]'))
  };
  /* =====================================================================
   *  APP  (feature registry: a feature declares its ribbon groups, its key actions and its Esc behaviour)
   * ===================================================================== */
  // A feature is registered when the script loads, but touches nothing on the page then:
  // mountApp() builds the panel first, and only then runs each feature's init().
  //   registerFeature({
  //     id: 'likes', label: 'Likes',   // a feature with an id and a label can be switched off in Settings
  //     requires: ['details'],          // off when one of these is off
  //     locked: true,                   // cannot be switched off (the Settings drawer itself)
  //     groups:   [{ drawer: 'pair', title: 'Photos', build: () => nodes }], // controls, in a drawer of the bar
  //     keys:     { select: { code: 'KeyS', label: 'Select photos', run: () => true, hintOrder: 10 } },
  //               // run() returns true when it handled the key. The key can be changed by the user (Shortcuts drawer).
  //     onEscape: () => true, escOrder: 10,                                 // true when it handled Esc (lower runs first)
  //     init:     () => { ... }                                             // wires the controls, once the panel exists
  //   })
  const features = [];
  const actions = {};       // action id -> key spec (with .bound: the key it currently uses)
  let keyMap = {};          // e.code -> action, rebuilt when a key changes
  let escapeChain = [];     // features with onEscape, in escOrder
  const app = { modal: null, capture: null }; // modal: { onKey(e) } while a full window owns the keyboard; capture: waits for a new key

  const registerFeature = f => {
    features.push(f);
    if (f.id && f.label && !f.locked) settings.define('feature_' + f.id, '1', f.label, 'features');
  };
  // A feature is on when the user has not switched it off and everything it requires is on. A feature without an id is always on.
  const featureOn = id => {
    const f = features.find(x => x.id === id);
    return !f || ((f.locked || settings.on('feature_' + id)) && (f.requires || []).every(featureOn));
  };

  // The key an action uses: the user's choice if any, else its default
  const bindingOf = id => store.get('kb_' + id, actions[id].code);

  function rebuildKeys() {
    keyMap = {};
    Object.keys(actions).forEach(id => {
      actions[id].bound = bindingOf(id);
      keyMap[actions[id].bound] = { id, ...actions[id] };
    });
  }

  function mountApp() {
    const active = features.filter(f => !f.id || featureOn(f.id));   // a switched-off feature adds no control, no key, no Esc step
    log('features off', features.filter(f => f.id && !active.includes(f)).map(f => f.id).join(' ') || 'none');
    active.forEach(f => Object.assign(actions, f.keys || {}));
    rebuildKeys();
    log('actions', Object.entries(actions).map(([id, a]) => id + '=' + a.bound).join(' '));
    mountRibbon(active);
    active.forEach(f => f.init && f.init());
    escapeChain = active.filter(f => f.onEscape).sort((a, b) => (a.escOrder || 0) - (b.escOrder || 0));
  }
  /* =====================================================================
   *  KEYBOARD  (one listener for the whole script)
   *    Order: a key being chosen (Shortcuts drawer), then the open window (batch manager), then Esc,
   *    then the key actions of the features. Ignored while typing in a text field. Keys are read from
   *    e.code: the physical key, on any layout.
   * ===================================================================== */
  // Letter printed on the physical left key ("previous page"): Q on AZERTY, A on QWERTY. Learned from the real layout.
  let prevKey = /^fr|^be/i.test(navigator.language || '') ? 'Q' : 'A';
  if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
    navigator.keyboard.getLayoutMap().then(map => {
      const k = map.get('KeyA');
      if (k && /^[a-z]$/i.test(k)) prevKey = k.toUpperCase();
    }).catch(() => {});
  }

  // Name shown for a key code: KeyS -> S, Digit3 -> 3, ArrowLeft -> ←
  const keyName = code => {
    if (code === 'KeyA') return prevKey;   // the physical left key is labelled for YOUR layout
    if (!code) return '?';
    const arrows = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' };
    return arrows[code] || code.replace(/^Key|^Digit|^Numpad/, '');
  };
  // Ctrl+A is the letter A, whatever the layout: on AZERTY that key has the code KeyQ
  const isSelectAll = e => (e.key || '').toLowerCase() === 'a';
  // Text fields only: a checkbox, a select or a slider does not take the keys
  const isTextField = el => !!el && (el.isContentEditable || el.tagName === 'TEXTAREA' ||
    (el.tagName === 'INPUT' && /^(text|number|search|url|email|password)$/i.test(el.type)));

  // The focused control: from the event target, down through every shadow root that holds the focus
  function deepActive(el) {
    while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
    return el;
  }

  // Capture phase on window: we see the key before the site does, so a site script cannot swallow it
  window.addEventListener('keydown', e => {
    log('key', e.code, 'target', e.target.tagName, e.target.id || '', 'modal', !!app.modal, 'capture', !!app.capture);
    if (app.capture) { e.preventDefault(); e.stopPropagation(); app.capture(e); return; }
    if (app.modal) {
      if ((e.ctrlKey || e.metaKey) && isSelectAll(e)) e.preventDefault();   // never the page text
      app.modal.onKey(e); e.stopPropagation(); return;
    }
    if (e.key === 'Escape') {
      for (const f of escapeChain) if (f.onEscape()) return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.code === 'KeyA' && /^[a-z]$/i.test(e.key || '') && e.key.toUpperCase() !== prevKey) {
      prevKey = e.key.toUpperCase();
    }
    // Focus inside the panel or inside a card of the script (each is a shadow root): the event target is the host of that root, so
    // look at the control that has the focus, however deep
    const field = deepActive(e.target);
    if (isTextField(field)) return;
    const k = keyMap[e.code];
    log('  action for', e.code, '=', k ? k.id : 'none');
    if (k && k.run(e)) {
      e.preventDefault(); e.stopPropagation();
      if (e.target === host && host.shadowRoot.activeElement) host.shadowRoot.activeElement.blur();   // no ring left on the icon
    }
  }, true);
  /* =====================================================================
   *  BRIDGE  (ask a job of another site, in another tab, and wait for the answer)
   *    The browser keeps sites apart: a PlatesMania page cannot read what a Google page holds. The script runs on both and shares
   *    one small memory (GM_setValue / GM_getValue), so a job is a request left there and an answer left back:
   *
   *      this side      bridgeAsk('lens', { photo }, 'https://www.google.com/?x', { background: true }).then(titles => ...)
   *      other side     const request = bridgePending('lens');               // null when nobody asked
   *                     ... do the work on that page ...
   *                     bridgeAnswer('lens', request, titles);
   *
   *    The tab that was opened for the job is closed once the answer is in (opts.close, default true); when nothing comes back it stays
   *    open, so the user can see the page. A job has a name ('lens'); a new request replaces the old one; an answer carries the stamp of its request, so an answer to an
   *    older request is never taken for the new one. Only function declarations: the other side starts from core/00-open.js,
   *    before the rest of the script is set up. Needs GM_setValue, GM_getValue (and GM_openInTab) in the header.
   * ===================================================================== */
  function bridgeKey(job, part) { return 'br_' + job + '_' + part; }

  // Leaves the request, opens the page of the other site, resolves with the answer (rejects after opts.timeout seconds, default 120),
// then closes that tab unless opts.close is false
  function bridgeAsk(job, payload, url, opts) {
    const o = Object.assign({ background: false, timeout: 120, close: true }, opts);
    const stamp = Date.now();
    GM_setValue(bridgeKey(job, 'req'), JSON.stringify({ stamp, payload }));
    GM_setValue(bridgeKey(job, 'res'), '');
    let tab = null;
    try { if (typeof GM_openInTab === 'function') tab = GM_openInTab(url, { active: !o.background, insert: true, setParent: true }); } catch (e) { /* the popup below */ }
    if (!tab) tab = window.open(url, '_blank');
    if (!tab) return Promise.reject(new Error('could not open the tab'));
    return new Promise((ok, no) => {
      let waited = 0;
      const timer = setInterval(() => {
        const raw = GM_getValue(bridgeKey(job, 'res'), '');
        const got = raw ? JSON.parse(raw) : null;
        if (got && got.stamp === stamp) {
          clearInterval(timer);
          if (o.close) { try { tab.close(); } catch (e) { /* the user may have closed it already */ } }
          ok(got.data);
        }
        else if (++waited > o.timeout) { clearInterval(timer); no(new Error('no answer')); }
      }, 1000);
    });
  }

  // The other side: the request that waits, { stamp, payload }; null when there is none, when it is older than maxAge seconds
  // (default 180) or when it was answered already
  function bridgePending(job, maxAge) {
    const raw = GM_getValue(bridgeKey(job, 'req'), '');
    if (!raw) return null;
    const request = JSON.parse(raw);
    if (Date.now() - request.stamp > (maxAge || 180) * 1000 || GM_getValue(bridgeKey(job, 'done'), 0) === request.stamp) return null;
    return request;
  }

  function bridgeAnswer(job, request, data) {
    GM_setValue(bridgeKey(job, 'res'), JSON.stringify({ stamp: request.stamp, data }));
    GM_setValue(bridgeKey(job, 'done'), request.stamp);
  }
  /* =====================================================================
   *  CODE GENERATION
   * ===================================================================== */
  function block(title, o, alt) {
    const link = `https://platesmania.com/${o.lang}/nomer${o.id}`;
    const img = `https://${o.srv}.platesmania.com/${o.folder}/m/${o.id}.jpg`;
    const tags = $('tag').value.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
    const head = tags.length ? tags.map(t => `<a href="/gallery.php?dop=${t}">#${t}</a>`).join(' ') + ' \n' : '';
    return `${head}${$('place').value.trim()}

<font color="#b8860b">━━━━━━ ◆ ━━━━━━</font>
<font color="#7a1f1f"><b>${title}</b></font>
<font color="#b8860b">━━━━━━ ◆ ━━━━━━</font>
<a href='${link}'><img src='${img}' width=230 height=175 border=0 alt='${alt}'></a>
<font color="#b8860b">━━━━━━━━━━━━━━━━━</font>`;
  }

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // The countries of the site: the code in its address (/fr/...) and its name. One per line.
  const COUNTRIES = [
    { code: 'al', name: 'Albania' },
    { code: 'dz', name: 'Algeria' },
    { code: 'ad', name: 'Andorra' },
    { code: 'ar', name: 'Argentina' },
    { code: 'am', name: 'Armenia' },
    { code: 'au', name: 'Australia' },
    { code: 'at', name: 'Austria' },
    { code: 'az', name: 'Azerbaijan' },
    { code: 'bs', name: 'Bahamas' },
    { code: 'bh', name: 'Bahrain' },
    { code: 'by', name: 'Belarus' },
    { code: 'be', name: 'Belgium' },
    { code: 'ba', name: 'Bosnia and Herzegovina' },
    { code: 'br', name: 'Brazil' },
    { code: 'bg', name: 'Bulgaria' },
    { code: 'kh', name: 'Cambodia' },
    { code: 'ca', name: 'Canada' },
    { code: 'cl', name: 'Chile' },
    { code: 'cn', name: 'China' },
    { code: 'hr', name: 'Croatia' },
    { code: 'cy', name: 'Cyprus' },
    { code: 'cz', name: 'Czech Republic' },
    { code: 'dk', name: 'Denmark' },
    { code: 'eg', name: 'Egypt' },
    { code: 'ee', name: 'Estonia' },
    { code: 'fi', name: 'Finland' },
    { code: 'fr', name: 'France' },
    { code: 'ge', name: 'Georgia' },
    { code: 'de', name: 'Germany' },
    { code: 'gi', name: 'Gibraltar (UK)' },
    { code: 'gr', name: 'Greece' },
    { code: 'gu', name: 'Guam (USA)' },
    { code: 'gg', name: 'Guernsey (UK)' },
    { code: 'hk', name: 'Hong Kong (CN)' },
    { code: 'hu', name: 'Hungary' },
    { code: 'is', name: 'Iceland' },
    { code: 'id', name: 'Indonesia' },
    { code: 'ir', name: 'Iran' },
    { code: 'iq', name: 'Iraq' },
    { code: 'ie', name: 'Ireland' },
    { code: 'il', name: 'Israel' },
    { code: 'it', name: 'Italy' },
    { code: 'jp', name: 'Japan' },
    { code: 'je', name: 'Jersey (UK)' },
    { code: 'kz', name: 'Kazakhstan' },
    { code: 'ke', name: 'Kenya' },
    { code: 'kw', name: 'Kuwait' },
    { code: 'kg', name: 'Kyrgyzstan' },
    { code: 'la', name: 'Laos' },
    { code: 'lv', name: 'Latvia' },
    { code: 'li', name: 'Liechtenstein' },
    { code: 'lt', name: 'Lithuania' },
    { code: 'lu', name: 'Luxembourg' },
    { code: 'my', name: 'Malaysia' },
    { code: 'mt', name: 'Malta' },
    { code: 'mx', name: 'Mexico' },
    { code: 'md', name: 'Moldova' },
    { code: 'mc', name: 'Monaco' },
    { code: 'mn', name: 'Mongolia' },
    { code: 'me', name: 'Montenegro' },
    { code: 'ma', name: 'Morocco' },
    { code: 'nl', name: 'Netherlands' },
    { code: 'nz', name: 'New Zealand' },
    { code: 'mk', name: 'North Macedonia' },
    { code: 'mp', name: 'Northern Mariana Islands (USA)' },
    { code: 'no', name: 'Norway' },
    { code: 'ps', name: 'Palestinian Authority' },
    { code: 'pl', name: 'Poland' },
    { code: 'pt', name: 'Portugal' },
    { code: 'qa', name: 'Qatar' },
    { code: 'ro', name: 'Romania' },
    { code: 'ru', name: 'Russia' },
    { code: 'sm', name: 'San Marino' },
    { code: 'sa', name: 'Saudi Arabia' },
    { code: 'rs', name: 'Serbia' },
    { code: 'sc', name: 'Seychelles' },
    { code: 'sg', name: 'Singapore' },
    { code: 'sk', name: 'Slovakia' },
    { code: 'si', name: 'Slovenia' },
    { code: 'kr', name: 'South Korea' },
    { code: 'es', name: 'Spain' },
    { code: 'se', name: 'Sweden' },
    { code: 'ch', name: 'Switzerland' },
    { code: 'tj', name: 'Tajikistan' },
    { code: 'th', name: 'Thailand' },
    { code: 'tr', name: 'Turkey' },
    { code: 'ae', name: 'UAE' },
    { code: 'us', name: 'USA' },
    { code: 'su', name: 'USSR' },
    { code: 'ua', name: 'Ukraine' },
    { code: 'uk', name: 'United Kingdom' },
    { code: 'uz', name: 'Uzbekistan' },
    { code: 'va', name: 'Vatican' },
    { code: 'vn', name: 'Vietnam' },
    { code: 'ax', name: 'Åland (FI)' },
    { code: 'xx', name: 'Non-recognized and partially recognized states' }
  ];
  const cName = code => { const c = COUNTRIES.find(x => x.code === code); return c ? c.name : String(code).toUpperCase(); };
  const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2);
  /* =====================================================================
   *  SITE REQUESTS  (every request to PlatesMania goes through here)
   *    One request at a time, with a pause between two of them. If the site answers with a Cloudflare
   *    check or the rate limit (error 1015), every request stops for a while, and the state is kept
   *    in the browser so the next page knows it too.
   * ===================================================================== */
  const SITE_GAP_MS = 3000;                 // between two requests to the site
  const SITE_COOLDOWN_MS = 15 * 60 * 1000;  // after a block: no request for this long
  const SITE_TIMEOUT_MS = 15000;
  const siteQueue = [];
  let siteBusy = false, siteLast = 0;
  const siteSleep = ms => new Promise(r => setTimeout(r, ms));
  const siteBlockedUntil = () => (+store.get('siteBlock', '0') || 0) + SITE_COOLDOWN_MS;
  const SITE_BLOCK_RE = /Error 1015|rate limited|just a moment|attention required|cf-challenge|checking your browser/i;

  // Resolves with the text of the page. Rejects with a clear message when the site asks to wait.
  function siteFetch(url) {
    if (Date.now() < siteBlockedUntil()) {
      const mins = Math.ceil((siteBlockedUntil() - Date.now()) / 60000);
      return Promise.reject(new Error(`the site asked to wait: try again in about ${mins} min`));
    }
    return new Promise((resolve, reject) => { siteQueue.push({ url, resolve, reject }); pumpSite(); });
  }

  async function pumpSite() {
    if (siteBusy) return;
    siteBusy = true;
    while (siteQueue.length) {
      const job = siteQueue.shift();
      const wait = siteLast + SITE_GAP_MS - Date.now();
      if (wait > 0) await siteSleep(wait);
      siteLast = Date.now();
      try {
        const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), SITE_TIMEOUT_MS);
        const res = await fetch(job.url, { credentials: 'same-origin', signal: ctrl.signal });
        clearTimeout(timer);
        const text = await res.text();
        const blocked = res.status === 429 || SITE_BLOCK_RE.test(text);
        if (typeof devLog === 'function') devLog({ url: job.url, status: res.status, blocked, bytes: text.length });   // dev build only
        if (blocked) {
          store.set('siteBlock', String(Date.now()));
          job.reject(new Error('the site asked to wait (check or rate limit)'));
          while (siteQueue.length) siteQueue.shift().reject(new Error('the site asked to wait (check or rate limit)'));
          break;
        }
        if (!res.ok) job.reject(new Error('HTTP ' + res.status));
        else job.resolve(text);
      } catch (e) {
        job.reject(new Error(e.name === 'AbortError' ? 'the site did not answer in time' : e.message));
      }
    }
    siteBusy = false;
  }
  /* =====================================================================
   *  LOOKUP SITES  (public pages where a plate can be looked up, by country)
   *    Only links: nothing is sent to any of them before the user clicks, and the script reads nothing from them.
   *    A site is { name, url } with {plate} where the plate goes, and fmt, how the plate is written there:
   *      'squash' (default)  letters and digits only, in capitals: AB-12 CDE -> AB12CDE
   *      'hyphen'            the parts joined by hyphens: AB 123 CD -> AB-123-CD
   *      'raw'               as the form gives it
   *    Universal ones are open or free image searches; the country ones are the ones that answered when tried. The registers that
   *    answer in JSON (NL, IL) are in src/lib/registries.js. A site that fails or goes away is taken off here, or hidden by the user in Settings. The list starts from the public
   *    userscript "Platesmania Lookup Toolbox" (links only; its fiches that call an API are not part of it: see
   *    docs/ANALYSE-SCRIPTS-PUBLICS.md).
   * ===================================================================== */
  const LOOKUP_SITES = {
    '*': [
      { name: 'Google Images', url: 'https://www.google.com/search?tbm=isch&q="{plate}"', fmt: 'raw' },
      { name: 'Wikimedia Commons', url: 'https://commons.wikimedia.org/w/index.php?search="{plate}"&ns6=1', fmt: 'raw' },
      { name: 'DuckDuckGo Images', url: 'https://duckduckgo.com/?q="{plate}"&iax=images&ia=images', fmt: 'raw' },
      { name: 'Yandex Images', url: 'https://yandex.com/images/search?text="{plate}"', fmt: 'raw' },
      { name: 'Flickr', url: 'https://www.flickr.com/search/?text={plate}', fmt: 'raw' },
      { name: 'Autogespot', url: 'https://www.autogespot.com/spots?licenseplate={plate}' }
    ],
    nl: [
      { name: 'Finnik', url: 'https://finnik.nl/kenteken/{plate}' },
      { name: 'Autoweek', url: 'https://www.autoweek.nl/kentekencheck/{plate}' },
      { name: 'voertuig.net', url: 'https://voertuig.net/kenteken/{plate}' },
      { name: 'Kentekencheck.info', url: 'https://www.kentekencheck.info/kenteken/{plate}' },
      { name: 'Kentekencheck.nu', url: 'https://www.kentekencheck.nu/kenteken/{plate}' },
      { name: 'Qenteken', url: 'https://www.qenteken.nl/kentekencheck/{plate}' },
      { name: 'RDW', url: 'https://www.rdwdata.nl/kenteken/{plate}' }
    ],
    se: [
      { name: 'car.info', url: 'https://www.car.info/?s={plate}' },
      { name: 'biluppgifter.se', url: 'https://biluppgifter.se/fordon/{plate}' },
      { name: 'Transportstyrelsen', url: 'https://fordon-fu-regnr.transportstyrelsen.se/?ts-regnr-sok={plate}' }
    ],
    ua: [
      { name: 'carplates.app', url: 'https://ua.carplates.app/en/number/{plate}' },
      { name: 'baza-gai.com.ua', url: 'https://baza-gai.com.ua/nomer/{plate}' },
      { name: 'auto-inform.com.ua', url: 'https://auto-inform.com.ua/search/{plate}' }
    ],
    nz: [{ name: 'Carjam', url: 'https://www.carjam.co.nz/car/?plate={plate}' }],
    uk: [
      { name: 'GOV.UK MOT history', url: 'https://www.check-mot.service.gov.uk/results?registration={plate}' },
      { name: 'checkcardetails', url: 'https://www.checkcardetails.co.uk/cardetails/{plate}' },
      { name: 'totalcarcheck', url: 'https://totalcarcheck.co.uk/FreeCheck?regno={plate}' },
      { name: 'checkhistory', url: 'https://checkhistory.uk/vehicle/{plate}' },
      { name: 'carhistorycheck', url: 'https://carhistorycheck.co.uk/confirm-vehicle/?vrm={plate}' },
      { name: 'carbaba', url: 'https://carbaba.co.uk/?reg={plate}' }
    ],
    dk: [
      { name: 'digitalservicebog', url: 'https://app.digitalservicebog.dk/search?country=dk&Registration={plate}' },
      { name: 'esyn.dk', url: 'https://findsynsrapport.esyn.dk/result?registration={plate}' }
    ],
    no: [
      { name: 'Statens vegvesen', url: 'https://www.vegvesen.no/en/vehicles/buy-and-sell/vehicle-information/check-vehicle-information/?registreringsnummer={plate}' },
      { name: 'regnr.info', url: 'https://regnr.info/{plate}' }
    ],
    fr: [
      { name: 'immatriculation-auto.info', url: 'https://immatriculation-auto.info/vehicle/{plate}' },
      { name: 'Carter-Cash', url: 'https://www.carter-cash.com/pieces-auto/?plate={plate}', fmt: 'hyphen' }
    ],
    es: [{ name: 'Carter-Cash', url: 'https://www.carter-cash.es/piezas-auto/?plate={plate}' }],
    it: [{ name: 'Carter-Cash', url: 'https://www.carter-cash.it/ricambi-auto/?plate={plate}' }],
    fi: [{ name: 'Biltema', url: 'https://www.biltema.fi/sv-fi/rekosok-bil/{plate}' }],
    sk: [
      { name: 'overenie.digital', url: 'https://overenie.digital/over/sk/ecv/{plate}' },
      { name: 'stkonline', url: 'https://www.stkonline.sk/spz/{plate}' }
    ],
    ie: [
      { name: 'cartell.ie', url: 'https://www.cartell.ie/ssl/servlet/beginStarLookup?registration={plate}' },
      { name: 'motorcheck.ie', url: 'https://www.motorcheck.ie/free-car-check/?vrm={plate}' }
    ],
    is: [{ name: 'island.is', url: 'https://island.is/uppfletting-i-oekutaekjaskra?vq={plate}' }],
    ch: [{ name: 'swisscarinfo', url: 'https://swisscarinfo.ch/en/search?type=all&q={plate}' }]
  };

  // The plate as a site wants it
  function lookupPlate(plate, fmt) {
    if (fmt === 'raw') return plate;
    const clean = String(plate).toUpperCase().replace(/[\s-]+/g, fmt === 'hyphen' ? '-' : '');
    return fmt === 'hyphen' ? clean.replace(/^-|-$/g, '') : clean;
  }

  // The sites for a country: its own, then the ones for every country; { key, name, href }
  function lookupFor(cc, plate) {
    const all = [...(LOOKUP_SITES[cc] || []).map(s => ({ ...s, cc })), ...LOOKUP_SITES['*'].map(s => ({ ...s, cc: '*' }))];
    return all.map(s => ({ key: s.cc + '|' + s.name, name: s.name, href: s.url.replace('{plate}', encodeURIComponent(lookupPlate(plate, s.fmt))) }));
  }
  /* =====================================================================
   *  PHOTO DETECTION
   * ===================================================================== */
  // Works on the main photo (/m/) and on thumbnails (/s/): both sit inside a link to nomerXXXX
  function findPhoto(el) {
    if (!el || !el.closest) return null;
    let img = el.closest('img');
    if (!img) { const a = el.closest('a'); if (a) img = a.querySelector('img'); }
    if (!img || !img.src) return null;
    const m = img.src.match(/\/\/(img\d+)\.platesmania\.com\/(\d+)\/\w\/(\d+)\.jpg/i);
    if (!m) return null;
    const a = img.closest('a');
    const lm = ((a && a.href) || location.href).match(/platesmania\.com\/([a-z]{2})\//i);
    return {
      img,
      photo: { srv: m[1], folder: m[2], id: m[3], lang: lm ? lm[1] : 'de',
               alt: (img.alt || '').replace(/['"<>]/g, '').trim(), thumb: img.src }
    };
  }

  /* =====================================================================
   *  PLATE FORMAT  (how the plate typed in the upload form is written, to search it)
   *    Rules from "Notification Doubles Plaques" (MIT), rewritten here as small functions.
   *    A country without a rule uses the plain plate field of its form.
   * ===================================================================== */
  const fieldVal = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const shownVal = id => { const el = document.getElementById(id); return el && el.offsetParent !== null ? el.value.trim() : ''; };
  const squash = s => s.replace(/[\s-]+/g, '').toUpperCase();     // "ab-123 cd" -> "AB123CD"
  const joinParts = parts => parts.filter(Boolean).join(' ');
  // the site writes a space where letters meet digits and none inside a run of letters (HN, not H N): 'A 752 H N' -> 'A 752 HN'
  const spaceOut = s => s.replace(/\s+/g, '').replace(/(?<=\p{L})(?=\d)|(?<=\d)(?=\p{L})/gu, ' ');
  // a select shows its label (BJ, VZ...), which is what the site expects; its value is an internal code
  const selText = id => { const el = document.getElementById(id); if (!el) return ''; if (el.tagName === 'SELECT') { const o = el.options[el.selectedIndex]; return o && o.value ? o.text.trim() : ''; } return el.value.trim(); };

  // Forms made of boxes, one menu per character (Iceland, Åland vanity plates): a box left blank between two characters is a space
  // (T BÍRD, ÅLAND 2); a blank at the end is nothing. A menu that is not shown is not a box.
  const boxes = ids => ids.map(id => { const el = document.getElementById(id); return el && el.offsetParent !== null ? el.value || ' ' : ''; }).join('').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');

  const menu = id => { const el = document.getElementById(id); return el && el.offsetParent !== null ? selText(id) : ''; };   // a menu's label, only when the menu is shown (a hidden one keeps an old value)
  // Forms with one menu per character (Iran, Egypt, Saudi Arabia, Iraq): the label of a shown menu in one script ("١ / 1" keeps the
  // part before the slash, or after it), and a run of such menus joined
  const menuPart = (id, side) => { const t = menu(id); if (!t) return ''; const p = t.split('/'); return (side === 'after' ? p[p.length - 1] : p[0]).trim(); };
  const charsOf = (ids, side) => ids.map(id => menuPart(id, side)).filter(t => t && t !== '•' && t !== '-').join('');
  // The menu that chooses the plate type: #ctype on most upload pages, #drop_2 in Andorra and Malta, none in the Netherlands
  const typeMenuEl = () => document.getElementById('ctype') || document.getElementById('drop_2');
  const PLATE_RULES = {};   // country code -> function that reads the plate from the upload form; one file per country, in this folder

  // Any other country: the visible plate fields, read in the order of the page (region, letters, digits...).
  // A field that is not shown (another plate type) is left out. A field with no value is left out.
  const PLATE_FIELD = /nomer|let|digit|region|^b\d|dip|drop|^dig|trl|letter/i;
  const isPlateField = el => PLATE_FIELD.test(el.id || el.name || '');
  function genericPlate() {
    const parts = [];
    for (const el of document.querySelectorAll('input, select')) {
      const key = el.id || el.name || '';
      // a disabled field that is shown holds letters the site wrote itself (ZV of an Irish oldtimer): they are part of the plate
      if (!PLATE_FIELD.test(key) || el.offsetParent === null || getComputedStyle(el).visibility === 'hidden' || key === 'drop_2') continue;   // drop_2 is the plate-type menu of Andorra and Malta
      if (el.tagName === 'SELECT') {
        const opt = el.options[el.selectedIndex];
        if (opt && opt.value) parts.push(opt.value.length > 3 ? opt.text.trim() : opt.value.trim());
      } else if (el.value.trim()) {
        parts.push(el.value.trim());
      }
    }
    return joinParts(parts).toUpperCase();
  }
  // Albania, by type: cars 2011 AA 896 TH; cars 1993 LE 0075 B (region, digits, letter); others: letter, digits
  PLATE_RULES.al = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '1') return joinParts([fieldVal('let1'), fieldVal('digit'), fieldVal('let2')]);
    if (ctype === '4') return joinParts([selText('region'), fieldVal('digit'), fieldVal('let2')]);
    if (ctype === '3') return joinParts([fieldVal('let1'), fieldVal('trl'), fieldVal('digit')]);   // trailers 2011: AG R 547 (the R is written by the site)
    return joinParts([fieldVal('let1'), fieldVal('digit')]);
  };
  // Armenia: ARM 025 for the high officials (the letters are written by the site in a disabled field); the other types are read from their fields
  PLATE_RULES.am = () => shownVal('arm') ? joinParts([shownVal('arm'), shownVal('dig2')]) : spaceOut(genericPlate());
  // Åland: ÅL 12345, ÅLA 1234, ÅS 1234, ÅF 1234: the first letters are written by the site in disabled menus (b1, b2), a third letter is a menu (b3)
  PLATE_RULES.ax = () => joinParts([boxes(['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7']), shownVal('digit')]);   // vanity plates use all seven menus
  // Bosnia: A12-E-345, parts joined by dashes; b1 only when it is shown (a hidden menu keeps a value)
  PLATE_RULES.ba = () => shownVal('num1') || shownVal('num2') ? [shownVal('num1'), menu('ltype'), shownVal('num2')].filter(Boolean).join('-') :   // diplomatic: 11-A-683
    [fieldVal('let1'), shownVal('b1'), fieldVal('let2') || fieldVal('digit')].filter(Boolean).join('-');
  // Belarus: for each type, the visible letter menus, the region menu and the digit field (site's disby1 function, run on each type)
  const BY_TYPES = {
    '1': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Cars (2004)
    '2': { letters: ['b1', 'b2'], region: 'region5', digit: 'digit1', lettersFirst: true },    // Trucks and buses (2004)
    '4': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Electric vehicles (cars)
    '5': { letters: ['b1', 'b3'], region: 'region5', digit: 'digit1', lettersFirst: true },    // Trailers and semitrailers (2004)
    '6': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Motorcycles (2004)
    '7': { letters: ['b1', 'b2'], region: 'region1', digit: 'digit1', lettersFirst: true },    // Special machinery (2004)
    '8': { letters: ['b1', 'b2'], region: 'region5', digit: 'digit1', lettersFirst: true },    // Electric vehicles (trucks and buses)
    '9': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Electric vehicles (motorcycles)
    '12': { letters: ['b3', 'b4'], region: 'region1', digit: 'digit2', lettersFirst: false },  // Transit plates (2004)
    '13': { letters: ['b3', 'b4'], region: 'region3', digit: 'digit1', lettersFirst: false },  // Cars (2000)
    '20': { letters: [], region: 'region6', digit: 'digit1', lettersFirst: false },             // Police
    '3': { letters: ['dip'], region: 'region5', digit: 'digit1', lettersFirst: true },        // Diplomatic: CC 9605-1
    '14': { letters: [], region: 'region4', digit: 'digit1', lettersFirst: false },            // Cars (1992)
    '15': { letters: [], region: 'region4', digit: 'digit2', lettersFirst: false },            // Trucks and buses (1992)
    '16': { letters: [], region: '', digit: 'digit1', lettersFirst: false },                   // Trailers (1992)
    '17': { letters: ['b3', 'b4'], region: 'region1', digit: 'digit2', lettersFirst: false },  // Taxi
    '18': { letters: ['b3', 'b4'], region: '', digit: 'digit2', lettersFirst: false },         // Provisional (the T/BP mark is typed by the site)
    '19': { letters: [], region: '', digit: 'digit2', lettersFirst: false }                    // Foreign citizens and enterprises
  };


  // Belarus: the fields shown depend on the type (taken from the site's own switch function)
  PLATE_RULES.by = () => {
    const ctype = fieldVal('ctype');
    // trailers 2004: A 1057 K-1 (letter, digits, letter, dash region); special machinery: IH-4 3152 (letters, dash region, digits)
    if (ctype === '5') return joinParts([fieldVal('b1'), fieldVal('digit1'), fieldVal('b3')]) + '-' + selText('region5');
    if (ctype === '16') return joinParts([fieldVal('digit1'), selText('b3') + selText('b1')]);   // trailers 1992: 0222 KA (b3 then b1)
    if (ctype === '13') return joinParts([fieldVal('digit1'), selText('region3') + selText('b3') + selText('b4')]);   // cars 2000: 3897 MBI (digits, then the three letters)
    if (ctype === '15') return joinParts([selText('region4'), fieldVal('digit2')]);   // trucks 1992: AC 9877 (letters, then digits)
    // transit 2004: 8AP T 6938 (digit, letters, T set by the site, digits); taxi: 1 TAX 7359; provisional: MK BP 8462; foreign: P 91179
    if (ctype === '12') return joinParts([menu('region1') + shownVal('b3') + shownVal('b4'), shownVal('trz'), shownVal('digit2')]);
    if (ctype === '17') return joinParts([selText('region1'), shownVal('tx') + selText('b3') + selText('b4'), shownVal('digit2')]);   // taxi: 1 TAX 7359 (region menu, T from tx + the two letters, digits)
    if (ctype === '18') return joinParts([shownVal('b3') + shownVal('b4'), shownVal('trz'), shownVal('digit2')]);
    if (ctype === '19') return joinParts([selText('nonr'), shownVal('digit2')]);
    if (ctype === '7') return joinParts([selText('b1') + selText('b2') + (selText('region1') ? '-' + selText('region1') : ''), fieldVal('digit1')]);
    const row = BY_TYPES[ctype];
    if (!row) return genericPlate();
    const letters = row.letters.map(selText).join(''), digits = fieldVal(row.digit), region = selText(row.region);
    const core = row.lettersFirst ? joinParts([letters, digits]) : joinParts([digits, letters]);   // trucks AP 9665, cars 6383 EC
    return core + (region ? '-' + region : '');                    // the region follows a dash: AP 9665-1, 6383 EC-6
  };
  // China: the trailer mark 挂 touches the number (浙C·B152挂), every other part is read as the form lists it
  PLATE_RULES.cn = () => genericPlate().replace(/(\d) (挂)/, '$1$2');
  // Czechia: 1CA 8407. Only the fields shown for this type (the site's disczn function); a hidden menu keeps a value
  PLATE_RULES.cz = () => {
    if (shownVal('nomer')) return fieldVal('nomer');            // vanity, export transit, mopeds: one field
    const letters = menu('b1') + menu('region') + menu('b2');
    const digits = ['digit1', 'digit2', 'digit3'].map(shownVal).filter(Boolean).join('');
    // electric vehicles write EL themselves (disabled field): EL5 57CP; trailers of 1977 start with a two-digit field: 24 DOA-99
    // electric vehicles: EL5 57CP, the field takes 557CP and the site puts the space after the first digit
    if (shownVal('el') === 'EL' && /^\d\w{4}$/.test(digits.replace(/\s+/g, ''))) { const d = digits.replace(/\s+/g, ''); return 'EL' + d[0] + ' ' + d.slice(1); }
    // the older types keep their separators in the gallery text: agricultural and commercial (1960) CB 88-39, military (1960) 214 75-56,
    // trailers (1977) 24 DOA-99, special machinery (2001) A01 3505, diplomatic 011 HC08
    const [d1, d2, d3] = ['digit1', 'digit2', 'digit3'].map(shownVal), dash = t => t.replace(/\s+/g, '-');
    const b2 = menu('b2'), kind = (document.getElementById('ctype') ? selText('ctype') : '');
    // CB 88-39 (agricultural and commercial: the second letter slot holds a digit that belongs to the number), ABJ 45-96, BV1 77-15
    if (d2 && b2 && menu('region')) return /^\d$/.test(b2) && /agricultur|commercial/i.test(kind) ? joinParts([menu('region'), b2 + dash(d2)]) : joinParts([menu('region') + b2, dash(d2)]);
    if (d1 && d2 && !d3 && !letters) return joinParts([d1, dash(d2)]);
    if (/^\d+$/.test(shownVal('el')) && menu('region') && b2 && d1) return /^\d$/.test(b2) ? [shownVal('el'), menu('region'), b2 + d1].join('-') : joinParts([shownVal('el'), menu('region') + b2 + '-' + d1]);
    if (menu('region') && d1 && d3 && !menu('b2')) return joinParts([menu('region') + d1, d3]);
    if (d1 && d3 && !letters && !shownVal('el')) return joinParts([d1, d3]);
    return joinParts([shownVal('el') + letters, digits]);
  };
  // Germany: only the fields shown for this type (a hidden menu keeps HD or H)
  PLATE_RULES.de = () => {
    if (fieldVal('ctype') === '17') return joinParts([shownVal('digit'), shownVal('inslet')]);   // insurance plates: 380 LSI
    if (fieldVal('ctype') === '4') return joinParts([selText('dipf'), selText('regiondip') + '-' + fieldVal('digit')]);   // diplomatic: 0 111-111 (dipf shows 0)
    if (fieldVal('ctype') === '15') return joinParts([menu('regionfed'), menu('regionfed1'), shownVal('digit')]);   // authorities: BD 16 7004 (authority, its number, digits)
    // seasonal plates add their months in brackets (04/10); regional authorities have their own menu
    const season = shownVal('season');
    return joinParts([menu('regionreg') || menu('region'), menu('b1'), season ? shownVal('digit') + menu('b2') : joinParts([shownVal('digit'), menu('b2')]), season ? '(' + season + ')' : '']);
  };
  // Denmark: vanity plates are seven boxes, one character each (MARIAKJ)
  PLATE_RULES.dk = () => {
    if (fieldVal('ctype') === '4') return ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'].map(menu).join('').toUpperCase();
    return genericPlate();
  };
  PLATE_RULES.dz = () => fieldVal('nomer').replace(/\s+/g, ' ');     // Algeria: the groups are typed as the site shows them (271201 00 16)
  // Estonia: motorcycles (ctype 3) are ABC 123; the other types are read from their fields
  PLATE_RULES.ee = () =>
    fieldVal('ctype') === '3' ? joinParts([fieldVal('let'), fieldVal('dig1')]) : genericPlate();
  // Egypt: ٣٦٢١ جىر = the digits, then the letters (police: a digit and letters from the p menus). The governorate is not in the plate text
  PLATE_RULES.eg = () => joinParts([charsOf(['d1', 'd2', 'd3', 'd4', 'd5', 'd6'], 'before'), charsOf(['p1', 'p2', 'b1', 'b2', 'b3'], 'before')]);
  // Spain: diplomatic CD 32 022 (the dip menu shows its label CD, its value is a code)
  PLATE_RULES.es = () => {
    if (fieldVal('ctype') === '2') return joinParts([selText('dip'), selText('region'), shownVal('digit1')]);
    return genericPlate();
  };
  // France: the format depends on the plate type chosen in the form (#ctype)
  function plateFR() {
    const type = fieldVal('ctype');
    if (type === '5') {                                             // diplomatic
      return joinParts([fieldVal('dip1') !== '0' && fieldVal('dip1'), fieldVal('regdip'), fieldVal('dip2'),
        fieldVal('digdip'), fieldVal('drop_1'), fieldVal('dip3') !== '0' && fieldVal('dip3')]);
    }
    const raw = fieldVal('nomer1') || fieldVal('nomer');
    if (!raw) return '';
    const c = squash(raw);
    if (type === '16') {                                            // moped
      const m = c.match(/^([A-Z]{1,2})(\d{3})([A-Z])$/);
      return m ? `${m[1]} ${m[2]} ${m[3]}` : raw.toUpperCase();
    }
    if (type === '6') {                                             // garage plate W
      const m = c.match(/^W(\d{3})([A-Z]{2})$/);
      return m ? `W ${m[1]} ${m[2]}` : raw.toUpperCase().replace(/-/g, ' ');
    }
    if (['8', '12', '13', '14', '15'].includes(type)) {            // FNI (regular, free zones, transit, agricultural, administration)
      const m = c.match(/^(\d{1,4})([A-Z]{2,3})(\d{2})$/);
      return m ? `${m[1]} ${m[2]} ${m[3]}` : raw.toUpperCase().replace(/-/g, ' ');
    }
    if (type === '9') return raw.replace(/\D+/g, '');               // military: digits only
    const m = c.match(/^([A-Z]{2})(\d{3})([A-Z]{2})$/);             // standard SIV: the site writes it AB-123-CD
    return m ? `${m[1]}-${m[2]}-${m[3]}` : raw.toUpperCase().replace(/\s+/g, '-').trim();
  }


  PLATE_RULES.fr = () => plateFR();
  // Georgia: test plates are TEST-050 = TEST written by the site (testprefix, disabled), then the digits; the other types are read from their fields
  PLATE_RULES.ge = () => joinParts([shownVal('testprefix'), genericPlate()]);
  // Guernsey: 12345; Alderney AY 1573 and dealers V145 have letters written by the site in a disabled field
  PLATE_RULES.gg = () => (l => l.length === 1 ? l + fieldVal('digit') : joinParts([l, fieldVal('digit')]))(shownVal('let'));   // a single letter touches the number (V145), two letters do not (AY 1573)
  // Greece: IAZ 6038 (cars). 1972 system (9): IN-4662; mopeds (12): ZHE 3860. Only the fields shown for the type: some
  // letters are written by the site itself in a disabled field that is still shown (ΞΑ of the administrative staff, AM of the
  // agricultural vehicles, E.A. of the police, ΛΣ of the Coast Guard), and menus can be shown but fixed (the P of a trailer)
  PLATE_RULES.gr = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '9') return shownVal('let') + '-' + shownVal('digit');
    if (ctype === '12') return joinParts([shownVal('let'), shownVal('digit')]);
    const digits = shownVal('digit');
    const written = shownVal('let') || shownVal('bfixed').replace(/\./g, '');
    if (written) return joinParts([written + menu('b1'), digits]);                               // private trailers: the T written by the site, then the letter
    // the two-letter code, then the letter, as the page lists them: KZ + T = KZT (a car), IA + Z = IAZ (a truck: its code menu holds
    // only EK, IA and NX), TA + E = TAE (a taxi: its code menu holds only TA)
    return joinParts([menu('region') + menu('b1'), digits]);
  };
  // Croatia: ZG 8899-JB; vanity (5) is region + the letter boxes shown: ZG ZMAJ. Dealer and oldtimers: OS PP-178, KR PV-081
  // (the letters PP, PV are written by the site in a disabled field); export transit and military: RH 199-BE, HV 236-MP (the
  // site writes RH, HV, and there is no region); diplomatic (11): 025-A-020 (code, the letter of the corps, digits)
  PLATE_RULES.hr = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '5') return joinParts([menu('region'), ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'].map(menu).join('')]);
    if (ctype === '10') return [shownVal('pol1'), shownVal('pol2')].filter(Boolean).join('-');   // police: 170-344 (two number fields)
    if (ctype === '11') return [fieldVal('dipcode'), menu('dipletter').charAt(0), shownVal('digit')].filter(Boolean).join('-');
    const digit = shownVal('digit') || shownVal('digit1'), letters = menu('b1') + menu('b2');
    const core = digit && letters ? `${digit}-${letters}` : digit || letters;
    const written = shownVal('special'), region = menu('region') || menu('region1');
    if (written) return joinParts([region, region ? written + '-' + core : written + ' ' + core]);
    return joinParts([region, core]);
  };
  // Israel: the plate is one free text (nomer) and letters written by the site in a disabled field (b1): in front (S- of the sportcars: S-100 294)
  // or after (צ of the military: 172539-צ); diplomatic plates may also have a menu (CD, UN...) in front, "-" meaning none
  PLATE_RULES.il = () => {
    const b1 = shownVal('b1'), dip = menu('dip');
    // sportcars: S-100 294, but the number is typed as six digits (100294): the site keeps the space after the third
    const nomer = b1.endsWith('-') ? shownVal('nomer').replace(/^(\d{3})(\d{3})$/, '$1 $2') : shownVal('nomer');
    const kind = dip && dip !== '-' ? dip : '';
    return b1.endsWith('-') ? joinParts([kind, b1 + nomer]) : joinParts([kind, nomer, b1]);
  };
  // Iraq: 1988 and 2001 systems are written in Arabic digits (١٠٣٧٠٤), 2008 as E 74525, 2022 as 21 O 17000 (Latin, with the governorate number first)
  PLATE_RULES.iq = () => {
    const ctype = fieldVal('ctype'), side = ['3', '4'].includes(ctype) ? 'before' : 'after';
    const region = ctype === '1' ? menuPart('region2', 'before') : '';
    return joinParts([region, charsOf(['b1l', 'b1', 'b2', 'b3'], side), charsOf(['d1', 'd2', 'd3', 'd4', 'd5', 'd6'], side)]);
  };
  // Iran: ۵۱ت۱۶۵ ۲۲ = two digits, the letter (written by the site for some types, a menu for others), three digits, then the code
  // Plates for driving abroad (15, 16) are one free text (38E889) and a code menu.
  // Motorcycles: ۷۷۴ ۷۷۷۸۹ = three digits, a space, five digits (no letter, no code)
  PLATE_RULES.ir = () => !shownVal('let') && !charsOf(['b1'], 'before') && /^.{8}$/u.test(charsOf(['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'], 'before'))
    ? charsOf(['d1', 'd2', 'd3'], 'before') + ' ' + charsOf(['d4', 'd5', 'd6', 'd7', 'd8'], 'before') : shownVal('nomer') ? joinParts([shownVal('nomer'), menuPart('region2', 'before')]) : joinParts([
    charsOf(['d1', 'd2'], 'before') + (shownVal('let') || charsOf(['b1'], 'before')) + charsOf(['d3', 'd4', 'd5', 'd6', 'd7', 'd8'], 'before'),
    menuPart('region1', 'before') || menuPart('region3', 'before')
  ]);
  // Iceland: vanity plates are six boxes, one character each (LYNGAR)
  PLATE_RULES.is = () => {
    if (fieldVal('ctype') === '8') return boxes(['b1', 'b2', 'b3', 'b4', 'b5', 'b6']).toUpperCase();
    return genericPlate();
  };
  // Italy: mopeds and dealers type their text in mb1 / mb2 (5N JGK; 00 P 1FLYG, the P being written by the site); road machinery is nomerpl1
  // alone (AKF 511: the province menu is not in the plate text); the other types are read from their fields
  PLATE_RULES.it = () => {
    if (shownVal('mb1') || shownVal('mb2')) return joinParts([shownVal('mb1'), shownVal('dealp'), shownVal('mb2')]);
    if (fieldVal('ctype') === '14') return shownVal('nomerpl1');
    return genericPlate();
  };
  // Japan: 世田谷 310 あ 7410 = the place (the menu reads "Setagaya - 世田谷": the part after the dash), the class number, the hiragana,
  // the digits one per menu (a blank "•" for a short number)
  PLATE_RULES.jp = () => joinParts([menu('region').split(' - ').pop().trim(), shownVal('code'), menu('hiragana'), charsOf(['d1', 'd2', 'd3', 'd4'], 'before')]);
  // Kyrgyzstan (2016 and later types): the region code (the menu reads "01 - Bishkek City"), then the plate text typed as it is.
  // The diplomatic type has its own set of fields (dip_*) and is read as a generic plate.
  PLATE_RULES.kg = () => fieldVal('ctype') === '10' ? shownVal('nomerpl').replace(/\s+/g, '').replace(/^([A-Z]+)(\d{2})(\d{3})$/, '$1 $2 $3') :   // diplomatic: D 09 003 (typed D09003)
    joinParts([menu('region').split(' - ')[0].trim(), shownVal('nomerpl')]);
  // Cambodia: the authorities (5) and the vehicles without paid duty (7) have a province menu (region5, region7) that is not part of the
  // plate (2-0459, 1-7172); the other types are read from their fields
  PLATE_RULES.kh = () => ['5', '7'].includes(fieldVal('ctype')) ? shownVal('nomer') : genericPlate();
  // Korea: 29무 3759 / 경기50바 4521 = the province (commercial vehicles: the menu reads "경기 (Gyeonggi Province)"), the two digits, the
  // letter (a menu), then the four digits
  PLATE_RULES.kr = () => joinParts([menu('region').split(' (')[0].trim() + shownVal('digit1') + menu('let1') + menu('let2'), shownVal('digit')]);
  // Kazakhstan: military plates of 1993 are 2723 АЯ = the digits then two letter menus (milb1, milb2); the other types are read from their fields
  PLATE_RULES.kz = () => fieldVal('ctype') === '15' ? joinParts([shownVal('digit2'), menu('region2')]) : fieldVal('ctype') === '9' ? joinParts([shownVal('digit2'), menu('milb1') + menu('milb2')]) : /1993/.test(selText('ctype')) ? spaceOut(genericPlate()) : genericPlate();   // the 1993 plates: letters stay together (A 752 HN)
  // Laos: the letters are written by the site (military ກທ/, police, temporary: a disabled "dop" field, sometimes with a second part "dop1"),
  // chosen from a menu (diplomatic) or two letter menus (private owners, organisations: ກກ 1145). The province menu is not in the plate text.
  PLATE_RULES.la = () => {
    const dop1 = shownVal('dop1');
    // military and police with a number in front of the digits: ກທ/1 0040 (the slash stays); without: ກທ 5868
    if (shownVal('dop') && dop1 && shownVal('digit')) return shownVal('dop') + dop1 + ' ' + shownVal('digit');
    const dop = shownVal('dop').replace(/\/+$/, '');
    const letters = dop || menu('dip') || menu('b1') + menu('b2'), digit = shownVal('digit') || dop1;   // a dash typed by the user is kept
    // the dash is part of the plate: diplomatic ສທ23-78 (two and two digits), temporary ຂຄ3-541 (one digit, then the rest), no space after the letters
    if (fieldVal('ctype') === '6') return letters + digit.replace(/^(\d\d)(\d{2,})$/, '$1-$2');
    if (fieldVal('ctype') === '8') return letters + digit.replace(/^(\d)(\d+)$/, '$1-$2');
    return joinParts([letters, digit]);   // military ກທ 5868, police ປກສ 1099
  };
  PLATE_RULES.li = () => joinParts(['FL', fieldVal('digit').replace(/^FL\s*/i, ''), shownVal('b1')]);   // Liechtenstein: FL 12345 (the FL is fixed; the digit field may already hold it)
  // Latvia: AB 1234; vanity (6) and diplomatic (9) are typed in one field: C-4307, PENNY
  PLATE_RULES.lv = () => {
    if (['6', '9'].includes(fieldVal('ctype'))) return fieldVal('nomer').toUpperCase();
    // dealers add a last digit after a dash (B 1122-6)
    return joinParts([menu('b1') + menu('b2'), shownVal('digit') + (shownVal('digit2') ? '-' + shownVal('digit2') : '')]);
  };
  // Monaco: provisional plates are 1517 WW MC = the number, the WW menu, then MC (the country, part of the plate text); the other types are read from their fields
  PLATE_RULES.mc = () => shownVal('nomerpl') && menu('drop_1') ? joinParts([shownVal('nomerpl'), menu('drop_1'), 'MC']) : genericPlate();
  // Moldova: trailers of 1992: region code, digits, letters
  PLATE_RULES.md = () => {
    if (fieldVal('ctype') === '3') return joinParts([fieldVal('region1'), fieldVal('digit'), fieldVal('let2')]);   // FL 070 RA (region code, digits, letters: the site has it)
    return genericPlate();
  };
  // Montenegro: vanity = region then the letter boxes (BD CMM02); police = fon, then region+digits (P PG273)
  PLATE_RULES.me = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '5') return joinParts([menu('region'), ['b1', 'b2', 'b3', 'b4', 'b5'].map(menu).join('')]);
    if (ctype === '6') return joinParts([shownVal('police'), menu('region') + shownVal('digit')]);   // police: the P is written by the site
    return genericPlate();
  };
  // Mongolia: 2294 БӨН (cars: digits, then the region code БӨ and the letter Н), БӨЗ 3510 (motorcycles), 7073 УН (special machinery).
  // The region menu reads "БН - Bayankhongor Province": the code is the part before the dash (none for "- Diplomatic missions").
  PLATE_RULES.mn = () => {
    const ctype = fieldVal('ctype'), shown = menu('region'), digit = shownVal('digit');
    const code = shown.startsWith('-') ? '' : shown.split(' - ')[0].trim();
    if (ctype === '1') return joinParts([digit, code + menu('b1')]);
    if (ctype === '2') return joinParts([digit, menu('b1') + menu('b2')]);        // trailers: 6079 ОЧ
    if (ctype === '4') return joinParts([code + menu('b1'), digit]);
    return joinParts([digit, code]);
  };
  // Poland: CNA 32756 = region menu (only when shown) + b1 (one more letter or digit: K0, ROK) + nomerpl; diplomatic (12): W 016600 = the W
  // written by the site, the code menu, then three digits
  PLATE_RULES.pl = () => {
    if (shownVal('dip')) return joinParts([shownVal('dip'), menu('region') + shownVal('digit')]);
    return joinParts([menu('region') + shownVal('b1'), fieldVal('nomerpl').toUpperCase()]);
  };
  // Palestine: 4-7752-94 = a one-digit menu (reg1), the digits, then two characters
  PLATE_RULES.ps = () => shownVal('digit2') ? joinParts([menu('reg1'), shownVal('digit1'), shownVal('digit2')]) : menu('reg1') + shownVal('digit1');   // authorities: 5396, one block
  // Portugal: diplomatic plates are 007-CC453 = a number, the kind (CD, CC, FM, OI), a number; the National Republican Guard writes GNR itself
  // (gnr, disabled): GNR T-399; the other types are read from their fields
  PLATE_RULES.pt = () => shownVal('mnum1') || shownVal('mnum2') ? shownVal('mnum1') + '-' + menu('mtype') + shownVal('mnum2') : joinParts([shownVal('gnr'), genericPlate()]);
  // Forms with a region menu (drop_1: a state, a province, an emirate) and a free plate text (nomer): the region is not part of the plate
  // text (MBG-133-A, not AGUASCALIENTES MBG-133-A), so only the text is read.
  PLATE_RULES.ae = PLATE_RULES.au = PLATE_RULES.ca = PLATE_RULES.mx = PLATE_RULES.us = () => fieldVal('nomer');
  // Serbia: BG 123-AB; trailers (2): OO-442 VR (two letters, digits, then the region menu); vanity (4): region then the letter boxes;
  // diplomatic (6), military (10), oldtimers (8), special machinery (9) put their text in "dip" after the region; police (5) has a
  // letter written by the site (П 009-299)
  PLATE_RULES.rs = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '2') return joinParts([menu('b1') + menu('b2') + '-' + shownVal('digit2'), menu('region2')]);
    if (ctype === '4') return joinParts([menu('region1'), ['b1', 'b2', 'b3', 'b4', 'b5'].map(menu).join('')]);
    const digit = shownVal('digit') || shownVal('digit1'), letters = menu('b1') + menu('b2');
    const core = digit && letters ? `${digit}-${letters}` : digit || letters;
    return joinParts([menu('region') || menu('region1'), shownVal('police'), shownVal('dip'), core, ctype === '6' ? shownVal('digit2') : '']);
  };
  // Russia: А 001 АА 77. Only the menus shown for this type (the site's disru20 function). Diplomatic: 032 D 345 77 (the country code typed in
  // "code", the letter menu dipb1, the digits, the region); diplomatic motorcycles: D 017 02 77 (dipb2 first)
  PLATE_RULES.ru = () => {
    // the site's search writes the diplomatic letter D as * (032 * 345 77 finds the plate the gallery shows as 032 D 345 77)
    const star = t => (t === 'D' ? '*' : t);
    if (menu('dipb1')) return joinParts([shownVal('code'), star(menu('dipb1')), shownVal('digit'), menu('region')]);
    if (menu('dipb2')) return joinParts([star(menu('dipb2')), shownVal('code'), shownVal('digit'), menu('region')]);
    return joinParts([menu('b1') + menu('b2'), shownVal('digit'), menu('b3') + menu('b4'), menu('region')]);
  };
  // Saudi Arabia: 3273 JRS = the digits, then the letters, in Latin script (the menus read "٣ / 3": the part after the slash);
  // the 1996 system is written in Arabic script (١ لكأ: the part before the slash)
  PLATE_RULES.sa = () => {
    const side = fieldVal('ctype') === '6' ? 'before' : 'after';
    return joinParts([charsOf(['d1', 'd2', 'd3', 'd4'], side), charsOf(['b1', 'b2', 'b3'], side)]);
  };
  // Singapore: PC 9090 A = the letters, the digits, then the check letter (three fields)
  PLATE_RULES.sg = () => joinParts([shownVal('let'), shownVal('dig'), shownVal('checksum')]);
  // Slovenia: LJ 123-AB (the region code, then the plate)
  PLATE_RULES.si = () => {
    const region = (document.getElementById('drop_1') || { value: '' }).value.trim();
    if (fieldVal('ctype') === '2') return joinParts([fieldVal('nomer'), region]);   // trailers: H4-86 KP, the code after the plate
    return joinParts([region, fieldVal('nomer')]);
  };
  // Slovakia: BA 427RF; the types with a middle letter (dealer, oldtimers...) read it: PO M 704
  PLATE_RULES.sk = () => {
    // diplomatic (EE 10228), military (67-38966) and police (P-00040) put their number in "police", after a menu, the digits or a letter written by the site
    if (shownVal('police')) return joinParts([menu('dip') || shownVal('let1'), shownVal('digit'), shownVal('police')]);
    const region = selText('region');
    if (shownVal('let1')) return joinParts([region, shownVal('let1'), fieldVal('digit')]);
    if (!fieldVal('digit')) return genericPlate();                // vanity and provisional types have no digit field: read the shown fields
    return region + '-' + fieldVal('digit') + fieldVal('let2');   // a space is refused by the site
  };
  // Soviet Union (historic plates): 0658 РВД, ГС 5466 = the letters and digits as the form lists them; letters stay together, a space where letters meet digits
  PLATE_RULES.su = () => spaceOut(genericPlate());
  // Thailand: 4ฒฆ 5147 / ณข 1801 / ก-3826 = an optional digit (b1, "-" for none), a special letter whose menu depends on the type (b1mt, b1c, b1p,
  // b1v, b1i, b1com, b1txc, b1dop), the letters (b2, b3, b4), then the digits. The province menus are not in the plate text.
  PLATE_RULES.th = () => {
    const letters = ['b1', 'b1mt', 'b1c', 'b1p', 'b1v', 'b1i', 'b1com', 'b1txc', 'b1dop', 'b2', 'b3', 'b4'].map(id => menu(id)).filter(t => t && t !== '-').join('');
    return joinParts([letters + shownVal('digit1'), shownVal('digit') + shownVal('digit5')]);   // trucks: 10-7100 (digit1 then digit), police: digit5 alone
  };
  // Tajikistan: 7717XZ07 = the number, then the region code (once). A number that already ends with a region code is kept as it is
  PLATE_RULES.tj = () => {
    const el = document.getElementById('region2'), shown = el && el.offsetParent !== null;
    const n = squash(fieldVal('nomer'));
    const ctype = fieldVal('ctype');
    // the gallery text keeps its spaces: 1996 system 0542 AA 02, AH 9832 02 (the number, then the code); 2009 motorcycles 121 A20, police 0247 M 01,
    // trailers 01AB 0096 (the code first); the other 2009 types are written together (815XM01)
    if (menu('region1')) return spaceOut(n) + ' ' + menu('region1');
    if (ctype === '8') return (shown ? selText('region2') : '') + spaceOut(n);
    const codes = shown ? [...el.options].map(o => o.text.trim()).filter(Boolean) : [];
    const r = shown ? selText('region2') : '';
    if (ctype === '9') return (r && !n.endsWith(r) ? n + r : n).replace(/^(\d+)(\D+\d+)$/, '$1 $2');   // 121 A20: the number 121A, then the code menu (20)
    if (codes.some(c => n.endsWith(c))) return n;
    if (ctype === '10' && r) return spaceOut(n) + ' ' + r;
    return r ? n + r : n;
  };
  PLATE_RULES.tr = () => {
    const sel = document.querySelector('select[name="region"]');
    // the option value is an internal code (40001); the label starts with the plate number ("50 - Nevsehir")
    const label = sel && sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '';
    const region = label.match(/^\s*(\d{2})/);
    return joinParts([region && region[1], fieldVal('let'), fieldVal('digit')]);
  };
  // Ukraine: AA 0001 AA. Only the fields shown for the type (a hidden menu keeps BH, HA, OM)
  PLATE_RULES.ua = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '16') return joinParts([shownVal('digit1'), menu('b1') + menu('b2') + menu('b3')]);     // motorcycles 1995: 0708 CKA
    if (ctype === '14') return joinParts([shownVal('digit1'), menu('region4')]);                          // special machinery 1995: 00828 AC
    if (ctype === '15') return joinParts([menu('region4'), shownVal('digit4')]);                          // trailers for special vehicles: AB 07067
    if (ctype === '18') return joinParts([fieldVal('tt95') + shownVal('digit1'), menu('region5')]);       // work vehicles 1995: T0625 PB (the T is written by the site)
    if (ctype === '20') return joinParts([menu('region3'), shownVal('nomer')]);                           // vanity plates: 11 SOPRANOS
    if (ctype === '8') return joinParts([shownVal('digit1'), menu('mil_b1') + menu('mil_b2')]);           // military 2004: 1133 Ф4
    if (ctype === '10') return joinParts([menu('region1'), shownVal('digit2'), menu('gov')]);             // government agencies: AE 103 E
    if (ctype === '9') return joinParts([shownVal('digit1'), menu('b3'), menu('region1')]);               // work vehicles 2004: 02058 T AX
    if (ctype === '5' || ctype === '6') return joinParts([menu('region2') || menu('region3'), menu('b1') + menu('b2'), shownVal('digit4')]);   // transit and dealer: 05 CH 8725, T4 TE 2773
    if (ctype === '17') return joinParts([shownVal('dlet1'), shownVal('digit2'), shownVal('digit4')]);   // diplomatic: DP 201 191
    const region = menu('region1') || menu('region2') || menu('region3');
    const digit = ['digit1', 'digit2', 'digit3', 'digit4'].map(shownVal).find(Boolean) || '';
    return joinParts([region, digit, menu('b1') + menu('b2')]);
  };
  // Uzbekistan: PP A 123 AA (cars); motorcycles, trailers, special machinery: 010 LA 50; high authorities: PAA 252; foreign citizens and
  // joint ventures: 01 H 010229 (the letter is written by the site). Only the fields shown for the type: a hidden one keeps an old value
  PLATE_RULES.uz = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '9') return joinParts([selText('b3'), fieldVal('dig1')]);
    if (['5', '6', '7', '8'].includes(ctype)) return joinParts([fieldVal('dig3'), fieldVal('b4'), selText('region')]);
    return joinParts([selText('region'), shownVal('b1'), shownVal('dig1') || shownVal('dig2'), shownVal('b2')]);
  };
  // Vietnam: 47A-271.12 = the province code, the series letter(s) typed in "mm", the digits as the site shows them (with their dot);
  // specialty plates take the letters from a menu (15CD-015.02); diplomatic and some others are one free text ("moto")
  // motorcycles (2, 6) have a dash after the province code: 29-B1 0910, 47-K1 270.77
  PLATE_RULES.vn = () => shownVal('moto') || (['2', '6'].includes(fieldVal('ctype')) ? joinParts([menu('region'), shownVal('mm') + menu('spec'), shownVal('digit')]) : '') || joinParts([menu('region') + shownVal('mm') + menu('spec'), shownVal('digit')]);
  const plateForForm = () => (PLATE_RULES[here.country] || genericPlate)();   // a country without a rule uses the plain visible fields
  /* =====================================================================
   *  OFFICIAL REGISTERS WITH OPEN DATA  (the only ones that answer a plate, free, with no key, to a page of another site)
   *    A register is { name, plate(plate) -> the plate as it asks for it or '', url(plate), read(json) -> the facts or null }.
   *    The facts: { make, model, year, colour, until } (all optional text). The plate leaves the page only when the user clicks.
   *    Checked on the real services: both answer with `access-control-allow-origin: *`, so a plain fetch from PlatesMania works.
   *    - nl: RDW open data, kentekenregister (opendata.rdw.nl)
   *    - il: Ministry of Transport vehicle register (data.gov.il), asked by the number of the plate; the make is in Hebrew
   * ===================================================================== */
  const REGISTRIES = {
    nl: {
      name: 'RDW open data',
      plate: p => String(p).toUpperCase().replace(/[\s-]+/g, '').replace(/[^A-Z0-9]/g, ''),
      url: p => `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${encodeURIComponent(p)}`,
      read: rows => {
        const r = Array.isArray(rows) && rows[0];
        const day = s => (/^\d{8}$/.test(s || '') ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}` : '');
        return r ? { make: r.merk || '', model: r.handelsbenaming || '', year: (r.datum_eerste_toelating || '').slice(0, 4), colour: r.eerste_kleur || '', until: day(r.vervaldatum_apk) } : null;
      }
    },
    il: {
      name: 'data.gov.il (Ministry of Transport)',
      plate: p => (/^\d{5,8}$/.test(String(p).replace(/\D/g, '')) ? String(p).replace(/\D/g, '') : ''),
      url: p => `https://data.gov.il/api/3/action/datastore_search?resource_id=053cea08-09bc-40ec-8f7a-156f0677aff3&filters=${encodeURIComponent(JSON.stringify({ mispar_rechev: +p }))}&limit=1`,
      read: json => {
        const r = json && json.result && json.result.records && json.result.records[0];
        return r ? { make: r.tozeret_nm || '', model: r.kinuy_mishari || '', year: String(r.shnat_yitzur || ''), colour: r.tzeva_rechev || '', until: r.tokef_dt || '' } : null;
      }
    }
  };
  /* =====================================================================
   *  VEHICLE  (what PlatesMania knows about brands, models and generations, and how to use it)
   *    The upload page carries the whole catalogue: the brand menu (markaavto) and four tables of its script (bmObject: brand ->
   *    models, modelObject: model -> name, bmgObject: model -> generations, modgenObject: generation -> name and years).
   *      vehicleData()                      the catalogue of the page
   *      vehicleGuess(texts, data)          the likely brand, model and generation named in some texts (titles, captions...)
   *      vehicleFill(path)                  chooses brand, model, generation in the menus of the page
   *      vehicleSearchBox(text)             types a text in the site's own "brand and model" box (it finds the vehicle itself)
   *      vehicleCurrent()                   the values the menus have now
   *    A guess is [{ category, level, candidates: [{ id, path, name }] }]: level 0 brand, 1 model, 2 generation; path = the menu
   *    values from the brand down to the candidate, which is what vehicleFill takes.
   * ===================================================================== */
  const vehicleMenus = () => [document.querySelector('select[name="markaavto"]'), document.getElementById('model'), document.getElementById('modgen')];
  const vehicleCurrent = () => vehicleMenus().map(el => (el ? el.value : ''));
  const vehiclePage = () => (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);

  function vehicleData() {
    const w = vehiclePage();
    const brands = [...document.querySelectorAll('select[name="markaavto"] option')].filter(o => +o.value > 0 && +o.value !== 200).map(o => ({ id: o.value, name: o.textContent.trim() }));
    return { brands, models: w.bmObject || {}, modelNames: w.modelObject || {}, gens: w.bmgObject || {}, genNames: w.modgenObject || {} };
  }

  // Fills the menus the way the page fills them: a change event runs the page's own onchange (changeBrand, changeModel), which
  // fills the next menu. path: [brandId, modelId, generationId], as far as it goes.
  function vehicleFill(path) {
    const menus = vehicleMenus();
    path.forEach((id, i) => {
      const el = menus[i];
      if (!el || id === undefined || el.value === String(id)) return;
      el.value = String(id);
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  // The site's own box for "brand and model" (a text with autocomplete): what is typed there is resolved by the site itself
  function vehicleSearchBox(text) {
    const box = document.getElementById('markamodtype');
    if (!box) return false;
    const jq = vehiclePage().jQuery;
    try { if (jq) { jq(box).val(text).autocomplete('search', text); return true; } } catch (e) { /* the plain way below */ }
    box.value = text;
    box.dispatchEvent(new Event('input', { bubbles: true }));
    box.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  const VEHICLE_STRONG = 5;      // what Google itself names counts as five titles: its naming is a curated entity, a title is a page's words
  const vehicleNorm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  // A text near the top of a list counts more than one far down
  const vehicleWeight = i => 1 / (1 + i / 10);

  // names: [[id, name]] -> [[id, score]] best first. A whole word counts 1. loose: a name written without spaces also counts 0.5
  // inside a longer word (RS6 in RS6Avant, but also Gol in Golf); brands are whole words only ("ogle" is in "Google"). A name that is
  // part of a longer candidate which scores as well (Gol, Golf) is that candidate's echo: dropped. A candidate far behind the first
  // one is page noise, not a second guess: it needs a quarter of the best score.
  // The first `strong` texts are named by an authority (what Google calls the vehicle): each counts as much as VEHICLE_STRONG ordinary texts.
  function vehicleScore(texts, names, minLength, loose, strong) {
    const padded = texts.map(t => ' ' + vehicleNorm(t) + ' ');
    const compact = padded.map(t => t.replace(/ /g, ''));
    const found = new Map();
    for (const [id, name] of names) {
      const n = vehicleNorm(name), c = n.replace(/ /g, '');
      if (!n || c.length < minLength || /^\d+$/.test(c)) continue;
      let score = 0;
      padded.forEach((t, i) => { score += (i < strong ? VEHICLE_STRONG : vehicleWeight(i - (strong || 0))) * (t.includes(' ' + n + ' ') ? 1 : loose && c.length >= 3 && compact[i].includes(c) ? 0.5 : 0); });
      if (score) found.set(id, [score, c]);
    }
    const all = [...found].map(([id, [score, c]]) => [id, score, c]).sort((a, b) => b[1] - a[1]);
    const kept = all.filter(a => !all.some(b => b !== a && b[2].length > a[2].length && b[2].includes(a[2]) && b[1] >= a[1] * 0.8));
    return kept.filter(f => f[1] >= kept[0][1] / 4).map(f => [f[0], f[1]]);
  }

  // The year range of a generation name: "4th gen (C8/4K5), 2019–" -> [2019, 9999]; "Mk7, 2012–2019" -> [2012, 2019]
  function vehicleYears(name) {
    const m = String(name).match(/(\d{4})\s*[–—-]\s*(\d{4})?\s*$/) || String(name).match(/(\d{4})\s*$/);
    return m ? [+m[1], m[2] ? +m[2] : (/[–—-]\s*$/.test(name) ? 9999 : +m[1])] : null;
  }

  // pin: { brand, model } the user chose: the models are those of that brand, the generations those of that model (a click on a
  // generation must never change the model the user picked)
  function vehicleGuess(texts, d, pin, strong) {
    pin = pin || {};
    const brandNames = d.brands.map(b => [b.id, b.name.replace(/\s*\(.*\)\s*$/, '')]);
    const brands = vehicleScore(texts, brandNames, 3, false, strong);
    const top = pin.brand || (brands[0] && brands[0][0]);
    const out = [{ category: 'Brand', level: 0, candidates: brands.slice(0, 3).map(([id]) => ({ id, path: [id], name: d.brands.find(b => b.id === id).name })) }];
    const models = vehicleScore(texts, (top ? d.models[top] || [] : []).map(id => [String(id), d.modelNames[id]]), 2, true, strong);
    out.push({ category: 'Model', level: 1, candidates: models.slice(0, 3).map(([id]) => ({ id, path: [top, id], name: d.modelNames[id] })) });
    const model = pin.model || (models[0] && models[0][0]);
    // the generations of that model (the best one unless pinned) whose years are the ones named in the texts
    const years = texts.join(' ').match(/\b(19[2-9]\d|20[0-3]\d)\b/g) || [];
    const gens = (model ? d.gens[model] || [] : []).filter(id => String(d.genNames[id]) !== '0').map(id => {
      const r = vehicleYears(d.genNames[id]);
      return [String(id), r ? years.filter(y => +y >= r[0] && +y <= r[1]).length : 0];
    }).filter(g => g[1]).sort((x, y) => y[1] - x[1]);
    out.push({ category: 'Generation', level: 2, candidates: gens.slice(0, 3).map(([id]) => ({ id, path: [top, model, id], name: d.genNames[id] })) });
    return out;
  }
  /* =====================================================================
   *  ICONS  (Lucide, ISC licence, https://lucide.dev: see THIRD_PARTY.md)
   * ===================================================================== */
  const ICON = {
    search: '<circle cx="11" cy="11" r="8" /> <path d="m21 21-4.3-4.3" />',
    photos: '<path d="M18 22H4a2 2 0 0 1-2-2V6" /> <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" /> <circle cx="12" cy="8" r="2" /> <rect width="16" height="16" x="6" y="2" rx="2" />',
    post: '<path d="M12 20h9" /> <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />',
    likes: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /> <polyline points="17 8 12 3 7 8" /> <line x1="12" x2="12" y1="3" y2="15" />',
    close: '<path d="M18 6 6 18" /> <path d="m6 6 12 12" />',
    open: '<path d="m9 18 6-6-6-6" />',
    collapse: '<rect width="18" height="18" x="3" y="3" rx="2" /> <path d="M15 3v18" /> <path d="m8 9 3 3-3 3" />',
    keyboard: '<path d="M10 8h.01" /> <path d="M12 12h.01" /> <path d="M14 8h.01" /> <path d="M16 12h.01" /> <path d="M18 8h.01" /> <path d="M6 8h.01" /> <path d="M7 16h10" /> <path d="M8 12h.01" /> <rect width="20" height="16" x="2" y="4" rx="2" />',
    gallery: '<rect width="7" height="7" x="3" y="3" rx="1" /> <rect width="7" height="7" x="14" y="3" rx="1" /> <rect width="7" height="7" x="14" y="14" rx="1" /> <rect width="7" height="7" x="3" y="14" rx="1" />',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /> <circle cx="7" cy="17" r="2" /> <path d="M9 17h6" /> <circle cx="17" cy="17" r="2" />',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /> <circle cx="12" cy="12" r="3" />',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />',
  };
  const icon = name => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;
  /* =====================================================================
   *  SHARED LOOK  (one palette + one set of controls for the panel AND the batch window)
   * ===================================================================== */
  // NextPlaate mark: a round camera with a plus (a photo to add), in three blues and white. The shapes are those of the logo file
  // (logo_nextplaate.svg, paths rounded to two decimals: the drawing is the same pixel for pixel); the blues are the logo's own.
  const LOGO_BLUES = { a: '#3781c5', b: '#529bde', c: '#82c3ff' };
  const LOGO_BODY = '<g transform="translate(-550.99555,-180.5379)"><circle class="w" cx="651.53937" cy="281.37015" r="96.018852"/><g transform="matrix(0.26751148,0,0,0.26751148,-359.02412,-12.449882)"><path class="a" d="m 1188.38,1114.4 c -6.66,0.01 -13.22,0.19 -19.71,0.54 -6.49,0.35 -12.9,0.88 -19.25,1.58 -6.35,0.7 -12.63,1.58 -18.86,2.64 -6.23,1.06 -12.41,2.29 -18.56,3.71 -6.14,1.42 -12.25,3.02 -18.33,4.81 -6.08,1.79 -12.14,3.76 -18.19,5.92 -6.05,2.16 -12.08,4.51 -18.12,7.06 -6.04,2.54 -12.08,5.28 -18.14,8.21 -5.1,2.47 -10.13,5.05 -15.08,7.76 -4.95,2.7 -9.82,5.52 -14.6,8.45 -4.79,2.93 -9.49,5.97 -14.11,9.12 -4.62,3.15 -9.15,6.41 -13.6,9.77 -4.44,3.36 -8.8,6.83 -13.06,10.4 -4.26,3.57 -8.43,7.23 -12.51,11 -4.08,3.76 -8.05,7.63 -11.93,11.58 -3.88,3.95 -7.66,8 -11.34,12.14 -3.68,4.14 -7.26,8.36 -10.73,12.67 -3.47,4.31 -6.84,8.71 -10.09,13.19 -3.26,4.48 -6.4,9.04 -9.44,13.68 -3.03,4.64 -5.96,9.35 -8.76,14.14 -2.81,4.79 -5.5,9.65 -8.07,14.59 -2.57,4.93 -5.03,9.94 -7.36,15.01 -2.33,5.07 -4.54,10.21 -6.62,15.41 -2.08,5.2 -4.04,10.47 -5.87,15.79 -2.87,8.35 -5.43,16.71 -7.68,25.07 -2.25,8.36 -4.2,16.72 -5.84,25.08 -1.64,8.36 -2.98,16.72 -4,25.08 -1.03,8.36 -1.75,16.71 -2.16,25.05 -0.41,8.34 -0.52,16.68 -0.32,25.01 0.2,8.33 0.71,16.64 1.52,24.95 0.81,8.3 1.94,16.59 3.37,24.87 1.43,8.27 3.17,16.53 5.21,24.77 1.42,5.74 2.99,11.42 4.69,17.05 1.7,5.63 3.53,11.19 5.5,16.7 1.97,5.51 4.07,10.95 6.3,16.33 2.23,5.38 4.59,10.69 7.08,15.93 2.49,5.24 5.11,10.42 7.85,15.52 2.74,5.1 5.61,10.13 8.59,15.08 2.99,4.95 6.1,9.83 9.33,14.62 3.23,4.79 6.58,9.51 10.04,14.14 3.46,4.63 7.05,9.17 10.74,13.63 3.69,4.46 7.5,8.83 11.42,13.1 3.92,4.28 7.95,8.46 12.09,12.55 4.14,4.09 8.38,8.09 12.73,11.98 4.35,3.9 8.81,7.69 13.37,11.39 4.56,3.69 9.22,7.29 13.98,10.77 4.76,3.49 9.62,6.86 14.58,10.13 4.96,3.27 10.01,6.43 15.16,9.47 6.22,3.68 12.57,7.16 19.03,10.43 6.46,3.27 13.04,6.34 19.73,9.21 6.69,2.86 13.48,5.52 20.38,7.98 6.9,2.45 13.9,4.7 21,6.73 7.1,2.04 14.29,3.86 21.58,5.48 7.29,1.62 14.66,3.02 22.12,4.21 7.46,1.19 15,2.17 22.62,2.93 7.62,0.76 15.31,1.31 23.07,1.64 2.44,0.1 14.02,-0.46 25.73,-1.26 0,0 0,0 0,0 6.18,-0.42 12.38,-1.03 18.59,-1.81 6.21,-0.78 12.42,-1.75 18.62,-2.88 6.2,-1.13 12.38,-2.44 18.53,-3.91 6.15,-1.47 12.26,-3.11 18.33,-4.91 6.06,-1.8 12.07,-3.76 18.01,-5.88 5.94,-2.12 11.8,-4.39 17.58,-6.81 5.77,-2.42 11.46,-4.99 17.03,-7.71 5.57,-2.72 11.03,-5.58 16.37,-8.57 7.8,-4.39 14.86,-8.6 21.47,-12.85 6.61,-4.25 12.76,-8.55 18.73,-13.1 5.98,-4.55 11.78,-9.36 17.7,-14.64 5.92,-5.28 11.94,-11.04 18.37,-17.49 3.44,-3.45 6.79,-6.94 10.05,-10.47 3.26,-3.53 6.44,-7.1 9.53,-10.72 3.09,-3.61 6.09,-7.27 9.01,-10.97 2.92,-3.7 5.75,-7.44 8.5,-11.23 2.75,-3.79 5.41,-7.62 7.99,-11.5 2.58,-3.88 5.07,-7.8 7.48,-11.77 2.41,-3.97 4.73,-7.99 6.97,-12.05 2.24,-4.06 4.4,-8.17 6.47,-12.33 2.07,-4.16 4.06,-8.37 5.97,-12.62 1.91,-4.26 3.73,-8.56 5.47,-12.92 1.74,-4.36 3.4,-8.77 4.98,-13.22 1.58,-4.46 3.07,-8.97 4.49,-13.53 1.42,-4.56 2.75,-9.18 4,-13.85 1.25,-4.67 2.43,-9.39 3.52,-14.17 1.09,-4.78 2.1,-9.61 3.04,-14.5 0.93,-4.89 1.79,-9.83 2.56,-14.84 0.86,-5.53 1.5,-12.73 1.93,-20.76 0.43,-8.03 0.65,-16.88 0.65,-25.72 0,-8.84 -0.21,-17.66 -0.63,-25.61 -0.42,-7.96 -1.06,-15.05 -1.91,-20.44 -1.32,-8.38 -2.89,-16.73 -4.66,-24.93 -1.77,-8.19 -3.76,-16.23 -5.9,-23.97 -2.15,-7.74 -4.47,-15.18 -6.92,-22.19 -2.45,-7.01 -5.03,-13.59 -7.7,-19.6 -0.88,-1.99 -1.58,-3.51 -2.21,-4.68 -0.63,-1.17 -1.18,-1.99 -1.76,-2.55 -0.59,-0.57 -1.21,-0.89 -1.98,-1.06 -0.77,-0.18 -1.68,-0.21 -2.85,-0.21 h -5.02 l -0.67,17.4 c -0.28,7.2 -0.6,11.87 -1.22,15.5 -0.31,1.82 -0.69,3.38 -1.18,4.86 -0.49,1.49 -1.08,2.9 -1.82,4.43 -0.81,1.69 -1.7,3.29 -2.66,4.83 -0.97,1.53 -2.01,2.98 -3.12,4.36 -1.11,1.37 -2.29,2.66 -3.53,3.87 -1.24,1.21 -2.54,2.34 -3.88,3.38 -1.35,1.04 -2.75,2 -4.19,2.88 -1.44,0.88 -2.93,1.67 -4.45,2.37 -1.52,0.7 -3.07,1.32 -4.65,1.84 -1.58,0.53 -3.18,0.96 -4.81,1.31 -1.62,0.35 -3.26,0.6 -4.91,0.76 -1.65,0.16 -3.31,0.23 -4.96,0.21 -1.66,-0.03 -3.32,-0.14 -4.97,-0.36 -1.65,-0.22 -3.29,-0.53 -4.92,-0.94 -1.63,-0.41 -3.24,-0.92 -4.82,-1.53 -1.58,-0.61 -3.15,-1.32 -4.67,-2.13 -1.53,-0.81 -3.02,-1.72 -4.47,-2.74 -1.45,-1.01 -2.86,-2.13 -4.22,-3.36 -2.9,-2.61 -5.24,-4.98 -7.13,-7.42 -0.94,-1.22 -1.78,-2.46 -2.51,-3.75 -0.73,-1.29 -1.37,-2.63 -1.92,-4.07 -0.55,-1.43 -1.02,-2.96 -1.42,-4.61 -0.4,-1.65 -0.73,-3.43 -1,-5.38 -0.55,-3.89 -0.87,-8.44 -1.09,-13.96 l -0.74,-18.51 -17.77,-0.74 c -4.01,-0.17 -7.17,-0.32 -9.77,-0.52 -2.6,-0.2 -4.62,-0.44 -6.37,-0.78 -1.74,-0.34 -3.2,-0.78 -4.66,-1.38 -1.46,-0.6 -2.91,-1.35 -4.64,-2.31 -1.74,-0.96 -3.38,-2 -4.91,-3.1 -1.54,-1.1 -2.97,-2.28 -4.31,-3.52 -1.34,-1.24 -2.57,-2.56 -3.71,-3.94 -1.13,-1.38 -2.17,-2.84 -3.1,-4.36 -0.93,-1.52 -1.76,-3.11 -2.49,-4.77 -0.73,-1.66 -1.36,-3.39 -1.88,-5.18 -0.53,-1.8 -0.95,-3.66 -1.27,-5.59 -0.32,-1.93 -0.54,-3.93 -0.66,-6 -0.23,-3.96 -0.16,-7.52 0.25,-10.8 0.2,-1.64 0.49,-3.21 0.87,-4.73 0.38,-1.52 0.85,-2.98 1.42,-4.4 0.57,-1.42 1.23,-2.8 2,-4.15 0.77,-1.35 1.63,-2.68 2.61,-3.99 1.95,-2.63 4.34,-5.21 7.21,-7.87 2.64,-2.44 5.22,-4.47 7.89,-6.14 1.34,-0.83 2.7,-1.58 4.11,-2.24 1.41,-0.66 2.86,-1.24 4.38,-1.74 3.04,-1 6.34,-1.7 10.06,-2.15 3.73,-0.45 7.89,-0.64 12.64,-0.64 h 12.86 v -16.15 -16.15 l -7.03,-5.86 c -3.07,-2.56 -6.39,-5.14 -9.93,-7.71 -3.53,-2.57 -7.27,-5.14 -11.19,-7.68 -3.91,-2.54 -8,-5.05 -12.23,-7.52 -4.22,-2.47 -8.58,-4.89 -13.04,-7.25 -4.46,-2.36 -9.01,-4.65 -13.63,-6.87 -4.62,-2.21 -9.29,-4.34 -13.99,-6.36 -4.7,-2.02 -9.42,-3.94 -14.13,-5.73 -4.71,-1.79 -9.4,-3.46 -14.05,-4.99 -9.85,-3.23 -19.08,-5.96 -28,-8.23 -4.46,-1.13 -8.85,-2.15 -13.2,-3.07 -4.35,-0.91 -8.66,-1.72 -12.97,-2.42 -4.31,-0.7 -8.62,-1.31 -12.98,-1.81 -4.35,-0.51 -8.74,-0.92 -13.21,-1.24 -8.94,-0.65 -18.19,-0.94 -28.07,-0.93 z m -111.49,173.85 c 6.16,-0.15 13.71,-0.11 23.12,0.05 14.33,0.23 22.3,0.43 27.36,0.93 2.53,0.25 4.33,0.58 5.84,1.02 1.51,0.44 2.73,1.01 4.08,1.73 1.71,0.92 3.26,1.87 4.69,2.91 1.43,1.03 2.73,2.15 3.95,3.37 1.22,1.23 2.34,2.57 3.42,4.06 1.08,1.49 2.1,3.13 3.11,4.96 l 2.86,5.18 h 96.85 c 45.32,0 69.64,0.04 83.46,0.41 6.91,0.18 11.19,0.44 14.16,0.82 2.97,0.38 4.62,0.87 6.27,1.51 2.21,0.86 4.48,2.09 6.72,3.61 2.24,1.52 4.44,3.32 6.51,5.31 2.07,1.99 4.02,4.18 5.74,6.47 1.72,2.29 3.22,4.68 4.4,7.08 l 3.63,7.38 v 131.03 c 0,65.05 -0.01,97.82 -0.4,115.16 -0.2,8.67 -0.49,13.49 -0.93,16.55 -0.22,1.53 -0.47,2.63 -0.77,3.55 -0.3,0.92 -0.64,1.67 -1.02,2.5 -1.14,2.46 -2.43,4.76 -3.87,6.89 -1.44,2.13 -3.04,4.1 -4.79,5.9 -1.75,1.8 -3.66,3.45 -5.72,4.93 -2.06,1.48 -4.29,2.81 -6.67,3.98 l -8.41,4.13 -162.12,0.23 c -44.58,0.06 -85.61,0 -115.8,-0.16 -30.19,-0.16 -49.54,-0.41 -50.76,-0.71 0,0 0,0 0,0 -1.59,-0.39 -3.17,-0.9 -4.73,-1.51 -1.56,-0.61 -3.1,-1.32 -4.61,-2.12 -1.51,-0.8 -2.99,-1.7 -4.42,-2.68 -1.44,-0.98 -2.83,-2.04 -4.17,-3.18 -1.34,-1.14 -2.62,-2.35 -3.84,-3.62 -1.22,-1.27 -2.37,-2.61 -3.45,-4 -1.08,-1.39 -2.07,-2.83 -2.98,-4.32 -0.91,-1.49 -1.73,-3.02 -2.45,-4.59 l -3.4,-7.4 0.03,-129.55 0.03,-129.55 3.38,-7.4 c 0.85,-1.87 1.84,-3.68 2.93,-5.4 1.1,-1.73 2.31,-3.38 3.61,-4.95 1.3,-1.56 2.7,-3.04 4.17,-4.41 1.47,-1.37 3.02,-2.64 4.63,-3.79 1.61,-1.15 3.27,-2.18 4.97,-3.09 1.7,-0.9 3.44,-1.68 5.2,-2.31 1.76,-0.63 3.54,-1.12 5.31,-1.45 1.78,-0.33 3.56,-0.5 5.32,-0.51 1.65,0 2.93,-0.03 3.95,-0.14 1.02,-0.11 1.8,-0.32 2.45,-0.7 0.65,-0.37 1.18,-0.91 1.72,-1.69 0.54,-0.78 1.08,-1.8 1.76,-3.14 0.79,-1.55 2.18,-3.57 3.77,-5.55 1.59,-1.99 3.38,-3.95 5,-5.42 1.06,-0.96 2.12,-1.82 3.22,-2.59 1.1,-0.77 2.26,-1.44 3.52,-2.04 1.26,-0.59 2.63,-1.1 4.17,-1.54 1.54,-0.44 3.25,-0.8 5.18,-1.09 3.87,-0.59 8.65,-0.93 14.81,-1.07 z"/><path class="a" d="m 1188.38,1114.4 c -6.66,0.01 -13.22,0.19 -19.71,0.54 -6.49,0.35 -12.9,0.88 -19.25,1.58 -6.35,0.7 -12.63,1.58 -18.86,2.64 -6.23,1.06 -12.41,2.29 -18.56,3.71 -6.14,1.42 -12.25,3.02 -18.33,4.81 -6.08,1.79 -12.14,3.76 -18.19,5.92 -6.05,2.16 -12.08,4.51 -18.12,7.06 -6.04,2.54 -12.08,5.28 -18.14,8.21 -5.1,2.47 -10.13,5.05 -15.08,7.76 -4.95,2.7 -9.82,5.52 -14.6,8.45 -4.79,2.93 -9.49,5.97 -14.11,9.12 -4.62,3.15 -9.15,6.41 -13.6,9.77 -4.44,3.36 -8.8,6.83 -13.06,10.4 -4.26,3.57 -8.43,7.23 -12.51,11 -4.08,3.76 -8.05,7.63 -11.93,11.58 -3.88,3.95 -7.66,8 -11.34,12.14 -3.68,4.14 -7.26,8.36 -10.73,12.67 -3.47,4.31 -6.84,8.71 -10.09,13.19 -3.26,4.48 -6.4,9.04 -9.44,13.68 -3.03,4.64 -5.96,9.35 -8.76,14.14 -2.81,4.79 -5.5,9.65 -8.07,14.59 -2.57,4.93 -5.03,9.94 -7.36,15.01 -2.33,5.07 -4.54,10.21 -6.62,15.41 -2.08,5.2 -4.04,10.47 -5.87,15.79 -2.87,8.35 -5.43,16.71 -7.68,25.07 -2.25,8.36 -4.2,16.72 -5.84,25.08 -1.64,8.36 -2.98,16.72 -4,25.08 -1.03,8.36 -1.75,16.71 -2.16,25.05 -0.41,8.34 -0.52,16.68 -0.32,25.01 0.2,8.33 0.71,16.64 1.52,24.95 0.81,8.3 1.94,16.59 3.37,24.87 1.43,8.27 3.17,16.53 5.21,24.77 1.42,5.74 2.99,11.42 4.69,17.05 1.7,5.63 3.53,11.19 5.5,16.7 1.97,5.51 4.07,10.95 6.3,16.33 2.23,5.38 4.59,10.69 7.08,15.93 2.49,5.24 5.11,10.42 7.85,15.52 2.74,5.1 5.61,10.13 8.59,15.08 2.99,4.95 6.1,9.83 9.33,14.62 3.23,4.79 6.58,9.51 10.04,14.14 3.46,4.63 7.05,9.17 10.74,13.63 3.69,4.46 7.5,8.83 11.42,13.1 3.92,4.28 7.95,8.46 12.09,12.55 4.14,4.09 8.38,8.09 12.73,11.98 4.35,3.9 8.81,7.69 13.37,11.39 4.56,3.69 9.22,7.29 13.98,10.77 4.76,3.49 9.62,6.86 14.58,10.13 4.96,3.27 10.01,6.43 15.16,9.47 6.22,3.68 12.57,7.16 19.03,10.43 6.46,3.27 13.04,6.34 19.73,9.21 6.69,2.86 13.48,5.52 20.38,7.98 6.9,2.45 13.9,4.7 21,6.73 7.1,2.04 14.29,3.86 21.58,5.48 7.29,1.62 14.66,3.02 22.12,4.21 7.46,1.19 15,2.17 22.62,2.93 7.62,0.76 15.31,1.31 23.07,1.64 2.44,0.1 14.02,-0.46 25.73,-1.26 0,0 0,0 0,0 6.18,-0.42 12.38,-1.03 18.59,-1.81 6.21,-0.78 12.42,-1.75 18.62,-2.88 6.2,-1.13 12.38,-2.44 18.53,-3.91 6.15,-1.47 12.26,-3.11 18.33,-4.91 6.06,-1.8 12.07,-3.76 18.01,-5.88 5.94,-2.12 11.8,-4.39 17.58,-6.81 5.77,-2.42 11.46,-4.99 17.03,-7.71 5.57,-2.72 11.03,-5.58 16.37,-8.57 7.8,-4.39 14.86,-8.6 21.47,-12.85 6.61,-4.25 12.76,-8.55 18.73,-13.1 5.98,-4.55 11.78,-9.36 17.7,-14.64 5.92,-5.28 11.94,-11.04 18.37,-17.49 3.44,-3.45 6.79,-6.94 10.05,-10.47 3.26,-3.53 6.44,-7.1 9.53,-10.72 3.09,-3.61 6.09,-7.27 9.01,-10.97 2.92,-3.7 5.75,-7.44 8.5,-11.23 2.75,-3.79 5.41,-7.62 7.99,-11.5 2.58,-3.88 5.07,-7.8 7.48,-11.77 2.41,-3.97 4.73,-7.99 6.97,-12.05 2.24,-4.06 4.4,-8.17 6.47,-12.33 2.07,-4.16 4.06,-8.37 5.97,-12.62 1.91,-4.26 3.73,-8.56 5.47,-12.92 1.74,-4.36 3.4,-8.77 4.98,-13.22 1.58,-4.46 3.07,-8.97 4.49,-13.53 1.42,-4.56 2.75,-9.18 4,-13.85 1.25,-4.67 2.43,-9.39 3.52,-14.17 1.09,-4.78 2.1,-9.61 3.04,-14.5 0.93,-4.89 1.79,-9.83 2.56,-14.84 0.86,-5.53 1.5,-12.73 1.93,-20.76 0.43,-8.03 0.65,-16.88 0.65,-25.72 0,-8.84 -0.21,-17.66 -0.63,-25.61 -0.42,-7.96 -1.06,-15.05 -1.91,-20.44 -1.32,-8.38 -2.89,-16.73 -4.66,-24.93 -1.77,-8.19 -3.76,-16.23 -5.9,-23.97 -2.15,-7.74 -4.47,-15.18 -6.92,-22.19 -2.45,-7.01 -5.03,-13.59 -7.7,-19.6 -0.88,-1.99 -1.58,-3.51 -2.21,-4.68 -0.63,-1.17 -1.18,-1.99 -1.76,-2.55 -0.59,-0.57 -1.21,-0.89 -1.98,-1.06 -0.77,-0.18 -1.68,-0.21 -2.85,-0.21 h -5.02 l -0.67,17.4 c -0.28,7.2 -0.6,11.87 -1.22,15.5 -0.31,1.82 -0.69,3.38 -1.18,4.86 -0.49,1.49 -1.08,2.9 -1.82,4.43 -0.81,1.69 -1.7,3.29 -2.66,4.83 -0.97,1.53 -2.01,2.98 -3.12,4.36 -1.11,1.37 -2.29,2.66 -3.53,3.87 -1.24,1.21 -2.54,2.34 -3.88,3.38 -1.35,1.04 -2.75,2 -4.19,2.88 -1.44,0.88 -2.93,1.67 -4.45,2.37 -1.52,0.7 -3.07,1.32 -4.65,1.84 -1.58,0.53 -3.18,0.96 -4.81,1.31 -1.62,0.35 -3.26,0.6 -4.91,0.76 -1.65,0.16 -3.31,0.23 -4.96,0.21 -1.66,-0.03 -3.32,-0.14 -4.97,-0.36 -1.65,-0.22 -3.29,-0.53 -4.92,-0.94 -1.63,-0.41 -3.24,-0.92 -4.82,-1.53 -1.58,-0.61 -3.15,-1.32 -4.67,-2.13 -1.53,-0.81 -3.02,-1.72 -4.47,-2.74 -1.45,-1.01 -2.86,-2.13 -4.22,-3.36 -2.9,-2.61 -5.24,-4.98 -7.13,-7.42 -0.94,-1.22 -1.78,-2.46 -2.51,-3.75 -0.73,-1.29 -1.37,-2.63 -1.92,-4.07 -0.55,-1.43 -1.02,-2.96 -1.42,-4.61 -0.4,-1.65 -0.73,-3.43 -1,-5.38 -0.55,-3.89 -0.87,-8.44 -1.09,-13.96 l -0.74,-18.51 -17.77,-0.74 c -4.01,-0.17 -7.17,-0.32 -9.77,-0.52 -2.6,-0.2 -4.62,-0.44 -6.37,-0.78 -1.74,-0.34 -3.2,-0.78 -4.66,-1.38 -1.46,-0.6 -2.91,-1.35 -4.64,-2.31 -1.74,-0.96 -3.38,-2 -4.91,-3.1 -1.54,-1.1 -2.97,-2.28 -4.31,-3.52 -1.34,-1.24 -2.57,-2.56 -3.71,-3.94 -1.13,-1.38 -2.17,-2.84 -3.1,-4.36 -0.93,-1.52 -1.76,-3.11 -2.49,-4.77 -0.73,-1.66 -1.36,-3.39 -1.88,-5.18 -0.53,-1.8 -0.95,-3.66 -1.27,-5.59 -0.32,-1.93 -0.54,-3.93 -0.66,-6 -0.23,-3.96 -0.16,-7.52 0.25,-10.8 0.2,-1.64 0.49,-3.21 0.87,-4.73 0.38,-1.52 0.85,-2.98 1.42,-4.4 0.57,-1.42 1.23,-2.8 2,-4.15 0.77,-1.35 1.63,-2.68 2.61,-3.99 1.95,-2.63 4.34,-5.21 7.21,-7.87 2.64,-2.44 5.22,-4.47 7.89,-6.14 1.34,-0.83 2.7,-1.58 4.11,-2.24 1.41,-0.66 2.86,-1.24 4.38,-1.74 3.04,-1 6.34,-1.7 10.06,-2.15 3.73,-0.45 7.89,-0.64 12.64,-0.64 h 12.86 v -16.15 -16.15 l -7.03,-5.86 c -3.07,-2.56 -6.39,-5.14 -9.93,-7.71 -3.53,-2.57 -7.27,-5.14 -11.19,-7.68 -3.91,-2.54 -8,-5.05 -12.23,-7.52 -4.22,-2.47 -8.58,-4.89 -13.04,-7.25 -4.46,-2.36 -9.01,-4.65 -13.63,-6.87 -4.62,-2.21 -9.29,-4.34 -13.99,-6.36 -4.7,-2.02 -9.42,-3.94 -14.13,-5.73 -4.71,-1.79 -9.4,-3.46 -14.05,-4.99 -9.85,-3.23 -19.08,-5.96 -28,-8.23 -4.46,-1.13 -8.85,-2.15 -13.2,-3.07 -4.35,-0.91 -8.66,-1.72 -12.97,-2.42 -4.31,-0.7 -8.62,-1.31 -12.98,-1.81 -4.35,-0.51 -8.74,-0.92 -13.21,-1.24 -8.94,-0.65 -18.19,-0.94 -28.07,-0.93 z m -111.49,173.85 c 6.16,-0.15 13.71,-0.11 23.12,0.05 14.33,0.23 22.3,0.43 27.36,0.93 2.53,0.25 4.33,0.58 5.84,1.02 1.51,0.44 2.73,1.01 4.08,1.73 1.71,0.92 3.26,1.87 4.69,2.91 1.43,1.03 2.73,2.15 3.95,3.37 1.22,1.23 2.34,2.57 3.42,4.06 1.08,1.49 2.1,3.13 3.11,4.96 l 2.86,5.18 h 96.85 c 45.32,0 69.64,0.04 83.46,0.41 6.91,0.18 11.19,0.44 14.16,0.82 2.97,0.38 4.62,0.87 6.27,1.51 2.21,0.86 4.48,2.09 6.72,3.61 2.24,1.52 4.44,3.32 6.51,5.31 2.07,1.99 4.02,4.18 5.74,6.47 1.72,2.29 3.22,4.68 4.4,7.08 l 3.63,7.38 v 131.03 c 0,65.05 -0.01,97.82 -0.4,115.16 -0.2,8.67 -0.49,13.49 -0.93,16.55 -0.22,1.53 -0.47,2.63 -0.77,3.55 -0.3,0.92 -0.64,1.67 -1.02,2.5 -1.14,2.46 -2.43,4.76 -3.87,6.89 -1.44,2.13 -3.04,4.1 -4.79,5.9 -1.75,1.8 -3.66,3.45 -5.72,4.93 -2.06,1.48 -4.29,2.81 -6.67,3.98 l -8.41,4.13 -162.12,0.23 c -44.58,0.06 -85.61,0 -115.8,-0.16 -30.19,-0.16 -49.54,-0.41 -50.76,-0.71 0,0 0,0 0,0 -1.59,-0.39 -3.17,-0.9 -4.73,-1.51 -1.56,-0.61 -3.1,-1.32 -4.61,-2.12 -1.51,-0.8 -2.99,-1.7 -4.42,-2.68 -1.44,-0.98 -2.83,-2.04 -4.17,-3.18 -1.34,-1.14 -2.62,-2.35 -3.84,-3.62 -1.22,-1.27 -2.37,-2.61 -3.45,-4 -1.08,-1.39 -2.07,-2.83 -2.98,-4.32 -0.91,-1.49 -1.73,-3.02 -2.45,-4.59 l -3.4,-7.4 0.03,-129.55 0.03,-129.55 3.38,-7.4 c 0.85,-1.87 1.84,-3.68 2.93,-5.4 1.1,-1.73 2.31,-3.38 3.61,-4.95 1.3,-1.56 2.7,-3.04 4.17,-4.41 1.47,-1.37 3.02,-2.64 4.63,-3.79 1.61,-1.15 3.27,-2.18 4.97,-3.09 1.7,-0.9 3.44,-1.68 5.2,-2.31 1.76,-0.63 3.54,-1.12 5.31,-1.45 1.78,-0.33 3.56,-0.5 5.32,-0.51 1.65,0 2.93,-0.03 3.95,-0.14 1.02,-0.11 1.8,-0.32 2.45,-0.7 0.65,-0.37 1.18,-0.91 1.72,-1.69 0.54,-0.78 1.08,-1.8 1.76,-3.14 0.79,-1.55 2.18,-3.57 3.77,-5.55 1.59,-1.99 3.38,-3.95 5,-5.42 1.06,-0.96 2.12,-1.82 3.22,-2.59 1.1,-0.77 2.26,-1.44 3.52,-2.04 1.26,-0.59 2.63,-1.1 4.17,-1.54 1.54,-0.44 3.25,-0.8 5.18,-1.09 3.87,-0.59 8.65,-0.93 14.81,-1.07 z"/><path class="a" d="m 3774.58,751.1 c -6.66,0.01 -13.22,0.19 -19.71,0.54 -6.49,0.35 -12.9,0.88 -19.25,1.58 -6.35,0.7 -12.63,1.58 -18.86,2.64 -6.23,1.06 -12.41,2.29 -18.56,3.71 -6.14,1.42 -12.25,3.02 -18.33,4.81 -6.08,1.79 -12.14,3.76 -18.19,5.92 -6.05,2.16 -12.08,4.51 -18.12,7.06 -6.04,2.54 -12.08,5.28 -18.14,8.21 -5.1,2.47 -10.13,5.05 -15.08,7.76 -4.95,2.7 -9.82,5.52 -14.6,8.45 -4.79,2.93 -9.49,5.97 -14.11,9.12 -4.62,3.15 -9.15,6.41 -13.6,9.77 -4.44,3.36 -8.8,6.83 -13.06,10.4 -4.26,3.57 -8.43,7.23 -12.51,11 -4.08,3.76 -8.05,7.63 -11.93,11.58 -3.88,3.95 -7.66,8 -11.34,12.14 -3.68,4.14 -7.26,8.36 -10.73,12.67 -3.47,4.31 -6.84,8.71 -10.09,13.19 -3.26,4.48 -6.4,9.04 -9.44,13.68 -3.03,4.64 -5.96,9.35 -8.76,14.14 -2.81,4.79 -5.5,9.65 -8.07,14.59 -2.57,4.93 -5.03,9.94 -7.36,15.01 -2.33,5.07 -4.54,10.21 -6.62,15.41 -2.08,5.2 -4.04,10.47 -5.87,15.79 -2.87,8.35 -5.43,16.71 -7.68,25.07 -2.25,8.36 -4.2,16.72 -5.84,25.08 -1.64,8.36 -2.98,16.72 -4,25.08 -1.03,8.36 -1.75,16.71 -2.16,25.05 -0.41,8.34 -0.52,16.68 -0.32,25.01 0.2,8.33 0.71,16.64 1.52,24.95 0.81,8.3 1.94,16.59 3.37,24.87 1.43,8.27 3.17,16.53 5.21,24.77 1.42,5.74 2.99,11.42 4.69,17.05 1.7,5.63 3.53,11.19 5.5,16.7 1.97,5.51 4.07,10.95 6.3,16.33 0,0 3.06,-2.52 8.67,-6.49 2.81,-1.99 6.26,-4.34 10.29,-6.92 4.03,-2.58 8.64,-5.39 13.76,-8.29 5.13,-2.91 10.77,-5.91 16.87,-8.87 6.1,-2.97 12.66,-5.89 19.61,-8.65 6.95,-2.76 14.3,-5.35 21.97,-7.63 3.84,-1.14 7.76,-2.21 11.76,-3.18 4,-0.97 8.07,-1.85 12.21,-2.63 l 0.01,-64.77 0.03,-129.55 3.38,-7.4 c 0.85,-1.87 1.84,-3.68 2.93,-5.4 1.1,-1.73 2.31,-3.38 3.61,-4.95 1.3,-1.56 2.7,-3.04 4.18,-4.41 1.47,-1.37 3.02,-2.64 4.63,-3.79 1.61,-1.15 3.27,-2.18 4.97,-3.09 1.7,-0.9 3.44,-1.68 5.2,-2.31 1.76,-0.63 3.54,-1.12 5.31,-1.45 1.78,-0.33 3.56,-0.5 5.32,-0.51 1.65,0 2.93,-0.03 3.95,-0.14 1.02,-0.11 1.8,-0.32 2.45,-0.7 0.65,-0.37 1.18,-0.91 1.72,-1.69 0.54,-0.78 1.08,-1.8 1.76,-3.14 0.79,-1.55 2.18,-3.57 3.77,-5.55 1.59,-1.99 3.38,-3.95 5,-5.42 1.06,-0.96 2.12,-1.82 3.22,-2.59 1.1,-0.77 2.26,-1.44 3.52,-2.04 1.26,-0.59 2.63,-1.1 4.17,-1.54 1.54,-0.44 3.25,-0.8 5.18,-1.09 3.87,-0.59 8.65,-0.93 14.81,-1.07 v 0 c 6.16,-0.15 13.71,-0.11 23.12,0.05 14.33,0.23 22.3,0.43 27.36,0.93 2.53,0.25 4.33,0.58 5.84,1.02 1.51,0.44 2.73,1.01 4.08,1.73 1.71,0.92 3.26,1.87 4.69,2.91 1.43,1.03 2.73,2.15 3.95,3.37 1.22,1.23 2.34,2.57 3.42,4.06 1.08,1.49 2.1,3.13 3.11,4.96 l 2.86,5.18 h 48.42 c -0.14,-3.7 0.09,-7.39 0.22,-11.08 0.07,-2.09 -0.03,-4.19 0.12,-6.28 0,0 0,0 0,0 0,0 0,-0.01 0,-0.01 0.17,-2.33 0.6,-4.64 0.86,-6.96 0.39,-3.41 0.68,-6.84 1.27,-10.22 0,-0.01 0,-0.01 0,-0.01 0,0 0,-0.01 0,-0.01 0.24,-1.38 0.63,-2.73 0.9,-4.11 0.83,-4.28 1.68,-8.56 2.77,-12.76 0,-0.01 0.01,-0.02 0.01,-0.03 0,0 0,0 0,0 0.12,-0.47 0.3,-0.93 0.42,-1.4 1.36,-5.07 2.85,-10.1 4.53,-15.04 0.01,-0.01 0.01,-0.03 0.02,-0.04 0,0 0,0 0,0 0.02,-0.06 0.04,-0.11 0.07,-0.17 1.82,-5.33 3.81,-10.57 5.93,-15.7 0.01,-0.02 0.02,-0.04 0.02,-0.05 2.14,-5.18 4.41,-10.24 6.77,-15.17 0.01,-0.02 0.02,-0.04 0.03,-0.06 2.36,-4.92 4.81,-9.71 7.31,-14.34 0.01,-0.02 0.03,-0.05 0.04,-0.07 2.5,-4.62 5.04,-9.09 7.59,-13.38 0.01,-0.02 0.03,-0.04 0.04,-0.06 0,0 0.01,-0.01 0.01,-0.01 0.73,-1.22 1.42,-2.14 2.15,-3.34 4.38,-7.18 8.79,-14.11 12.94,-20.09 0.02,-0.03 0.03,-0.04 0.05,-0.07 0,0 0,-0.01 0.01,-0.01 0.89,-1.28 1.57,-2.1 2.44,-3.32 3.83,-5.4 7.63,-10.63 10.8,-14.7 0.02,-0.03 0.01,-0.02 0.04,-0.04 0.01,-0.01 0.01,-0.02 0.02,-0.03 5.76,-7.4 7.74,-9.48 9.63,-11.62 0.64,-0.72 3.21,-3.88 3.25,-3.92 -5.07,-1.51 -10.35,-3.23 -15.19,-4.46 -4.46,-1.13 -8.85,-2.15 -13.2,-3.07 -4.35,-0.91 -8.66,-1.72 -12.97,-2.42 -4.31,-0.7 -8.62,-1.31 -12.98,-1.81 -4.35,-0.51 -8.74,-0.92 -13.21,-1.24 -8.94,-0.65 -18.19,-0.94 -28.07,-0.93 z"/><path class="c" d="m 3870.22,765.01 c -0.03,0.04 -2.61,3.2 -3.25,3.92 -1.89,2.14 -3.9,4.27 -9.65,11.65 -3.18,4.09 -6.98,9.32 -10.84,14.75 -0.87,1.22 -1.56,2.05 -2.45,3.33 -4.16,6 -8.58,12.95 -12.99,20.16 -0.73,1.2 -1.43,2.12 -2.16,3.35 -2.56,4.31 -5.12,8.79 -7.63,13.44 -2.51,4.65 -4.97,9.46 -7.35,14.41 -2.37,4.95 -4.65,10.03 -6.81,15.23 -2.13,5.14 -4.12,10.4 -5.95,15.75 -0.02,0.06 -0.04,0.11 -0.07,0.17 0,0 0,0 0,0 -1.69,4.95 -3.18,9.99 -4.55,15.08 -0.13,0.47 -0.3,0.93 -0.42,1.4 0,0 0,0 0,0 -1.1,4.22 -1.95,8.51 -2.78,12.79 -0.27,1.38 -0.66,2.73 -0.9,4.12 -0.58,3.39 -0.88,6.82 -1.27,10.24 -0.27,2.33 -0.69,4.63 -0.86,6.97 -0.15,2.09 -0.05,4.19 -0.12,6.28 -0.13,3.69 -0.35,7.38 -0.22,11.08 h 48.42 0 c 45.32,0 69.64,0.04 83.46,0.41 0,0 0,0 0,0 6.91,0.18 11.19,0.44 14.16,0.82 0,0 0,0 0,0 2.97,0.38 4.62,0.87 6.27,1.51 0,0 0,0 0,0 2.21,0.86 4.48,2.09 6.72,3.61 0,0 0,0 0,0 2.24,1.52 4.44,3.32 6.51,5.31 0,0 0,0 0,0 2.07,1.99 4.02,4.18 5.74,6.47 1.72,2.29 3.22,4.68 4.4,7.08 l 3.63,7.38 V 1112.73 c 0,65.05 -0.01,97.82 -0.4,115.16 -0.2,8.67 -0.49,13.49 -0.93,16.55 -0.22,1.53 -0.47,2.63 -0.77,3.55 -0.3,0.92 -0.64,1.67 -1.02,2.5 -1.14,2.46 -2.43,4.76 -3.87,6.89 -1.44,2.13 -3.04,4.1 -4.79,5.9 0,0 0,0 0,0 -1.75,1.8 -3.65,3.45 -5.72,4.93 0,0 0,0 0,0 -2.06,1.48 -4.28,2.81 -6.67,3.98 h 0 l -8.41,4.13 h 0 l -41.85,0.06 c 0.82,1.74 1.64,3.62 2.46,5.35 4.82,10.08 9.64,19.77 14.44,28.96 4.8,9.19 9.56,17.89 14.27,25.99 4.7,8.1 9.34,15.6 13.87,22.39 4.53,6.79 8.97,12.87 13.26,18.15 2.15,2.64 4.26,5.07 6.33,7.28 2.07,2.22 4.11,4.21 6.1,5.98 0,0 0,0 0,0 6.61,-4.25 12.75,-8.55 18.73,-13.1 5.98,-4.55 11.78,-9.36 17.7,-14.64 5.92,-5.28 11.94,-11.04 18.37,-17.49 3.44,-3.45 6.79,-6.94 10.05,-10.47 3.26,-3.53 6.44,-7.1 9.53,-10.72 3.09,-3.61 6.09,-7.27 9.01,-10.97 2.92,-3.7 5.75,-7.44 8.5,-11.23 2.75,-3.79 5.41,-7.62 7.99,-11.5 2.58,-3.88 5.07,-7.8 7.48,-11.77 2.41,-3.97 4.73,-7.99 6.97,-12.05 2.24,-4.06 4.4,-8.17 6.47,-12.33 2.07,-4.16 4.06,-8.37 5.97,-12.62 1.91,-4.26 3.73,-8.56 5.47,-12.92 1.74,-4.36 3.4,-8.77 4.98,-13.22 1.58,-4.46 3.07,-8.97 4.49,-13.53 1.42,-4.56 2.75,-9.18 4,-13.85 1.25,-4.67 2.43,-9.39 3.52,-14.17 1.09,-4.78 2.1,-9.61 3.04,-14.5 0.93,-4.89 1.79,-9.83 2.56,-14.84 0.86,-5.53 1.5,-12.73 1.93,-20.76 0.43,-8.03 0.65,-16.88 0.65,-25.72 0,-8.84 -0.21,-17.66 -0.63,-25.61 -0.42,-7.96 -1.06,-15.05 -1.91,-20.44 -1.32,-8.38 -2.89,-16.73 -4.66,-24.93 -1.77,-8.19 -3.76,-16.23 -5.9,-23.97 -2.15,-7.74 -4.47,-15.18 -6.92,-22.19 -2.45,-7.01 -5.03,-13.59 -7.7,-19.6 -0.88,-1.99 -1.58,-3.51 -2.21,-4.68 -0.63,-1.17 -1.18,-1.99 -1.76,-2.55 -0.59,-0.57 -1.21,-0.89 -1.98,-1.06 -0.77,-0.18 -1.68,-0.21 -2.85,-0.21 h -5.02 l -0.67,17.4 c -0.28,7.2 -0.6,11.87 -1.22,15.5 -0.31,1.82 -0.69,3.38 -1.18,4.86 -0.49,1.49 -1.08,2.9 -1.82,4.43 -0.81,1.69 -1.7,3.29 -2.67,4.83 -0.97,1.53 -2.01,2.98 -3.12,4.36 -1.11,1.37 -2.29,2.66 -3.53,3.87 -1.24,1.21 -2.54,2.34 -3.89,3.38 -1.35,1.04 -2.75,2 -4.19,2.88 -1.44,0.88 -2.93,1.67 -4.45,2.37 -1.52,0.7 -3.07,1.32 -4.65,1.84 -1.58,0.53 -3.18,0.96 -4.81,1.31 -1.62,0.35 -3.26,0.6 -4.91,0.76 -1.65,0.16 -3.31,0.23 -4.96,0.21 -1.66,-0.03 -3.32,-0.14 -4.97,-0.36 -1.65,-0.22 -3.29,-0.53 -4.92,-0.94 -1.63,-0.41 -3.24,-0.92 -4.82,-1.53 -1.58,-0.61 -3.15,-1.32 -4.67,-2.13 -1.53,-0.81 -3.02,-1.72 -4.47,-2.74 -1.45,-1.01 -2.86,-2.13 -4.22,-3.36 -2.9,-2.61 -5.24,-4.98 -7.13,-7.42 -0.94,-1.22 -1.77,-2.46 -2.51,-3.75 -0.73,-1.29 -1.37,-2.63 -1.92,-4.07 -0.55,-1.43 -1.02,-2.96 -1.42,-4.61 -0.4,-1.65 -0.73,-3.43 -1,-5.38 -0.55,-3.89 -0.87,-8.44 -1.09,-13.96 l -0.74,-18.51 -17.77,-0.74 c -4.01,-0.17 -7.17,-0.32 -9.77,-0.52 -2.6,-0.2 -4.62,-0.44 -6.37,-0.78 -1.74,-0.34 -3.2,-0.78 -4.66,-1.38 -1.46,-0.6 -2.91,-1.35 -4.64,-2.31 -1.74,-0.96 -3.38,-2 -4.91,-3.1 -1.54,-1.1 -2.97,-2.28 -4.31,-3.52 -1.34,-1.24 -2.57,-2.56 -3.71,-3.94 -1.13,-1.38 -2.17,-2.84 -3.1,-4.36 -0.93,-1.52 -1.76,-3.11 -2.49,-4.77 -0.73,-1.66 -1.36,-3.39 -1.88,-5.18 -0.53,-1.8 -0.95,-3.66 -1.27,-5.59 -0.32,-1.93 -0.54,-3.93 -0.66,-6 -0.23,-3.96 -0.16,-7.52 0.25,-10.8 0.2,-1.64 0.49,-3.21 0.87,-4.73 0.38,-1.52 0.85,-2.98 1.42,-4.39 0.57,-1.42 1.23,-2.8 2,-4.15 0.77,-1.35 1.63,-2.68 2.61,-3.99 1.95,-2.63 4.34,-5.21 7.21,-7.87 2.64,-2.44 5.22,-4.47 7.89,-6.14 1.34,-0.83 2.7,-1.58 4.11,-2.24 1.41,-0.66 2.86,-1.24 4.38,-1.74 3.04,-1 6.34,-1.7 10.06,-2.15 3.73,-0.45 7.89,-0.64 12.64,-0.64 h 12.86 v -16.15 -16.15 l -7.03,-5.86 c -3.07,-2.56 -6.39,-5.14 -9.93,-7.71 -3.53,-2.57 -7.27,-5.14 -11.19,-7.68 -3.91,-2.54 -8,-5.05 -12.23,-7.52 -4.22,-2.47 -8.58,-4.89 -13.04,-7.25 -4.46,-2.36 -9.01,-4.65 -13.63,-6.87 -4.62,-2.21 -9.29,-4.34 -13.99,-6.36 -4.7,-2.02 -9.42,-3.94 -14.13,-5.73 -4.71,-1.79 -9.4,-3.46 -14.05,-4.99 -4.51,-1.48 -8.54,-2.49 -12.81,-3.76 z"/><path class="b" d="m 3965.6,1390.5 c -1.99,-1.77 -4.02,-3.77 -6.1,-5.98 -2.07,-2.22 -4.19,-4.65 -6.33,-7.28 -4.29,-5.27 -8.73,-11.35 -13.26,-18.15 -4.53,-6.79 -9.17,-14.29 -13.87,-22.39 -4.7,-8.1 -9.47,-16.8 -14.27,-25.99 -4.8,-9.19 -9.62,-18.88 -14.44,-28.96 -0.82,-1.72 -1.64,-3.6 -2.46,-5.35 l -120.27,0.17 c 0,0 0,0 0,0 -44.58,0.06 -85.61,0 -115.8,-0.16 0,0 0,0 0,0 -30.19,-0.16 -49.54,-0.41 -50.76,-0.71 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 0,0 -1.59,-0.39 -3.17,-0.9 -4.73,-1.51 0,0 0,0 0,0 -1.56,-0.61 -3.1,-1.32 -4.61,-2.12 0,0 0,0 0,0 -1.51,-0.8 -2.99,-1.7 -4.42,-2.68 0,0 0,0 0,0 -1.44,-0.98 -2.83,-2.04 -4.17,-3.18 0,0 0,0 0,0 -1.34,-1.14 -2.62,-2.35 -3.84,-3.62 0,0 0,0 0,0 -1.22,-1.27 -2.37,-2.61 -3.45,-4 -1.08,-1.39 -2.07,-2.83 -2.98,-4.32 -0.91,-1.49 -1.73,-3.02 -2.45,-4.59 l -3.4,-7.4 0.01,-64.77 c -4.14,0.77 -8.21,1.65 -12.21,2.63 -4,0.97 -7.92,2.04 -11.76,3.18 -7.68,2.28 -15.02,4.87 -21.97,7.63 -6.95,2.76 -13.51,5.69 -19.61,8.65 -6.1,2.97 -11.74,5.97 -16.87,8.87 -5.13,2.91 -9.73,5.72 -13.76,8.29 -4.03,2.58 -7.48,4.93 -10.29,6.92 -5.62,3.97 -8.67,6.49 -8.67,6.49 2.23,5.38 4.59,10.69 7.08,15.93 2.49,5.24 5.11,10.42 7.85,15.52 2.74,5.1 5.61,10.13 8.59,15.08 2.99,4.95 6.1,9.83 9.33,14.62 3.23,4.79 6.58,9.51 10.04,14.14 3.46,4.63 7.05,9.17 10.74,13.63 3.69,4.46 7.5,8.83 11.42,13.1 3.92,4.28 7.95,8.46 12.09,12.55 4.14,4.09 8.38,8.09 12.73,11.98 4.35,3.9 8.81,7.69 13.37,11.39 4.56,3.69 9.22,7.29 13.98,10.77 4.76,3.49 9.62,6.86 14.58,10.13 4.96,3.27 10.01,6.43 15.16,9.47 6.22,3.68 12.57,7.16 19.03,10.43 6.46,3.27 13.04,6.34 19.73,9.21 6.69,2.86 13.48,5.52 20.38,7.98 6.9,2.45 13.9,4.7 21,6.73 7.1,2.04 14.29,3.86 21.58,5.48 7.29,1.62 14.66,3.02 22.12,4.21 7.46,1.19 15,2.17 22.62,2.93 7.62,0.76 15.31,1.31 23.07,1.64 2.44,0.1 14.02,-0.46 25.73,-1.26 h 0 c 6.18,-0.42 12.38,-1.03 18.59,-1.81 6.21,-0.78 12.42,-1.75 18.62,-2.88 6.2,-1.13 12.38,-2.44 18.53,-3.91 6.15,-1.47 12.26,-3.11 18.33,-4.91 6.06,-1.8 12.07,-3.76 18.01,-5.88 5.94,-2.12 11.8,-4.39 17.58,-6.81 5.77,-2.42 11.46,-4.99 17.03,-7.71 5.57,-2.72 11.03,-5.58 16.37,-8.57 7.8,-4.39 14.86,-8.6 21.47,-12.85 z"/><path class="a" d="m 4034.82,804.64 c 2.17,-0.08 4.34,0.07 6.47,0.45 2.13,0.38 4.22,0.99 6.21,1.81 1.99,0.82 3.9,1.86 5.66,3.11 1.76,1.25 3.38,2.7 4.8,4.36 1.42,1.65 2.66,3.51 3.64,5.55 0.72,1.48 1.27,2.79 1.71,4.27 0.43,1.48 0.74,3.14 0.96,5.33 0.44,4.39 0.51,10.9 0.51,22.4 v 25.44 l 24.06,0.03 c 6.83,0.01 12.27,0.1 16.71,0.38 2.22,0.14 4.2,0.33 5.97,0.57 1.78,0.25 3.35,0.55 4.78,0.93 1.43,0.38 2.71,0.83 3.89,1.37 1.18,0.54 2.26,1.16 3.29,1.89 1.03,0.73 2.01,1.55 3,2.49 0.98,0.94 1.97,1.99 3,3.17 1.35,1.54 2.52,3.16 3.51,4.85 0.99,1.69 1.79,3.43 2.42,5.22 0.63,1.79 1.07,3.61 1.34,5.45 0.27,1.84 0.36,3.7 0.27,5.54 -0.09,1.85 -0.35,3.68 -0.8,5.49 -0.44,1.81 -1.06,3.58 -1.85,5.29 -0.79,1.72 -1.76,3.38 -2.9,4.96 -1.14,1.58 -2.46,3.08 -3.95,4.48 -1.99,1.86 -3.8,3.33 -5.81,4.49 -1,0.58 -2.06,1.08 -3.2,1.51 -1.15,0.43 -2.39,0.79 -3.77,1.1 -2.76,0.61 -6.08,0.98 -10.33,1.21 -4.25,0.22 -9.42,0.3 -15.89,0.3 h -23.74 v 22.85 c 0,6.28 -0.18,12.47 -0.46,17.36 -0.29,4.9 -0.68,8.51 -1.11,9.66 -0.56,1.48 -1.37,2.99 -2.39,4.46 -1.01,1.47 -2.23,2.92 -3.59,4.28 -1.36,1.36 -2.87,2.63 -4.46,3.76 -1.6,1.13 -3.28,2.13 -5.01,2.92 h 0 c -1.75,0.81 -3.55,1.43 -5.36,1.85 -1.81,0.43 -3.64,0.66 -5.46,0.72 -1.82,0.06 -3.64,-0.07 -5.42,-0.36 -1.78,-0.29 -3.54,-0.76 -5.23,-1.39 -1.7,-0.63 -3.34,-1.42 -4.9,-2.36 -1.56,-0.94 -3.04,-2.04 -4.42,-3.28 -1.38,-1.24 -2.65,-2.62 -3.79,-4.14 -1.14,-1.52 -2.16,-3.17 -3.02,-4.95 -0.69,-1.42 -1.23,-2.7 -1.65,-4.14 -0.42,-1.44 -0.72,-3.04 -0.94,-5.1 -0.43,-4.13 -0.52,-10.12 -0.52,-20.4 v -23.22 h -22.26 c -6.21,0 -11.11,-0.06 -15.1,-0.28 -3.99,-0.22 -7.06,-0.6 -9.59,-1.23 -1.27,-0.32 -2.4,-0.69 -3.45,-1.15 -1.05,-0.45 -2.01,-0.98 -2.93,-1.6 -1.84,-1.23 -3.53,-2.81 -5.44,-4.82 -1.48,-1.57 -2.72,-3.06 -3.73,-4.56 -1.02,-1.5 -1.81,-3.02 -2.43,-4.63 -0.61,-1.61 -1.04,-3.32 -1.31,-5.21 -0.27,-1.89 -0.39,-3.96 -0.39,-6.29 0,-1.47 0.13,-2.94 0.37,-4.41 0.24,-1.47 0.59,-2.93 1.05,-4.36 0.46,-1.43 1.02,-2.84 1.67,-4.2 0.65,-1.36 1.39,-2.68 2.21,-3.93 0.82,-1.26 1.72,-2.45 2.69,-3.56 0.97,-1.11 2.01,-2.15 3.1,-3.09 1.09,-0.94 2.24,-1.78 3.44,-2.51 1.2,-0.73 2.44,-1.34 3.71,-1.82 1.15,-0.43 4.68,-0.83 9.44,-1.11 4.76,-0.29 10.76,-0.46 16.84,-0.46 h 22.11 l 0.03,-24.8 c 0.01,-6.84 0.1,-12.31 0.35,-16.78 0.26,-4.47 0.69,-7.96 1.38,-10.83 0.35,-1.44 0.76,-2.72 1.25,-3.9 0.49,-1.18 1.05,-2.26 1.71,-3.28 1.31,-2.04 2.97,-3.85 5.09,-5.83 1.68,-1.57 3.51,-2.88 5.45,-3.93 1.94,-1.05 3.99,-1.86 6.09,-2.42 2.1,-0.56 4.26,-0.87 6.43,-0.95 z"/><path class="a" d="m 3778.45,1078.78 c -2.9,0.02 -6.16,0.26 -9.09,0.64 -2.93,0.38 -5.52,0.89 -7.07,1.44 -1.59,0.57 -3.15,1.23 -4.68,1.99 -1.52,0.76 -3.01,1.6 -4.46,2.53 -1.44,0.93 -2.84,1.94 -4.19,3.02 -1.35,1.09 -2.64,2.25 -3.87,3.47 -1.23,1.23 -2.41,2.52 -3.51,3.87 -1.1,1.35 -2.14,2.76 -3.1,4.23 -0.96,1.46 -1.84,2.98 -2.65,4.54 -0.8,1.56 -1.52,3.16 -2.14,4.8 -0.57,1.49 -0.99,2.64 -1.27,3.6 -0.28,0.96 -0.42,1.71 -0.42,2.39 0.01,0.68 0.15,1.29 0.45,1.95 0.29,0.66 0.73,1.37 1.31,2.26 0.51,0.77 1.04,1.42 1.58,1.95 0.55,0.53 1.12,0.94 1.7,1.23 0.58,0.29 1.17,0.46 1.77,0.52 0.6,0.06 1.2,0 1.81,-0.18 0.61,-0.18 1.21,-0.47 1.81,-0.87 0.6,-0.4 1.19,-0.92 1.78,-1.55 1.16,-1.25 2.28,-2.95 3.3,-5.08 h 0 c 0.84,-1.76 1.79,-3.42 2.83,-4.96 1.04,-1.54 2.18,-2.97 3.42,-4.27 1.23,-1.31 2.55,-2.5 3.96,-3.57 1.41,-1.07 2.9,-2.02 4.47,-2.85 1.57,-0.83 3.22,-1.53 4.94,-2.11 1.72,-0.58 3.51,-1.03 5.37,-1.35 1.86,-0.32 3.78,-0.51 5.76,-0.57 1.98,-0.06 4.02,0.02 6.11,0.23 1.68,0.17 3.01,0.28 4.09,0.3 1.08,0.02 1.92,-0.05 2.62,-0.24 0.7,-0.19 1.25,-0.49 1.76,-0.94 0.51,-0.45 0.99,-1.04 1.52,-1.81 0.86,-1.22 1.47,-2.33 1.85,-3.37 0.37,-1.04 0.5,-2 0.39,-2.92 -0.12,-0.92 -0.48,-1.8 -1.1,-2.67 -0.62,-0.87 -1.49,-1.73 -2.61,-2.61 -0.79,-0.62 -1.55,-1.12 -2.39,-1.52 -0.84,-0.4 -1.75,-0.7 -2.83,-0.93 -2.16,-0.45 -4.98,-0.58 -9.22,-0.56 z"/><path class="a" d="m 3769.08,1001.91 c -2.96,0.1 -5.91,0.33 -8.87,0.69 -2.96,0.36 -5.91,0.85 -8.85,1.47 -2.94,0.62 -5.88,1.37 -8.8,2.26 -2.92,0.88 -5.83,1.9 -8.71,3.04 -2.89,1.14 -5.75,2.42 -8.59,3.83 -2.84,1.41 -5.65,2.94 -8.43,4.61 -2.78,1.67 -5.53,3.47 -8.23,5.4 -2.38,1.7 -4.74,3.61 -7.08,5.71 -2.33,2.1 -4.63,4.38 -6.86,6.8 -2.24,2.43 -4.42,5 -6.51,7.69 -2.1,2.69 -4.11,5.48 -6.02,8.35 -1.91,2.87 -3.71,5.82 -5.38,8.81 -1.67,2.99 -3.21,6.02 -4.6,9.05 -1.39,3.03 -2.62,6.07 -3.68,9.08 -1.06,3.01 -1.94,5.98 -2.62,8.89 -0.72,3.08 -1.26,6.9 -1.62,11.1 -0.36,4.19 -0.54,8.75 -0.54,13.31 0,4.56 0.18,9.11 0.54,13.29 0.36,4.18 0.9,7.97 1.62,11.02 0.64,2.72 1.44,5.48 2.37,8.25 0.94,2.77 2.01,5.56 3.21,8.34 1.2,2.78 2.52,5.54 3.96,8.27 1.43,2.73 2.98,5.43 4.61,8.06 1.64,2.64 3.37,5.21 5.18,7.71 1.81,2.49 3.7,4.9 5.65,7.2 1.95,2.3 3.97,4.49 6.03,6.55 2.06,2.06 4.18,3.99 6.32,5.76 3.38,2.79 6.88,5.35 10.47,7.69 3.59,2.34 7.28,4.45 11.05,6.33 3.77,1.88 7.61,3.53 11.53,4.94 3.91,1.41 7.89,2.59 11.91,3.53 4.02,0.94 8.09,1.64 12.19,2.09 4.1,0.46 8.23,0.67 12.37,0.63 4.14,-0.03 8.3,-0.32 12.45,-0.85 4.15,-0.53 8.3,-1.31 12.43,-2.35 0,0 0,0 0,0 3,-0.75 6.01,-1.69 9.01,-2.78 2.99,-1.09 5.97,-2.35 8.91,-3.75 2.94,-1.4 5.84,-2.95 8.69,-4.64 2.85,-1.68 5.63,-3.5 8.34,-5.43 2.71,-1.93 5.34,-3.99 7.88,-6.14 2.53,-2.16 4.97,-4.42 7.29,-6.76 2.32,-2.35 4.52,-4.79 6.58,-7.3 2.06,-2.51 3.98,-5.1 5.74,-7.75 1.92,-2.89 3.7,-5.83 5.33,-8.82 1.63,-2.99 3.11,-6.03 4.45,-9.1 1.34,-3.07 2.53,-6.19 3.58,-9.33 1.05,-3.14 1.96,-6.31 2.72,-9.49 0.76,-3.19 1.38,-6.39 1.86,-9.61 0.48,-3.21 0.82,-6.44 1.01,-9.66 0.2,-3.22 0.25,-6.45 0.17,-9.66 -0.08,-3.21 -0.31,-6.42 -0.67,-9.61 -0.36,-3.19 -0.86,-6.36 -1.5,-9.5 -0.64,-3.14 -1.41,-6.25 -2.32,-9.33 -0.91,-3.08 -1.96,-6.11 -3.14,-9.11 -1.18,-2.99 -2.5,-5.94 -3.95,-8.83 -1.45,-2.89 -3.04,-5.73 -4.76,-8.5 -1.72,-2.77 -3.57,-5.48 -5.56,-8.11 -1.99,-2.63 -4.1,-5.19 -6.35,-7.66 -2.25,-2.47 -4.63,-4.86 -7.14,-7.16 -2.41,-2.21 -4.88,-4.29 -7.4,-6.24 -2.52,-1.95 -5.09,-3.78 -7.7,-5.48 -2.62,-1.7 -5.28,-3.27 -7.97,-4.71 -2.7,-1.44 -5.44,-2.76 -8.21,-3.94 -2.77,-1.19 -5.58,-2.25 -8.41,-3.18 -2.83,-0.93 -5.69,-1.73 -8.57,-2.41 -2.88,-0.67 -5.78,-1.22 -8.7,-1.63 -2.92,-0.42 -5.85,-0.7 -8.79,-0.86 -2.94,-0.16 -5.9,-0.19 -8.85,-0.08 z m 5.49,35.12 c 2.86,0.12 5.7,0.42 8.52,0.88 2.82,0.46 5.61,1.08 8.37,1.87 2.75,0.79 5.46,1.74 8.12,2.85 2.65,1.11 5.25,2.38 7.77,3.81 2.52,1.43 4.97,3.02 7.33,4.76 2.36,1.74 4.63,3.64 6.8,5.69 2.17,2.05 4.22,4.26 6.16,6.61 1.94,2.35 3.76,4.86 5.44,7.51 1.68,2.65 3.22,5.45 4.61,8.4 1.1,2.33 2.07,4.68 2.91,7.04 0.84,2.37 1.56,4.75 2.16,7.14 0.6,2.39 1.07,4.79 1.42,7.19 0.35,2.4 0.59,4.8 0.7,7.2 0.12,2.4 0.11,4.78 0,7.16 -0.12,2.38 -0.35,4.74 -0.69,7.08 -0.34,2.34 -0.8,4.66 -1.36,6.94 -0.56,2.29 -1.24,4.55 -2.02,6.77 -0.78,2.22 -1.67,4.41 -2.66,6.55 -0.99,2.14 -2.09,4.24 -3.29,6.28 -1.2,2.04 -2.5,4.04 -3.89,5.97 -1.4,1.93 -2.89,3.81 -4.49,5.61 -1.59,1.81 -3.28,3.55 -5.06,5.21 -1.78,1.67 -3.66,3.26 -5.62,4.76 -1.97,1.51 -4.02,2.93 -6.17,4.27 -2.15,1.34 -4.38,2.58 -6.7,3.73 -3.02,1.5 -5.35,2.63 -7.38,3.5 -2.03,0.87 -3.75,1.47 -5.57,1.89 -1.82,0.42 -3.74,0.66 -6.15,0.82 -2.41,0.16 -5.31,0.23 -9.1,0.3 -4.31,0.09 -8.86,0.01 -12.71,-0.18 -3.85,-0.19 -7,-0.5 -8.53,-0.89 -2.14,-0.53 -4.35,-1.26 -6.58,-2.16 -2.24,-0.9 -4.5,-1.96 -6.77,-3.17 -2.27,-1.21 -4.53,-2.56 -6.76,-4.02 -2.23,-1.47 -4.42,-3.05 -6.55,-4.72 -2.13,-1.67 -4.19,-3.43 -6.14,-5.26 -1.96,-1.83 -3.81,-3.72 -5.54,-5.65 -1.72,-1.93 -3.31,-3.9 -4.73,-5.88 -1.42,-1.98 -2.68,-3.97 -3.73,-5.95 -1.92,-3.59 -3.52,-7.27 -4.81,-11 -1.29,-3.73 -2.28,-7.51 -2.96,-11.31 -0.68,-3.8 -1.06,-7.63 -1.13,-11.45 -0.08,-3.82 0.15,-7.63 0.67,-11.41 0.52,-3.78 1.34,-7.52 2.45,-11.2 1.11,-3.68 2.51,-7.29 4.21,-10.81 1.69,-3.52 3.67,-6.94 5.94,-10.24 2.26,-3.3 4.81,-6.48 7.64,-9.5 2.21,-2.36 4.52,-4.53 6.91,-6.52 2.4,-1.99 4.88,-3.8 7.43,-5.42 2.55,-1.62 5.17,-3.07 7.85,-4.33 2.68,-1.26 5.41,-2.35 8.18,-3.26 2.77,-0.91 5.58,-1.64 8.41,-2.2 2.83,-0.56 5.68,-0.95 8.54,-1.16 2.86,-0.21 5.72,-0.26 8.58,-0.13 z"/><rect class="a" x="3882.66" y="998.76" width="51.82" height="34.05"/><path class="a" d="m 3771.46,721.43 c -9.1,0.06 -18.19,0.29 -26.28,0.68 -8.09,0.4 -15.17,0.96 -20.25,1.68 -9.02,1.28 -17.91,2.83 -26.67,4.65 -8.76,1.82 -17.39,3.91 -25.87,6.27 -8.49,2.36 -16.83,4.99 -25.03,7.88 -8.2,2.89 -16.25,6.04 -24.15,9.46 -7.9,3.41 -15.64,7.09 -23.22,11.02 -7.58,3.93 -15,8.12 -22.25,12.57 -7.25,4.44 -14.33,9.14 -21.23,14.09 -6.9,4.95 -13.63,10.15 -20.17,15.6 -3.6,3 -8.13,7.15 -13.06,11.9 -4.93,4.76 -10.27,10.12 -15.5,15.55 -5.23,5.43 -10.34,10.93 -14.82,15.96 -4.48,5.03 -8.32,9.58 -11.01,13.12 -4.98,6.55 -9.76,13.28 -14.33,20.17 -4.57,6.9 -8.94,13.96 -13.1,21.16 -4.15,7.2 -8.09,14.54 -11.8,22.01 -3.71,7.46 -7.2,15.04 -10.45,22.72 -3.25,7.68 -6.27,15.45 -9.04,23.29 -2.77,7.84 -5.3,15.76 -7.57,23.73 -2.27,7.97 -4.29,15.99 -6.05,24.03 -1.75,8.05 -3.25,16.12 -4.46,24.2 -0.94,6.23 -1.69,13.59 -2.24,21.52 -0.55,7.93 -0.9,16.43 -1.04,24.95 -0.14,8.52 -0.07,17.05 0.21,25.03 0.29,7.99 0.79,15.43 1.52,21.77 0.85,7.36 1.87,14.61 3.06,21.77 1.2,7.15 2.56,14.21 4.11,21.17 1.55,6.96 3.27,13.83 5.17,20.62 1.9,6.78 3.98,13.48 6.24,20.1 2.26,6.62 4.7,13.15 7.33,19.62 2.63,6.46 5.43,12.85 8.43,19.17 2.99,6.32 6.17,12.58 9.54,18.77 3.37,6.19 6.92,12.33 10.66,18.4 3.59,5.83 7.35,11.56 11.26,17.17 3.91,5.61 7.98,11.12 12.2,16.5 4.22,5.38 8.58,10.65 13.09,15.79 4.5,5.14 9.15,10.16 13.92,15.05 4.78,4.89 9.68,9.65 14.71,14.28 5.03,4.63 10.18,9.12 15.45,13.48 5.27,4.36 10.65,8.57 16.14,12.64 5.49,4.07 11.08,8 16.78,11.77 5.69,3.77 11.49,7.4 17.37,10.87 5.88,3.47 11.86,6.78 17.91,9.93 6.05,3.15 12.19,6.14 18.4,8.96 6.21,2.82 12.49,5.48 18.84,7.96 6.35,2.48 12.76,4.79 19.23,6.93 6.47,2.13 13,4.09 19.58,5.86 6.58,1.77 13.2,3.36 19.87,4.76 6.67,1.4 13.37,2.61 20.11,3.63 5.17,0.78 9.22,1.38 12.84,1.84 3.62,0.46 6.81,0.78 10.29,1.02 6.96,0.47 15.05,0.59 29.92,0.73 7.7,0.07 16.12,-0.09 24.04,-0.44 7.92,-0.35 15.34,-0.88 21.02,-1.55 v 0 c 5.04,-0.59 10.06,-1.29 15.06,-2.09 5,-0.8 9.97,-1.71 14.93,-2.73 4.96,-1.02 9.89,-2.14 14.81,-3.37 4.92,-1.23 9.82,-2.57 14.7,-4.01 4.88,-1.45 9.75,-3 14.6,-4.66 4.85,-1.66 9.69,-3.43 14.52,-5.31 4.83,-1.88 9.64,-3.87 14.44,-5.97 4.8,-2.1 9.59,-4.31 14.37,-6.63 5.86,-2.84 11.62,-5.81 17.28,-8.9 5.66,-3.09 11.22,-6.3 16.67,-9.63 5.45,-3.33 10.8,-6.78 16.05,-10.34 5.24,-3.56 10.38,-7.25 15.41,-11.04 5.03,-3.8 9.95,-7.7 14.76,-11.73 4.81,-4.02 9.51,-8.15 14.09,-12.39 4.58,-4.24 9.06,-8.59 13.41,-13.05 4.36,-4.46 8.6,-9.02 12.72,-13.68 4.12,-4.67 8.13,-9.44 12.01,-14.31 3.88,-4.87 7.65,-9.84 11.29,-14.91 3.64,-5.07 7.16,-10.24 10.56,-15.5 3.4,-5.27 6.67,-10.63 9.81,-16.08 3.14,-5.45 6.16,-11 9.05,-16.64 2.89,-5.64 5.65,-11.37 8.28,-17.19 2.63,-5.82 5.13,-11.72 7.49,-17.72 2.36,-5.99 4.59,-12.07 6.69,-18.23 1.68,-4.94 3.25,-9.93 4.71,-14.96 1.46,-5.03 2.81,-10.1 4.05,-15.21 1.24,-5.11 2.37,-10.25 3.4,-15.41 1.02,-5.17 1.94,-10.36 2.74,-15.58 0.81,-5.22 1.5,-10.46 2.09,-15.71 0.59,-5.25 1.07,-10.52 1.43,-15.79 0.37,-5.27 0.63,-10.56 0.78,-15.84 0.15,-5.28 0.19,-10.56 0.13,-15.84 -0.07,-5.28 -0.24,-10.55 -0.52,-15.8 -0.28,-5.26 -0.67,-10.5 -1.18,-15.72 -0.5,-5.22 -1.11,-10.43 -1.83,-15.6 -0.72,-5.18 -1.54,-10.33 -2.48,-15.44 -0.93,-5.12 -1.98,-10.2 -3.13,-15.24 -1.15,-5.04 -2.41,-10.04 -3.78,-14.99 -1.37,-4.95 -2.84,-9.86 -4.43,-14.71 -1.58,-4.85 -3.27,-9.65 -5.07,-14.38 l -7.52,-19.8 -4.4,0.88 c -2.42,0.48 -5.15,0.89 -6.06,0.9 -1.37,0.02 -2.39,0.18 -3.06,0.67 -0.33,0.24 -0.58,0.57 -0.74,0.99 -0.16,0.43 -0.22,0.96 -0.2,1.61 0.05,1.31 0.46,3.12 1.23,5.62 0.78,2.49 1.92,5.67 3.43,9.7 2.17,5.79 4.24,11.79 6.18,17.92 1.94,6.13 3.74,12.38 5.39,18.66 1.65,6.28 3.14,12.59 4.45,18.83 1.31,6.24 2.44,12.41 3.35,18.42 1.08,7.05 1.91,15.15 2.48,23.77 0.58,8.62 0.9,17.75 0.97,26.86 0.07,9.11 -0.13,18.2 -0.58,26.74 -0.45,8.53 -1.17,16.51 -2.14,23.4 -0.69,4.83 -1.47,9.65 -2.36,14.46 -0.89,4.81 -1.87,9.6 -2.95,14.37 -1.08,4.77 -2.26,9.53 -3.53,14.26 -1.27,4.73 -2.64,9.44 -4.09,14.12 -1.46,4.68 -3,9.33 -4.64,13.95 -1.64,4.62 -3.37,9.21 -5.18,13.76 -1.81,4.55 -3.72,9.06 -5.7,13.53 -1.99,4.47 -4.06,8.9 -6.21,13.28 -2.15,4.38 -4.39,8.72 -6.71,13 -2.32,4.29 -4.72,8.52 -7.19,12.7 -2.48,4.18 -5.03,8.3 -7.66,12.36 -2.63,4.06 -5.34,8.07 -8.12,12 -2.78,3.94 -5.63,7.81 -8.56,11.61 -2.93,3.8 -5.92,7.54 -8.99,11.2 -3.07,3.66 -6.2,7.25 -9.4,10.76 -3.2,3.51 -6.47,6.94 -9.8,10.28 -3.64,3.65 -7.33,7.22 -11.08,10.69 -3.75,3.48 -7.55,6.87 -11.41,10.17 -3.86,3.3 -7.77,6.51 -11.74,9.64 -3.96,3.12 -7.98,6.16 -12.05,9.1 -4.07,2.94 -8.18,5.8 -12.35,8.56 -4.17,2.76 -8.38,5.44 -12.64,8.02 -4.26,2.58 -8.57,5.07 -12.92,7.47 -4.35,2.4 -8.75,4.7 -13.19,6.91 -4.44,2.21 -8.92,4.33 -13.45,6.35 -4.52,2.02 -9.09,3.95 -13.7,5.78 -4.61,1.83 -9.25,3.57 -13.93,5.21 -4.68,1.64 -9.4,3.19 -14.16,4.63 -4.76,1.45 -9.55,2.8 -14.38,4.05 -4.83,1.25 -9.69,2.41 -14.59,3.46 -4.9,1.06 -9.82,2.01 -14.78,2.87 -4.96,0.86 -9.95,1.62 -14.97,2.27 -5.6,0.73 -12.38,1.28 -19.76,1.65 -7.38,0.37 -15.35,0.55 -23.34,0.55 -7.98,0 -15.97,-0.18 -23.38,-0.55 -7.41,-0.37 -14.23,-0.91 -19.88,-1.64 -4.89,-0.63 -9.76,-1.37 -14.62,-2.21 -4.86,-0.84 -9.71,-1.79 -14.54,-2.84 -4.83,-1.05 -9.64,-2.2 -14.43,-3.45 -4.79,-1.25 -9.55,-2.6 -14.29,-4.05 -4.74,-1.45 -9.45,-3 -14.13,-4.64 -4.68,-1.64 -9.33,-3.38 -13.95,-5.22 -4.62,-1.83 -9.2,-3.76 -13.74,-5.78 -4.54,-2.02 -9.05,-4.13 -13.51,-6.33 -4.46,-2.2 -8.88,-4.49 -13.25,-6.87 -4.37,-2.38 -8.7,-4.85 -12.97,-7.4 -4.27,-2.55 -8.5,-5.19 -12.66,-7.92 -4.17,-2.72 -8.28,-5.53 -12.33,-8.42 -4.05,-2.89 -8.05,-5.86 -11.97,-8.91 -3.93,-3.05 -7.79,-6.18 -11.59,-9.39 -3.8,-3.21 -7.53,-6.49 -11.19,-9.86 -3.66,-3.36 -7.25,-6.8 -10.76,-10.31 -3.58,-3.58 -7.07,-7.21 -10.48,-10.91 -3.41,-3.69 -6.72,-7.44 -9.95,-11.24 -3.23,-3.8 -6.38,-7.66 -9.43,-11.58 -3.06,-3.92 -6.03,-7.89 -8.91,-11.91 -2.88,-4.03 -5.68,-8.11 -8.39,-12.25 -2.71,-4.14 -5.33,-8.33 -7.86,-12.58 -2.53,-4.25 -4.98,-8.55 -7.34,-12.91 -2.36,-4.36 -4.63,-8.77 -6.81,-13.23 -2.18,-4.46 -4.28,-8.98 -6.28,-13.56 -2.01,-4.57 -3.92,-9.2 -5.75,-13.88 -1.83,-4.68 -3.57,-9.41 -5.22,-14.2 -1.65,-4.79 -3.22,-9.62 -4.69,-14.51 -1.48,-4.89 -2.86,-9.83 -4.16,-14.83 -1.3,-5 -2.51,-10.04 -3.63,-15.14 -1.12,-5.1 -2.15,-10.25 -3.09,-15.45 -0.94,-5.2 -1.79,-10.46 -2.56,-15.76 -0.64,-4.44 -1.1,-10.91 -1.38,-18.44 -0.28,-7.53 -0.39,-16.11 -0.33,-24.77 0.06,-8.66 0.29,-17.38 0.68,-25.2 0.39,-7.82 0.94,-14.72 1.64,-19.74 1.08,-7.67 2.37,-15.27 3.87,-22.77 1.5,-7.51 3.21,-14.93 5.12,-22.26 1.91,-7.33 4.03,-14.56 6.34,-21.69 2.31,-7.13 4.82,-14.16 7.52,-21.08 2.7,-6.92 5.6,-13.73 8.68,-20.43 3.08,-6.69 6.35,-13.27 9.8,-19.73 3.45,-6.45 7.09,-12.78 10.9,-18.98 3.81,-6.2 7.8,-12.26 11.96,-18.19 4.16,-5.93 8.49,-11.71 12.99,-17.36 4.5,-5.64 9.16,-11.13 13.99,-16.47 4.82,-5.34 9.81,-10.52 14.95,-15.55 5.14,-5.02 10.44,-9.89 15.89,-14.58 5.45,-4.69 11.05,-9.22 16.79,-13.56 5.74,-4.35 11.63,-8.52 17.66,-12.5 6.03,-3.98 12.2,-7.79 18.5,-11.39 6.3,-3.61 12.74,-7.02 19.31,-10.24 8.16,-4 16.07,-7.57 23.94,-10.79 7.87,-3.22 15.7,-6.09 23.69,-8.67 7.99,-2.58 16.15,-4.87 24.68,-6.94 8.53,-2.07 17.42,-3.92 26.89,-5.61 5.59,-1 13.01,-1.84 21.37,-2.51 8.35,-0.66 17.64,-1.15 26.95,-1.43 9.31,-0.28 18.64,-0.35 27.09,-0.18 8.45,0.17 16.01,0.56 21.78,1.23 7.84,0.9 15.54,2 23.13,3.31 7.59,1.31 15.05,2.83 22.4,4.57 7.35,1.73 14.59,3.68 21.72,5.84 7.13,2.16 14.16,4.53 21.08,7.13 6.93,2.59 13.75,5.4 20.49,8.43 6.74,3.03 13.38,6.28 19.94,9.75 6.56,3.47 13.03,7.17 19.43,11.09 6.4,3.92 12.72,8.06 18.96,12.44 9.08,6.35 16.69,11.55 16.91,11.55 0.22,0 2.21,-2.73 4.42,-6.06 0.96,-1.45 1.68,-2.56 2.19,-3.46 0.51,-0.89 0.8,-1.57 0.89,-2.15 0.09,-0.58 -0.01,-1.07 -0.3,-1.58 -0.28,-0.51 -0.75,-1.05 -1.37,-1.74 -1.1,-1.22 -4.09,-3.54 -8.21,-6.46 -4.12,-2.92 -9.37,-6.45 -14.99,-10.1 -5.62,-3.65 -11.62,-7.41 -17.23,-10.8 -5.61,-3.39 -10.84,-6.4 -14.94,-8.55 -4.67,-2.45 -9.48,-4.83 -14.41,-7.11 -4.93,-2.28 -9.98,-4.48 -15.13,-6.57 -5.15,-2.1 -10.39,-4.1 -15.71,-6 -5.32,-1.9 -10.72,-3.69 -16.17,-5.38 -5.45,-1.69 -10.96,-3.26 -16.5,-4.72 -5.54,-1.46 -11.11,-2.8 -16.69,-4.02 -5.58,-1.22 -11.18,-2.32 -16.76,-3.29 -5.58,-0.97 -11.15,-1.81 -16.7,-2.51 -5.17,-0.66 -12.32,-1.13 -20.45,-1.42 -8.13,-0.29 -17.24,-0.41 -26.34,-0.35 z"/></g><path class="w" d="m 720.76,199.71 c -0.44,-0.01 -0.89,0.01 -1.33,0.06 -0.44,0.04 -0.88,0.11 -1.31,0.2 -0.43,0.09 -0.86,0.21 -1.29,0.35 -0.42,0.14 -0.84,0.31 -1.24,0.49 -0.41,0.19 -0.8,0.4 -1.19,0.63 -0.39,0.23 -0.76,0.49 -1.12,0.77 -0.36,0.28 -0.71,0.58 -1.04,0.91 -0.33,0.32 -0.65,0.67 -0.94,1.04 -0.3,0.37 -0.58,0.76 -0.84,1.17 -0.26,0.41 -0.5,0.84 -0.71,1.29 -0.2,0.41 -0.35,0.79 -0.49,1.19 -0.13,0.4 -0.23,0.81 -0.32,1.3 -0.17,0.97 -0.25,2.22 -0.33,4.15 l -0.18,4.65 h 4.46 v -2.16 c 0,-1.68 0.05,-3.33 0.12,-4.64 0.08,-1.31 0.18,-2.28 0.3,-2.58 0.15,-0.4 0.37,-0.8 0.64,-1.19 0.27,-0.39 0.6,-0.78 0.96,-1.14 0.36,-0.36 0.77,-0.7 1.19,-1.01 0.43,-0.3 0.88,-0.57 1.34,-0.78 h 0 c 0.47,-0.22 0.95,-0.38 1.43,-0.5 0.48,-0.11 0.97,-0.18 1.46,-0.19 0.49,-0.02 0.97,0.02 1.45,0.1 0.48,0.08 0.95,0.2 1.4,0.37 0.45,0.17 0.89,0.38 1.31,0.63 0.42,0.25 0.81,0.55 1.18,0.88 0.37,0.33 0.71,0.7 1.01,1.11 0.31,0.41 0.58,0.85 0.81,1.33 0.18,0.38 0.33,0.72 0.44,1.11 0.11,0.39 0.19,0.81 0.25,1.37 0.12,1.1 0.14,2.71 0.14,5.46 v 1.86 4.35 h 5.95 c 1.66,0 2.97,0.02 4.04,0.08 1.07,0.06 1.89,0.16 2.57,0.33 0.34,0.08 0.64,0.19 0.92,0.31 0.28,0.12 0.54,0.26 0.78,0.43 0.49,0.33 0.94,0.75 1.45,1.29 0.4,0.42 0.73,0.82 1,1.22 0.27,0.4 0.48,0.81 0.65,1.24 0.16,0.43 0.28,0.89 0.35,1.39 0.07,0.5 0.11,1.06 0.11,1.68 0,0.39 -0.03,0.79 -0.1,1.18 -0.06,0.39 -0.16,0.78 -0.28,1.17 -0.12,0.38 -0.27,0.76 -0.45,1.12 -0.17,0.36 -0.37,0.72 -0.59,1.05 -0.22,0.34 -0.46,0.66 -0.72,0.95 -0.26,0.3 -0.54,0.58 -0.83,0.83 -0.29,0.25 -0.6,0.48 -0.92,0.67 -0.32,0.19 -0.65,0.36 -0.99,0.49 -0.31,0.12 -1.25,0.22 -2.53,0.3 -1.27,0.08 -2.88,0.12 -4.51,0.12 h -5.92 v 4.36 h 3.95 3.44 c 1.27,0 2.38,-0.05 3.38,-0.17 0.5,-0.06 0.97,-0.14 1.42,-0.23 0.45,-0.1 0.87,-0.21 1.28,-0.34 0.41,-0.13 0.79,-0.29 1.17,-0.47 0.38,-0.18 0.74,-0.38 1.1,-0.6 0.72,-0.45 1.4,-0.99 2.11,-1.64 0.77,-0.71 1.41,-1.4 1.93,-2.1 0.26,-0.35 0.49,-0.71 0.7,-1.07 0.2,-0.36 0.38,-0.73 0.53,-1.11 0.15,-0.38 0.28,-0.77 0.38,-1.18 0.1,-0.41 0.18,-0.83 0.23,-1.26 0.11,-0.88 0.13,-1.83 0.07,-2.89 -0.03,-0.55 -0.09,-1.09 -0.18,-1.61 -0.09,-0.52 -0.2,-1.02 -0.34,-1.5 -0.14,-0.48 -0.31,-0.94 -0.5,-1.39 -0.2,-0.44 -0.42,-0.87 -0.67,-1.28 -0.25,-0.41 -0.53,-0.8 -0.83,-1.17 -0.3,-0.37 -0.63,-0.72 -0.99,-1.05 -0.36,-0.33 -0.74,-0.65 -1.15,-0.94 -0.41,-0.3 -0.85,-0.57 -1.31,-0.83 -0.46,-0.26 -0.85,-0.46 -1.24,-0.62 -0.39,-0.16 -0.78,-0.28 -1.25,-0.37 -0.47,-0.09 -1.01,-0.16 -1.7,-0.21 -0.69,-0.05 -1.54,-0.09 -2.61,-0.14 l -4.75,-0.2 -0.2,-4.95 c -0.06,-1.47 -0.15,-2.69 -0.29,-3.73 -0.07,-0.52 -0.16,-1 -0.27,-1.44 -0.11,-0.44 -0.23,-0.85 -0.38,-1.23 -0.15,-0.38 -0.32,-0.74 -0.51,-1.09 -0.2,-0.35 -0.42,-0.68 -0.67,-1 -0.5,-0.65 -1.13,-1.29 -1.91,-1.99 -0.36,-0.33 -0.74,-0.63 -1.13,-0.9 -0.39,-0.27 -0.79,-0.52 -1.2,-0.73 -0.41,-0.22 -0.83,-0.41 -1.25,-0.57 -0.42,-0.16 -0.85,-0.3 -1.29,-0.41 -0.43,-0.11 -0.87,-0.19 -1.32,-0.25 -0.44,-0.06 -0.89,-0.09 -1.33,-0.1 z m 10.7,50.22 0.84,1.16 v -1.16 z"/></g>';
  const LOGO = h => `<svg width="${h}" height="${Math.round(h * 201.66447 / 201.08763)}" viewBox="0 0 201.08763 201.66447" aria-hidden="true"><style>.a{fill:${LOGO_BLUES.a}}.b{fill:${LOGO_BLUES.b}}.c{fill:${LOGO_BLUES.c}}.w{fill:#fff}</style>${LOGO_BODY}</svg>`;
  const WORDMARK = h => `<span class="brand">${LOGO(h)}<span>Next<b>Plaate</b></span></span>`;
  // The one blue of the script: the site's own (theme dark-blue.css of platesmania.com, #4765a0). The page-level pieces that cannot read
  // the tokens below (the hover outline while selecting, the console banner) use this constant.
  const SITE_BLUE = '#4765a0';

  // DESIGN TOKENS. Every colour of the panel, the card and the batch window comes from here: no other file writes a colour.
  //   palette   --primary, --primary-h (hover), --primary-soft (light fill and borders), --primary-tint (very light fill), --ring (focus)
  //             = #4765a0, #324c80, #cad9f6 (the site's "additional colour"), derived tint, derived ring
  //   neutrals  --ink (text), --mute (secondary text), --line / --line2 (borders), --bg (panel), --paper, --soft, --off
  //   states    --danger*, --ok*, --warn* : a fill, a border and a text colour each
  //   shape     --r (radius: 0, PlatesMania is all rectangles; --r-round only for the member's profile picture in the bar), --h (control height), --h-sm
  //   type      11 (small caps labels) 12 (help, small) 13 (controls, chips) 14 (text) 16 (titles, the cross) 18 (the star): no other size
  // Where the site and the script differ on purpose: the secondary text is darker than the site's grey (#7c8082) to stay readable at
  // 12 px; every control has the same height scale, the same square corners and the same focus ring.
  const UI_BASE = `
    :host{--primary:#4765a0;--primary-h:#324c80;--primary-soft:#cad9f6;--primary-tint:#eef2fb;--on-primary:#fff;--ring:rgba(71,101,160,.28);
          --ink:#2d2d2d;--mute:#626a70;--line:#e4e4e4;--line2:#cfcfcf;--bg:#f5f5f5;--paper:#fafafa;--soft:#f0f0f0;--off:#e8e8e8;--off-ink:#8f9498;
          --danger:#d9534f;--danger-soft:#fde2e1;--danger-line:#f3b5b2;--danger-ink:#8a1c17;
          --ok-soft:#e6f4ea;--ok-line:#b7dfc1;--ok-ink:#1e6b34;--warn-soft:#fff3cd;--warn-line:#f0dc9a;--warn-ink:#7a4f00;
          --r:0;--r-round:50%;--h:38px;--h-sm:32px;--h-rail:40px;
          font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink)}
    *{box-sizing:border-box}
    [hidden]{display:none!important}
    button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:none;box-shadow:0 0 0 3px var(--ring)}
    .btn{height:var(--h);padding:0 14px;border-radius:var(--r);border:1px solid var(--primary);background:var(--primary);color:var(--on-primary);font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}
    .btn:hover{background:var(--primary-h);border-color:var(--primary-h)}
    .btn.ghost{background:#fff;color:var(--ink);border-color:var(--line2)}
    .btn.ghost:hover{background:var(--primary-tint);border-color:var(--primary-soft)}
    .btn.danger{background:#fff;color:var(--danger);border-color:var(--danger)}
    .btn.danger:hover{background:var(--danger);color:#fff}
    .btn.sm{height:var(--h-sm);padding:0 12px;font-size:13px}
    .btn.lg{height:44px;padding:0 22px}
    .btn:disabled{background:var(--off);border-color:var(--off);color:var(--off-ink);cursor:not-allowed}
    input,select,textarea{color:var(--ink)}
    input[type=text],input[type=number],select,textarea{padding:0 10px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:inherit;outline:none}
    input[type=text],input[type=number],select{height:var(--h)}
    input[type=text]:focus,input[type=number]:focus,select:focus,textarea:focus{border-color:var(--primary)}
    input[type=checkbox],input[type=range]{accent-color:var(--primary);cursor:pointer}
    .brand{display:flex;align-items:center;gap:10px;font-weight:500;letter-spacing:-.01em;color:var(--ink)}
    .brand svg{display:block;flex:none}
    .brand b{font-weight:800;color:var(--primary)}
    .mute{color:var(--mute)}
    .iconbtn{width:var(--h-sm);height:var(--h-sm);padding:0;display:grid;place-items:center;font:inherit;font-size:16px;line-height:1;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--mute);cursor:pointer}
    .iconbtn:hover{background:var(--primary-tint);color:var(--ink);border-color:var(--primary-soft)}
    .iconbtn svg{display:block;margin:auto}
    .chip{width:100%;min-height:var(--h-sm);padding:5px 10px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:inherit;font-size:13px;text-align:left;cursor:pointer;overflow-wrap:anywhere}
    .chip:hover{background:var(--primary-tint);border-color:var(--primary-soft)}
    .chip.best{border-color:var(--primary-soft);background:var(--primary-soft);color:var(--primary-h);font-weight:600}
    .chip.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
    .pills{display:flex;flex-wrap:wrap;gap:6px}
    .pill{min-height:var(--h-sm);padding:4px 12px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:inherit;font-size:13px;cursor:pointer;overflow-wrap:anywhere}
    .pill:hover{background:var(--primary-tint);border-color:var(--primary-soft)}
    .pill.on{border-color:var(--primary);background:var(--primary-soft);color:var(--primary-h);font-weight:600}
    .pill.removable:hover{background:var(--danger-soft);border-color:var(--danger-line);color:var(--danger-ink)}
    .cardbox{display:flex;flex-direction:column;gap:10px;padding:12px}
    .cardbox textarea{width:100%;min-height:180px;padding:10px;resize:vertical;line-height:1.5}
    .stats{display:flex;flex-wrap:wrap;gap:12px 28px}
    .stat{display:flex;flex-direction:column}
    .stat b{font-size:18px;color:var(--primary-h)}
    .stat a{font-size:18px;font-weight:700;color:var(--primary-h);text-decoration:none}
    .stat a:hover{text-decoration:underline}
    .stat span{font-size:12px}
    .track{height:8px;background:var(--primary-tint);border:1px solid var(--line)}
    .fill{height:100%;background:var(--primary)}
    details.missing summary{cursor:pointer;font-size:12px;color:var(--mute)}
    .lookups{display:flex;flex-direction:column;gap:6px}
    .vehline{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 8px;font-size:14px}
    .cardrow{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}
    .hint{margin:0;font-size:12px;color:var(--mute)}
    .count{margin-left:auto;font-size:12px;color:var(--mute)}
    .tagbox{display:flex;flex-direction:column;gap:12px;padding:12px}
    .tagbox input[type=text]{width:100%}
    .tagrow{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
    .tagrow .pills{flex:1 1 200px;min-width:0}
    .tagquick,.taggroup{display:flex;flex-direction:column;gap:6px}
    .taggroups{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px 18px}
    .flags{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:6px}
    .mhead{display:flex;align-items:center;gap:8px;min-height:var(--h-sm);margin-bottom:2px}
    .mactions{margin-left:auto;display:flex;align-items:center;gap:8px}
    .star{font-size:18px;line-height:1}
    .star.on{color:var(--primary);border-color:var(--primary-soft);background:var(--primary-tint)}
    .members{display:flex;flex-direction:column;gap:8px}
    .members-panel{display:flex;flex-direction:column;gap:12px}
    .membersadd{display:flex;flex-direction:column;gap:8px}
    .addrow{display:flex;gap:8px}
    .addrow input{flex:1;min-width:0}
    .mlines{display:flex;flex-direction:column}
    .mrow{display:flex;align-items:stretch;gap:8px;position:relative}
    .mrow.dragging{opacity:.4}
    .mrow.before::before,.mrow.after::after{content:'';position:absolute;left:0;right:0;height:3px;background:var(--primary)}
    .mrow.before::before{top:-5px}
    .mrow.after::after{bottom:-5px}
    .grip{flex:none;width:24px;padding:0;border:0;background:none;color:var(--off-ink);font:inherit;font-weight:700;letter-spacing:-2px;cursor:grab}
    .grip:hover,.grip:focus-visible{color:var(--primary-h)}
    .grip.off{cursor:default;color:transparent}
    .member{flex:1;min-width:0;display:flex;align-items:center;gap:12px;padding:6px 8px;border:1px solid var(--line);background:#fff;color:var(--ink);text-decoration:none}
    .member:hover{background:var(--primary-tint);border-color:var(--primary-soft)}
    .member.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
    .mrow.pinned .member{background:var(--primary-tint);border-color:var(--primary-soft)}
    .member img,.member .mav{flex:none;width:40px;height:40px;object-fit:cover;background:var(--soft)}
    .member .mav{display:grid;place-items:center;font-weight:700;font-size:16px;color:var(--primary-h);background:var(--primary-soft)}
    .member .mname{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:600}
    .member .mtag{flex:none;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--primary-h)}
    .mrow .iconbtn{height:auto;min-height:54px}
    .flagpick{display:flex;flex-direction:column;gap:8px}
    .flagpick input[type=text]{width:100%}
    .pickrows{display:flex;flex-direction:column;gap:6px;max-height:340px;overflow-y:auto;padding:2px}
    .pickrows .chk img{flex:none}
    .flagblock{display:flex;flex-direction:column;gap:8px}
    .flagblock input{width:100%}
    .flag{height:var(--h-sm);min-width:0;display:flex;align-items:center;gap:8px;padding:0 8px;border:1px solid var(--line2);background:#fff;color:var(--ink);font-size:12px;text-decoration:none}
    .flag .fname{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .flag .flagcode{font-weight:700}
    .flag:hover{background:var(--primary-tint);border-color:var(--primary)}
    .flag.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
    .flag img{display:block;flex:none;width:22px;height:15px;object-fit:contain}
    .cat{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
  `;

  /* =====================================================================
   *  DOM HELPERS  (features build their controls with h(), never with innerHTML on data)
   * ===================================================================== */
  // h('button', { class: 'btn', text: 'Go', onclick: fn }, child, [more children])
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === undefined || v === null) continue;
      if (k === 'text') el.textContent = v;
      else if (k === 'class') el.className = v;
      else if (k === 'for') el.htmlFor = v;
      else if (/^on[a-z]+$/.test(k)) el.addEventListener(k.slice(2), v);
      else if (k.startsWith('data-')) el.setAttribute(k, v);
      else el[k] = v;                      // id, value, checked, disabled, hidden, title, min, max, step, placeholder...
    }
    kids.flat().forEach(c => { if (c !== null && c !== undefined && c !== false) el.append(c); });
    return el;
  }
  /* =====================================================================
   *  PAGE STYLE (hover highlight while selecting)
   * ===================================================================== */
  const pageStyle = document.createElement('style');
  pageStyle.textContent = '.pmg-hover{outline:4px solid ' + SITE_BLUE + '!important;outline-offset:3px!important;cursor:crosshair!important}'
    + '.pmg-busy, .pmg-busy * {user-select:none!important;-webkit-user-select:none!important}';
  document.head.appendChild(pageStyle);

  const RIBBON_CSS = `
    .side{display:flex;justify-content:flex-end;height:100%;align-items:stretch;pointer-events:none}
    .side>*{pointer-events:auto}
    .rail{width:56px;flex:none;display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 0;background:#fff;border-left:1px solid var(--line2);box-shadow:-6px 0 20px rgba(0,0,0,.08)}
    .rail .logo{margin-bottom:6px}
    .rme{flex:none;width:var(--h-rail);height:var(--h-rail);display:grid;place-items:center;overflow:hidden;border:2px solid var(--primary-soft);border-radius:var(--r-round);background:var(--primary-soft);color:var(--primary-h);font-size:16px;font-weight:700;text-decoration:none}
    .rme img{display:block;width:100%;height:100%;object-fit:cover}
    .rme:hover{border-color:var(--primary)}
    .rme.on{border-color:var(--primary);box-shadow:0 0 0 2px var(--ring)}
    .rsep{width:24px;height:1px;background:var(--line2);margin:auto 0 4px}
    .rbtn{width:var(--h-rail);height:var(--h-rail);display:grid;place-items:center;border:0;border-radius:var(--r);background:none;color:var(--mute);cursor:pointer}
    .rbtn:hover{background:var(--primary-tint);color:var(--primary-h)}
    .rbtn[aria-pressed="true"]{background:var(--primary);color:var(--on-primary)}
    .drawer.passive{pointer-events:none!important;opacity:.82}
    .drawer{width:min(340px,calc(100vw - 56px));display:flex;flex-direction:column;background:var(--bg);border-left:1px solid var(--line2);box-shadow:-10px 0 30px rgba(0,0,0,.14);position:relative}
    .dhead{display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:56px;padding:0 16px;background:#fff;border-bottom:1px solid var(--line)}
    .dhead h2{margin:0;font-size:16px;font-weight:700;color:var(--primary-h)}
    .dbody{flex:1;min-height:0;overflow-y:auto;padding:12px;display:flex;flex-direction:column}
    .dsec{display:flex;flex-direction:column;gap:10px}
    .group{background:#fff;border:1px solid var(--line);border-radius:var(--r);display:flex;flex-direction:column;overflow:hidden}
    .gbody{display:flex;flex-direction:column;gap:8px;padding:10px}
    .gtitle{order:-1;padding:7px 10px;border-bottom:1px solid var(--line);background:#fff;color:var(--primary-h);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
    .gbody .btn:not(.sm):not(.fit){width:100%;height:auto;min-height:var(--h);padding-top:6px;padding-bottom:6px;line-height:1.25;white-space:normal}   /* a long label wraps instead of widening the drawer */
    .pnote{margin:0;padding:6px 8px;border-radius:var(--r);background:var(--primary-tint);color:var(--mute);font-size:12px}
    .btnrow{display:flex;flex-wrap:wrap;gap:8px}
    .btnrow .btn{flex:1 1 110px;min-width:0}
    .row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;font-size:12px}
    .row label{font-weight:600;white-space:nowrap}
    .row input{width:90px}
    .field{display:flex;flex-direction:column;gap:4px}
    .field label{font-size:12px;font-weight:600}
    .field input{width:100%}
    .gbody textarea{width:100%;min-height:64px;resize:vertical;padding:8px;font-size:13px}
    .lens-out{display:flex;flex-direction:column;gap:6px;min-width:0}
    
    .lens-cands{display:flex;flex-direction:column;gap:6px}
    
    
    
    
    .lens-none{font-size:13px;color:var(--mute)}
    .chk{display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer}
    .chk input{width:16px;height:16px;margin:0;flex:none}
    .slots{display:flex;flex-direction:column;gap:8px}
    .slot{display:flex;align-items:center;gap:8px;min-height:52px;padding:6px 8px;border:1px solid var(--line);border-radius:var(--r);background:var(--paper)}
    .slot img{width:52px;height:40px;object-fit:cover;border-radius:var(--r);border:1px solid var(--line);flex:none}
    .slot .t{flex:1;min-width:0;font-size:12px}
    .slot .t small{display:block;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .slot .x{background:none;border:0;font-size:16px;color:var(--mute);cursor:pointer}
    .slot .x:hover{color:var(--ink)}
    .slot.empty{color:var(--mute);border-style:dashed;background:#fff;font-size:12px;justify-content:center}
    .qinfo{font-size:12px;color:var(--mute)}
    .lbl{font-size:12px;font-weight:600}
    .presult{margin:0;font-size:13px}
    .presult{padding:6px 8px;border-radius:var(--r);background:#fff;border:1px solid var(--line)}
    .chk.dim{color:var(--mute)}
    .chklist{display:flex;flex-direction:column;gap:8px}
    .kv{display:flex;justify-content:space-between;gap:12px;font-size:13px;padding:2px 0}
    .sub{margin:10px 0 2px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
    .presult.warn{background:var(--danger-soft);border-color:var(--danger-line);color:var(--danger-ink);font-weight:600}
    .presult.ok{background:var(--ok-soft);border-color:var(--ok-line);color:var(--ok-ink)}
    .toast{position:absolute;left:50%;transform:translateX(-50%);bottom:16px;width:min(420px,calc(100vw - 32px));box-sizing:border-box;overflow-wrap:anywhere;padding:10px 16px;text-align:center;background:var(--ink);border-radius:var(--r);box-shadow:0 8px 24px rgba(0,0,0,.35);font-size:14px;line-height:1.4;color:#fff}
    .toast:empty{display:none}
    .toast b{color:#fff;text-decoration:underline;text-decoration-color:var(--primary-soft)}
    .kblist{display:flex;flex-direction:column;gap:6px}
    .kbrow{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px}
        .kbright{display:flex;align-items:center;gap:4px}
    .kbkey{width:84px;height:var(--h-sm);padding:0 8px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:700 12px system-ui,sans-serif;cursor:pointer}
    .kbkey:hover{border-color:var(--primary-soft);background:var(--primary-tint)}
    .kbkey.static{cursor:default}
    .kbkey.static:hover{border-color:var(--line2);background:#fff}
    .kbspacer{width:26px;flex:none}
    .kbreset{width:26px;height:var(--h-sm);border:0;background:none;color:var(--mute);cursor:pointer;font-size:14px}
    .kbreset:hover{color:var(--ink)}
    .kbreset.off{visibility:hidden}
    @media (max-width:520px){ .drawer{width:calc(100vw - 56px)} .rail{width:48px} }
  `;

  /* =====================================================================
   *  RIBBON  (the NextPlaate panel: a vertical bar of icons on the right edge of the page;
   *           an icon opens its drawer, which slides over the page)
   * ===================================================================== */
  // The drawers, in bar order. A feature joins one of them with groups: [{ drawer: 'pair', title, build }].
  const DRAWERS = [
    { id: 'pair', icon: 'photos', title: 'Photo pair', keys: 'S · F' },
    { id: 'gallery', icon: 'gallery', title: 'Gallery', keys: 'L · ◀ ▶' },
    { id: 'search', icon: 'search', title: 'Search', keys: '' },        // the plate check and Google Lens, one tab
    { id: 'upload', icon: 'upload', title: 'Batch upload', keys: 'U · N' },
    { id: 'keys', icon: 'keyboard', title: 'Shortcuts', keys: 'Esc' },
    { id: 'settings', icon: 'settings', title: 'Settings', keys: '' },
    { id: 'dev', icon: 'wrench', title: 'Developer', keys: '' }        // shown only when the dev tools are built in
  ];

  const host = document.createElement('div');
  host.id = 'pmg-host';
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;';   // covers the window but lets clicks through, except on the bar and the drawer
  const root = host.attachShadow({ mode: 'open' });   // shadow DOM: the site's CSS cannot reach the panel
  root.innerHTML = `
    <style>${UI_BASE}${RIBBON_CSS}</style>
    <div class="side" id="side">
      <aside class="drawer" id="drawer" hidden>
        <header class="dhead"><h2 id="dtitle"></h2><button class="iconbtn" id="dclose" title="Close (Esc)">${icon('close')}</button></header>
        <div class="dbody" id="dbody"></div>
      </aside>
      <nav class="rail" id="rail"><div class="logo">${LOGO(28)}</div></nav>
    </div>
    <div class="toast" id="status"></div>`;
  document.body.appendChild(host);
  const $ = id => root.getElementById(id);
  let openId = null;

  // Names of the pages a group works on (here.gallery, here.photo, here.edit, here.add)
  const PAGE_NAMES = { gallery: 'a gallery', photo: 'a photo', edit: 'the edit', add: 'the upload' };
  function pageNote(g) {
    if (!g.pages || g.pages.some(p => here[p])) return null;
    return h('p', { class: 'pnote', text: 'Works on ' + g.pages.map(p => PAGE_NAMES[p]).join(' or ') + ' page.' });
  }

  // One icon per drawer that has features, one section per drawer; each feature group is a box with its title under it
  function mountRibbon(list) {
    const byDrawer = {};
    list.forEach(f => (f.groups || []).forEach(g => { (byDrawer[g.drawer] = byDrawer[g.drawer] || []).push(g); }));
    DRAWERS.filter(d => byDrawer[d.id]).forEach(d => {
      const btn = h('button', { class: 'rbtn', 'data-drawer': d.id, title: d.keys ? `${d.title} (${d.keys})` : d.title, onclick: () => openDrawer(d.id) });
      btn.innerHTML = icon(d.icon);   // our own SVG constants, never user data
      // settings (the Shortcuts drawer) sit at the bottom, apart from the working tools
      if (d.id === 'keys') $('rail').append(h('div', { class: 'rsep' }));
      $('rail').append(btn);
      $('dbody').append(h('section', { class: 'dsec', 'data-drawer': d.id, hidden: true },
        byDrawer[d.id].map(g => h('div', { class: 'group' },
          h('div', { class: 'gbody' }, pageNote(g), g.build()),
          h('div', { class: 'gtitle', text: g.title })))));
    });
    $('dclose').onclick = () => closeDrawer();
    // the drawer that was open stays open after a reload or a page change
    const last = store.get('drawer', '');
    if (byDrawer[last]) openDrawer(last);
  }

  // Only one drawer is open at a time. It stays open until its X or another icon is clicked
  function openDrawer(id) {
    if (id === openId) return;
    openId = id;
    root.querySelectorAll('.rbtn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.drawer === openId)));
    root.querySelectorAll('.dsec').forEach(s => { s.hidden = s.dataset.drawer !== openId; });
    $('drawer').hidden = !openId;
    $('dtitle').textContent = openId ? DRAWERS.find(d => d.id === openId).title : '';
    store.set('drawer', openId || '');
  }
  function closeDrawer() {
    openId = null; store.set('drawer', '');
    root.querySelectorAll('.rbtn').forEach(b => b.setAttribute('aria-pressed', 'false'));
    root.querySelectorAll('.dsec').forEach(s => { s.hidden = true; });
    $('drawer').hidden = true;
  }
  // While a selection runs, the drawer stays visible but lets clicks reach the site
  function setPassive(on) { $('drawer').classList.toggle('passive', on); }

  // Shows a message at the bottom of the window. It goes away by itself after a few seconds (ms = 0: it stays)
  let statusTimer = null;
  function setStatus(html, ms = 6000) {
    clearTimeout(statusTimer);
    $('status').innerHTML = html;
    if (ms) statusTimer = setTimeout(() => { $('status').innerHTML = ''; }, ms);
  }

  /* =====================================================================
   *  INLINE CARD  (a block of the script, inside the site's page, in the look of the panel)
   *    For what is used right where it appears (the answer of Google Lens above the vehicle menus) instead of in a drawer.
   *      const card = inlineCard({ id: 'pmg-lens-card', title: 'Google Lens', after: someElement });   // or before: ; null if no element
   *      card.message('Searching…');        a short line in the title bar
   *      card.body                          the element to fill (card.clear() empties it)
   *      cardChoices(card, columns, opts)   columns of choices to click (see below)
   *    The card is in a shadow root: the site's CSS does not reach it and the panel's tokens (UI_BASE) apply. The same id gives
   *    the same card back, so a feature can call inlineCard() every time it needs it.
   * ===================================================================== */
  const INLINE_CARD_CSS = `
    :host{display:block;margin:0 0 20px}   /* a clear space under every card: two cards one above the other do not touch */
    .card{background:#fff;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
    .top{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:8px 12px;background:#fff;border-bottom:1px solid var(--line)}
    .top b{font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--primary-h)}
    .top .msg{flex:1 1 150px;min-width:0;font-size:12px;color:var(--mute);overflow-wrap:anywhere}
    .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;padding:12px}   /* three side by side where there is room, stacked under a photo */
    .col{display:flex;flex-direction:column;gap:6px;min-width:0}
    .none{font-size:13px;color:var(--mute)}
    .bar{display:flex;gap:8px;padding:0 12px 12px}
  `;

  // opts: { id, title, after | before: the element the card goes behind or in front of, closable: false for a card that must stay };
  // null when there is no such element
  function inlineCard(opts) {
    let host = document.getElementById(opts.id);
    if (!host) {
      const anchor = opts.after || opts.before;
      if (!anchor || !anchor.parentNode) return null;
      host = h('div', { id: opts.id });
      anchor.parentNode.insertBefore(host, opts.after ? anchor.nextSibling : anchor);
      const root = host.attachShadow({ mode: 'open' });
      root.append(h('style', { text: UI_BASE + INLINE_CARD_CSS }), h('div', { class: 'card' },
        h('div', { class: 'top' }, h('b', { text: opts.title }), h('span', { class: 'msg' }),
          opts.closable === false ? null : h('button', { class: 'iconbtn', title: 'Hide', text: '×', onclick: () => { host.hidden = true; } })),
        h('div', { class: 'cbody' })));
    }
    const root = host.shadowRoot;
    host.hidden = false;
    return {
      host, root, body: root.querySelector('.cbody'),
      message: text => { root.querySelector('.msg').textContent = text; },
      clear: () => { root.querySelector('.cbody').textContent = ''; }
    };
  }

  // Columns of choices to click. columns: [{ label, level, choices: [{ id, name, path }] }]. The first choice of a column is
  // highlighted. opts.pick(path) runs on a click; opts.current() returns the values now in force, one per level, and the choices
  // equal to them are marked; opts.action = { label, path } adds a button that picks that path at once.
  function cardChoices(card, columns, opts) {
    const mark = () => {
      const now = opts.current ? opts.current() : [];
      card.root.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', now[+c.dataset.level] === c.dataset.id));
    };
    const pick = path => { opts.pick(path); mark(); };
    card.clear();
    card.body.append(h('div', { class: 'cols' }, columns.map(col => h('div', { class: 'col' },
      h('div', { class: 'cat', text: col.label }),
      col.choices.length
        ? col.choices.map((c, i) => h('button', { class: 'chip' + (i === 0 ? ' best' : ''), text: c.name, 'data-id': String(c.id), 'data-level': String(col.level), onclick: () => pick(c.path) }))
        : h('div', { class: 'none', text: 'No choice' })))));
    if (opts.action && opts.action.path.length) {
      card.body.append(h('div', { class: 'bar' }, h('button', { class: 'btn', text: opts.action.label, onclick: () => pick(opts.action.path) })));
    }
    mark();
  }
  /* =====================================================================
   *  MODAL  (a window over the page, in the look of the panel)
   *    For what needs the whole screen for a moment (the tags of a photo) instead of the site's own pop-up.
   *      const modal = modalOpen({ id: 'pmg-tags-modal', title: 'Tags', body: element, actions: [{ label: 'Save', run }, ...], onDismiss });
   *      modal.close()      closes it;  modal.dismiss()  closes it as a cancel (onDismiss runs first)
   *    The cross, the Esc key and a click outside the window dismiss it. An action closes nothing by itself: it calls modal.close().
   *    It is in a shadow root (the site's CSS does not reach it) and uses the panel's tokens. One modal of an id at a time.
   * ===================================================================== */
  const MODAL_CSS = `
    .ov{position:fixed;inset:0;background:rgba(17,17,17,.55);display:flex;justify-content:center;align-items:flex-start;padding:5vh 72px 5vh 16px;overflow:auto}   /* 72 = the panel's rail (56) and a margin: the window never goes under it */
    .dlg{background:#fff;border:1px solid var(--line);width:min(960px,100%);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35)}
    .mh{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:56px;padding:0 16px;border-bottom:1px solid var(--line)}
    .mh h2{margin:0;font-size:16px;font-weight:700;color:var(--primary-h)}
    .mh .sub{flex:1;min-width:0;font-size:12px;color:var(--mute);overflow-wrap:anywhere}
    .mb{flex:1;min-height:0;overflow:auto}
    .mf{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--line);background:var(--paper)}
  `;

  function modalOpen(opts) {
    document.getElementById(opts.id) && document.getElementById(opts.id).remove();
    const host = h('div', { id: opts.id });
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483645';
    const root = host.attachShadow({ mode: 'open' });
    const sub = h('span', { class: 'sub' });
    const before = document.documentElement.style.overflow;
    let done = false;
    const modal = {
      host, body: null,
      message: text => { sub.textContent = text; },
      close() {
        if (done) return;
        done = true;
        document.removeEventListener('keydown', onKey, true);
        document.documentElement.style.overflow = before;
        host.remove();
      },
      dismiss() { if (done) return; if (opts.onDismiss) opts.onDismiss(); modal.close(); }
    };
    const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); modal.dismiss(); } };
    const ov = h('div', { class: 'ov', onclick: e => { if (e.target === ov) modal.dismiss(); } },
      h('div', { class: 'dlg', role: 'dialog' },
        h('div', { class: 'mh' }, h('h2', { text: opts.title }), sub, h('button', { class: 'iconbtn', title: 'Close', text: '×', onclick: () => modal.dismiss() })),
        modal.body = h('div', { class: 'mb' }, opts.body),
        opts.actions && opts.actions.length
          ? h('div', { class: 'mf' }, opts.actions.map(a => h('button', { type: 'button', class: 'btn' + (a.kind === 'ghost' ? ' ghost' : ''), text: a.label, onclick: a.run })))
          : null));
    root.append(h('style', { text: UI_BASE + MODAL_CSS }), ov);
    document.body.appendChild(host);
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey, true);
    return modal;
  }
  /* =====================================================================
   *  PAIR  (choose the front and rear photos of a car by clicking them on the site)
   * ===================================================================== */
  function startSelecting() {
    if (host.shadowRoot.activeElement) host.shadowRoot.activeElement.blur();
    setStatus('Click the <b>FRONT</b> photo on the site. <b>Esc</b> cancels.', 0);
    if (state.front && state.rear) { state.front = state.rear = null; store.set('front', 'null'); store.set('rear', 'null'); }
    state.mode = !state.front ? 'front' : 'rear';
    render();
  }
  function stopSelecting() { state.mode = null; clearHover(); render(); setStatus('', 0); }

  function renderSlot(el, label, photo, key) {
    el.innerHTML = '';
    el.classList.toggle('empty', !photo);
    if (!photo) { el.textContent = label + ': not selected'; return; }
    const im = document.createElement('img'); im.src = photo.thumb;
    const t = document.createElement('div'); t.className = 't';
    t.textContent = label;
    const s = document.createElement('small');
    s.textContent = '#' + photo.id + (photo.alt ? ' · ' + photo.alt : '');
    t.appendChild(s);
    const x = document.createElement('button'); x.className = 'iconbtn'; x.innerHTML = icon('close'); x.title = 'Remove';
    x.onclick = () => { state[key] = null; store.set(key, 'null'); clearDone(); render(); };
    el.append(im, t, x);
  }

  function render() {
    setPassive(!!state.mode);                        // while selecting, the photos must be clickable under the drawer
    renderSlot($('sFront'), 'Front', state.front, 'front');
    renderSlot($('sRear'), 'Rear', state.rear, 'rear');
    const ready = !!(state.front && state.rear);

    const sel = $('sel');
    sel.classList.toggle('ghost', !state.mode);
    sel.textContent = state.mode ? 'Cancel selection (S)' : (ready ? 'Select a new pair (S)' : 'Select photos (S)');

  }

  let hovered = null;
  function clearHover() { if (hovered) { hovered.classList.remove('pmg-hover'); hovered = null; } }

  document.addEventListener('mouseover', e => {
    if (!state.mode || e.target === host) return;
    const f = findPhoto(e.target);
    clearHover();
    if (f) { hovered = f.img; hovered.classList.add('pmg-hover'); }
  }, true);

  document.addEventListener('click', e => {
    if (!state.mode || e.target === host) return;
    const f = findPhoto(e.target);
    if (!f) return; // not a car photo: let the click through
    e.preventDefault();
    e.stopPropagation();
    clearHover();
    state[state.mode] = f.photo;
    store.set(state.mode, JSON.stringify(f.photo));
    clearDone(); // new selection = fresh start for auto-edit
    state.mode = state.mode === 'front' ? (state.rear ? null : 'rear') : null;
    render();
    if (state.mode === 'rear') setStatus('Now click the <b>REAR</b> photo. <b>Esc</b> cancels.', 0);
    else if (!state.mode && state.front && state.rear) setStatus('Pair ready. Open the front photo to start the automatic edit.');
  }, true);

  registerFeature({
    id: 'selection', label: 'Photo pair selection',
    groups: [{
      drawer: 'pair', title: 'Selection',
      build: () => [
        h('button', { id: 'sel', class: 'btn ghost', text: 'Select photos (S)' }),
        h('button', { id: 'reset', class: 'btn ghost sm', text: 'Reset the pair' }),
        h('div', { class: 'slots' }, h('div', { id: 'sFront', class: 'slot empty' }), h('div', { id: 'sRear', class: 'slot empty' }))
      ]
    }],
    keys: {
      select: { code: 'KeyS', label: 'Select photos', run: () => { $('sel').click(); return true; }, hintOrder: 10 }
    },
    onEscape: () => { if (!state.mode) return false; stopSelecting(); return true; },
    escOrder: 20,
    init: () => {
      $('sel').onclick = () => (state.mode ? stopSelecting() : startSelecting());
      $('reset').onclick = () => {
        state.front = state.rear = null; state.mode = null;
        store.set('front', 'null'); store.set('rear', 'null'); clearDone();
        clearHover(); render();
      };
      render();
    }
  });
  /* =====================================================================
   *  DETAILS  (location and hashtags written at the top of every description)
   * ===================================================================== */
  registerFeature({
    id: 'details', label: 'Location and hashtags',
    groups: [{
      drawer: 'pair', title: 'Details',
      build: () => [
        h('div', { class: 'field' }, h('label', { for: 'place', text: 'Location' }),
          h('input', { type: 'text', id: 'place', autocomplete: 'off' })),
        h('div', { class: 'field' }, h('label', { for: 'tag', text: 'Hashtags (comma separated)' }),
          h('input', { type: 'text', id: 'tag', autocomplete: 'off', placeholder: 'oldtimer,tuning' }))
      ]
    }],
    init: () => {
      $('place').value = store.get('place', 'Mainz - Germany');
      $('tag').value = store.get('tag', 'oldtimer');
      $('place').oninput = () => store.set('place', $('place').value);
      $('tag').oninput = () => store.set('tag', $('tag').value);
    }
  });
  /* =====================================================================
   *  EDIT FLOW:  photo page --(auto edit)--> edit page --(auto fill)--> (auto save)
   * ===================================================================== */
  // The edit page is detected in 20-here.js (here.edit)
  const descBox = document.querySelector('textarea[name="dop"]');
  const photoIdInput = document.querySelector('form input[name="id"]');

  function fillDescription() {
    if (!here.edit) return;
    if (!(state.front && state.rear)) {
      setStatus('Select the front and rear photos first (press <b>S</b>), then come back to edit.');
      return;
    }
    const id = photoIdInput.value;
    // The plate shown in the page title (e.g. "MZ MZ 78") is used for the image alt text
    const h = document.querySelector('.headline h2');
    const plate = h ? h.textContent.replace(/['"<>]/g, '').trim() : '';
    const alt = (o, side) => (((plate || o.alt) ? (plate || o.alt) + ' ' : '') + side).trim();

    let code;
    if (id === state.front.id) code = block('R E A R   V I E W', state.rear, alt(state.rear, 'rear'));
    else if (id === state.rear.id) code = block('F R O N T   V I E W', state.front, alt(state.front, 'front'));
    else { setStatus(`Photo <b>#${id}</b> is not in your selected pair (front #${state.front.id}, rear #${state.rear.id}).`); return; }

    descBox.value = code;
    descBox.dispatchEvent(new Event('input', { bubbles: true }));
    markDone(id);
    markFilled(id);
    // Both photos of the pair filled -> after the next photo page, go back to the gallery
    if (filledSet().has(state.front.id) && filledSet().has(state.rear.id)) store.set('returnPending', '1');

    if ($('autoSave').checked) {
      setStatus(`Description filled for <b>#${id}</b>. Saving…`);
      const btn = descBox.form && descBox.form.querySelector('input[type=submit],button[type=submit]');
      if (btn) setTimeout(() => btn.click(), 300);
    } else {
      setStatus(`Description filled for <b>#${id}</b>. Check it, then click Save.`);
    }
  }

  // On a photo page of the selected pair, click the site's own "edit" button (once per photo)
  function autoEdit() {
    if (!$('autoEdit').checked || here.edit) return;
    if (!(state.front && state.rear)) return;
    const m = location.pathname.match(/\/nomer(\d+)/i);
    if (!m) return;
    const id = m[1];
    if (id !== state.front.id && id !== state.rear.id) return;
    if (doneSet().has(id)) return;
    const btn = document.querySelector('form[action$="edit_dopol.php"] button[type="submit"], form[action$="edit_dopol.php"] input[type="submit"]');
    if (!btn) return;
    markDone(id); // at most one automatic edit per photo: no loops after saving
    setStatus(`Opening the edit page for <b>#${id}</b>…`);
    setTimeout(() => btn.click(), 400);
  }

  /* =====================================================================
   *  BACK TO THE GALLERY WHEN EVERYTHING IS DONE
   * ===================================================================== */
  // Remember the last gallery / user page visited (and how far it was scrolled)
  if (here.gallery) {
    store.set('lastGallery', location.href);
    if (store.get('restoreScroll', '0') === '1') {
      store.set('restoreScroll', '0');
      const y = Number(store.get('lastGalleryScroll', '0')) || 0;
      setTimeout(() => window.scrollTo(0, y), 150);
    }
    window.addEventListener('pagehide', () => store.set('lastGalleryScroll', String(window.scrollY)));
  }

  // After the second photo is saved the site shows its photo page: that is the signal to go back
  function backToGallery() {
    if (!$('autoReturn').checked || here.edit) return false;
    if (store.get('returnPending', '0') !== '1') return false;
    if (!(state.front && state.rear)) return false;
    const m = location.pathname.match(/\/nomer(\d+)/i);
    if (!m || (m[1] !== state.front.id && m[1] !== state.rear.id)) return false;
    store.set('returnPending', '0');
    const url = store.get('lastGallery', '');
    if (!url) { setStatus('All done. (No gallery page remembered to go back to.)'); return true; }
    store.set('restoreScroll', '1');
    setStatus('All done. Going back to your gallery…');
    setTimeout(() => { location.href = url; }, 600);
    return true;
  }


  registerFeature({
    id: 'description', label: 'Descriptions and auto-fill', requires: ['details'],
    groups: [
      {
        drawer: 'pair', title: 'Description', pages: ['edit'],
        build: () => [
          h('button', { id: 'fillBtn', class: 'btn ghost', disabled: true, text: 'Fill description (F)' }),
          h('button', { id: 'backGallery', class: 'btn ghost', text: 'Back to my gallery', title: 'Go back to the last gallery you visited' })
        ]
      },
      {
        drawer: 'pair', title: 'Automation',
        build: () => [
          h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'autoEdit' }), 'Auto-click “edit” on my photos'),
          h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'autoFill' }), 'Auto-fill on the edit page'),
          h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'autoSave' }), 'Auto-click “Save” after filling'),
          h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'autoReturn' }), 'Return to my gallery when finished')
        ]
      }
    ],
    keys: {
      fill: { code: 'KeyF', label: 'Fill the description', run: () => { if (!here.edit) return false; $('fillBtn').click(); return true; }, hintOrder: 20 }
    },
    init: () => {
      $('fillBtn').disabled = !here.edit;
      $('fillBtn').title = here.edit ? 'Fill the description of this photo' : 'Only available on the edit page';
      $('fillBtn').onclick = fillDescription;
      $('backGallery').onclick = () => {
        const url = store.get('lastGallery', '');
        if (!url) { setStatus('No gallery visited yet in this browser.'); return; }
        store.set('restoreScroll', '1');
        location.href = url;
      };
      // Options: always visible, remembered
      [['autoEdit', '0'], ['autoFill', '0'], ['autoSave', '0'], ['autoReturn', '1']].forEach(([id, def]) => {
        $(id).checked = store.get(id, def) === '1';
        $(id).onchange = () => store.set(id, $(id).checked ? '1' : '0');
      });
    }
  });
  /* =====================================================================
   *  LIKE THE PHOTOS SHOWN ON THE PAGE
   * ===================================================================== */
  // Each photo has <i id="unit_ul{ID}" class="fa fa-heart-o rating" onclick="snd1ReqqGal(...)">.
  // Only hearts that are still empty (fa-heart-o) are clicked, each at most once,
  // so a photo you already liked can never be un-liked by mistake.
  //
  // Multi-page mode: with "Pages to like" > 1 the run is saved in localStorage ("likeRun"), the script
  // likes the page, goes to the next one, and resumes automatically after each page load until the
  // requested number of pages is done. A run is dropped if it goes stale (> 60 s without progress),
  // if you leave the gallery it started on, or if you stop it (button, L or Esc).
  const MAX_PAGES = 50;
  const clickedLikes = new Set();
  let liking = false, stopLiking = false;

  const getRun = () => { try { return JSON.parse(store.get('likeRun', 'null')); } catch (e) { return null; } };
  const setRun = r => store.set('likeRun', r ? JSON.stringify(r) : 'null');
  // Same gallery = same address without the page number
  const galleryKey = () => {
    const p = new URLSearchParams(location.search); p.delete('start');
    return location.pathname + '?' + [...p.entries()].map(([k, v]) => k + '=' + v).sort().join('&');
  };
  const pagesWanted = () => Math.min(MAX_PAGES, Math.max(1, parseInt($('pages').value, 10) || 1));


  const unlikedHearts = () =>
    [...document.querySelectorAll('i.rating.fa-heart-o[id^="unit_ul"]')].filter(el => !clickedLikes.has(el.id));

  function updateLikeBtn() {
    if (liking) return;
    const b = $('likeAll'), r = getRun();
    if (r) { b.disabled = false; b.textContent = `Stop auto-like (page ${r.done + 1}/${r.total}) (L)`; return; }
    const n = unlikedHearts().length, pages = pagesWanted();
    if (pages > 1) {
      b.disabled = !document.querySelector('i.rating[id^="unit_ul"]');
      b.textContent = `Like ${pages} pages from this one (L)`;
    } else {
      b.disabled = n === 0;
      b.textContent = n ? `Like ${n} photo${n > 1 ? 's' : ''} on this page (L)` : 'No photos to like on this page';
    }
  }

  // Likes every empty heart of the current page; returns how many were clicked
  async function likePage(label) {
    const list = unlikedHearts();
    const delay = Math.max(100, parseInt($('delay').value, 10) || 200);
    const b = $('likeAll');
    let done = 0;
    for (const el of list) {
      if (stopLiking) break;
      b.textContent = `Stop (${label}${done + 1}/${list.length})`;
      clickedLikes.add(el.id);
      el.click();
      done++;
      await new Promise(r => setTimeout(r, delay));
    }
    return done;
  }

  function cancelLikeRun(msg) {
    setRun(null);
    if (liking) stopLiking = true;
    updateLikeBtn();
    if (msg) setStatus(msg);
  }

  // One step of a multi-page run: like this page, then move to the next one (or finish)
  async function runStep() {
    const r = getRun();
    if (!r) return;
    liking = true; stopLiking = false;
    const done = await likePage(`page ${r.done + 1}/${r.total} · `);
    const stopped = stopLiking;
    liking = false; stopLiking = false;
    if (stopped || !getRun()) { setRun(null); updateLikeBtn(); setStatus(`Stopped on page <b>${r.done + 1}</b>. <b>${r.liked + done}</b> photo${r.liked + done > 1 ? 's' : ''} liked.`); return; }

    r.done += 1; r.liked += done; r.ts = Date.now();
    const href = pageHref(+1);
    if (r.done >= r.total || !href) {
      setRun(null); updateLikeBtn();
      setStatus(r.done >= r.total
        ? `Done: <b>${r.liked}</b> photo${r.liked > 1 ? 's' : ''} liked over <b>${r.done}</b> page${r.done > 1 ? 's' : ''}.`
        : `Reached the last page after <b>${r.done}</b> page${r.done > 1 ? 's' : ''}: <b>${r.liked}</b> liked.`);
      return;
    }
    setRun(r);
    updateLikeBtn();
    setStatus(`Page <b>${r.done}/${r.total}</b> done (${r.liked} liked). Next page…`);
    // Let the last like request finish before leaving the page
    setTimeout(() => { if (getRun()) location.href = href; }, 700);
  }

  async function likeAll() {
    if (liking || getRun()) { cancelLikeRun('Auto-like stopped.'); return; } // second click = stop
    const pages = pagesWanted();
    if (pages > 1) {
      setRun({ total: pages, done: 0, liked: 0, key: galleryKey(), ts: Date.now() });
      runStep();
      return;
    }
    const list = unlikedHearts();
    if (!list.length) return;
    liking = true; stopLiking = false;
    const done = await likePage('');
    const stopped = stopLiking;
    liking = false; stopLiking = false;
    updateLikeBtn();
    setStatus(stopped ? `Stopped after <b>${done}</b> like${done > 1 ? 's' : ''}.` : `Liked <b>${done}</b> photo${done > 1 ? 's' : ''}.`);
  }

  // A multi-page run resumes by itself after each page load
  function resumeLikeRun() {
    const r = getRun();
    if (!r) return;
    const fresh = Date.now() - (r.ts || 0) < 60000;
    if (!fresh || r.key !== galleryKey() || !document.querySelector('i.rating[id^="unit_ul"]')) {
      setRun(null); updateLikeBtn(); // stale, or left the gallery it started on
      return;
    }
    setStatus(`Auto-like: page <b>${r.done + 1}/${r.total}</b>…`);
    setTimeout(() => { if (getRun()) runStep(); }, 600); // short pause so the page is fully loaded
  }


  registerFeature({
    id: 'likes', label: 'Likes',
    groups: [{
      drawer: 'gallery', title: 'Likes', pages: ['gallery'],
      build: () => [
        h('button', { id: 'likeAll', class: 'btn ghost', disabled: true, text: 'Like this page' }),
        h('div', { class: 'row' }, h('label', { for: 'pages', text: 'Pages to like' }), h('input', { type: 'number', id: 'pages', min: 1, step: 1 })),
        h('div', { class: 'row' }, h('label', { for: 'delay', text: 'Delay between likes (ms)' }), h('input', { type: 'number', id: 'delay', min: 100, step: 50 }))
      ]
    }],
    keys: {
      like: { code: 'KeyL', label: 'Like the page',
        run: () => { // like this page (or "Pages to like" pages); press again while running = stop
          if (liking || getRun() || unlikedHearts().length || (pagesWanted() > 1 && document.querySelector('i.rating[id^="unit_ul"]'))) { likeAll(); return true; }
          if (document.querySelector('i.rating[id^="unit_ul"]')) { setStatus('Nothing left to like on this page.'); return true; }
          return false;
        },
        hintOrder: 30
      }
    },
    onEscape: () => { if (!(liking || getRun())) return false; cancelLikeRun('Auto-like stopped.'); return true; },
    escOrder: 30,
    init: () => {
      $('delay').value = store.get('delay', '200');
      $('delay').oninput = () => store.set('delay', $('delay').value);
      $('pages').value = store.get('pages', '1');
      $('pages').oninput = () => { store.set('pages', $('pages').value); updateLikeBtn(); };
      $('pages').max = MAX_PAGES;
      $('likeAll').onclick = likeAll;
      host.addEventListener('mouseenter', updateLikeBtn); // pages can load photos lazily
      updateLikeBtn();
    }
  });
  /* =====================================================================
   *  PAGE NAVIGATION  (previous / next page of a gallery)
   * ===================================================================== */
  // The site's pagination is <ul class="pagination"> « 1 2 3 »: the active page is <li class="active">,
  // so the previous / next page is simply the <li> before / after it.
  // Address of the previous (-1) / next (+1) page, or null on the first / last page
  function pageHref(dir) {
    const ul = document.querySelector('ul.pagination');
    if (!ul) return null;
    const items = [...ul.children].filter(li => li.tagName === 'LI');
    const i = items.findIndex(li => li.classList.contains('active'));
    const target = i < 0 ? null : items[i + dir];
    const a = target && target.querySelector('a');
    const href = a && a.getAttribute('href');
    if (!a || !href || href === '#' || /^javascript:/i.test(href)) return null;
    // A link that points back to the page we are on (e.g. "»" on the last page) is not a new page
    if (a.href.split('#')[0] === location.href.split('#')[0]) return null;
    try {
      const cur = new URLSearchParams(location.search).get('start');
      const nxt = new URL(a.href).searchParams.get('start');
      if ((cur !== null || nxt !== null) && (cur || '0') === (nxt || '0')) return null;
    } catch (e) {}
    return a.href;
  }

  function goToPage(dir) {
    if (!document.querySelector('ul.pagination')) return false; // no pagination here: leave the key alone
    if (liking || getRun()) { setStatus('Auto-like is running. Press <b>L</b> or <b>Esc</b> to stop it first.'); return true; }
    const href = pageHref(dir);
    if (!href) { setStatus(dir > 0 ? 'This is the <b>last</b> page.' : 'This is the <b>first</b> page.'); return true; }
    setStatus(dir > 0 ? 'Next page…' : 'Previous page…');
    location.href = href;
    return true;
  }


  registerFeature({
    id: 'pages', label: 'Gallery page keys',
    groups: [{
      drawer: 'gallery', title: 'Pages', pages: ['gallery'],
      build: () => [
        h('div', { class: 'btnrow' },
          h('button', { id: 'prevPage', class: 'btn ghost half', text: '◀ Previous' }),
          h('button', { id: 'nextPage', class: 'btn ghost half', text: 'Next ▶' }))
      ]
    }],
    keys: {
      prev: { code: 'KeyA', label: 'Previous page', run: () => goToPage(-1), hint: () => keyName(actions.prev.bound) + ' ◀ ▶ ' + keyName(actions.next.bound), hintOrder: 60 }, // left key
      next: { code: 'KeyD', label: 'Next page', run: () => goToPage(+1) }                                                 // right key -> next page
    },
    init: () => {
      $('prevPage').onclick = () => goToPage(-1);
      $('nextPage').onclick = () => goToPage(+1);
    }
  });
  /* =====================================================================
   *  PLATE CHECK  (on the upload page: how many photos of this plate are already on the site)
   *    The count is the site's own gallery search, read from the page title. The same page also shows the vehicle of each photo
   *    of that plate (its brand, model and generation, as the numbers of the form's menus): the most common one is offered,
   *    in a card above the vehicle menus, to fill them with one click (nothing is filled before the click, and no request more).
   *    When an upload tab checks its plate, the result is saved on its photo in the batch queue,
   *    so the batch window shows a warning on that card before anything is sent.
   * ===================================================================== */
  const countCache = new Map();   // search address -> { count, vehicle }, for this page
  const pending = new Map();      // search address -> the request in progress (same plate = one request)

  const searchUrl = plate => `/${here.country}/gallery.php?gal=${here.country}&nomer=${encodeURIComponent(plate).replace(/%20/g, '+')}`;

  // The vehicle the photos of the page show: every photo card links its brand, model and generation to the catalogue
  // (/gallery.php?markaavto=<id>&model=<id>&modgen=<id>): the most common triple wins, the first one on a tie.
  // { path: [brand, model, generation] (as far as it is known), photos: how many agree, of: how many name a vehicle }
  function plateVehicle(doc) {
    const seen = new Map();
    let of = 0;
    const links = doc.querySelectorAll('.panel-body a[href*="markaavto="]');
    (links.length ? links : doc.querySelectorAll('a[href*="markaavto="]')).forEach(a => {
      let q;
      try { q = new URL(a.getAttribute('href'), location.origin).searchParams; } catch (e) { return; }
      const brand = q.get('markaavto');
      if (!brand || brand === '200') return;
      const path = [brand, q.get('model'), q.get('modgen')].filter(Boolean);
      const key = path.join('|');
      of++;
      seen.set(key, { path, photos: (seen.get(key) ? seen.get(key).photos : 0) + 1 });
    });
    const best = [...seen.values()].sort((a, b) => b.photos - a.photos)[0];
    return best ? { ...best, of } : null;
  }

  async function fetchPlateInfo(url) {
    const text = await siteFetch(url);
    const doc = new DOMParser().parseFromString(text, 'text/html');
    // the title reads "License plates found <b>N</b>" (the text depends on the account language)
    const num = doc.querySelector('.breadcrumbs h1 b');
    if (!num || !/^\s*\d+\s*$/.test(num.textContent)) throw new Error('no count on the page');
    log('plate count', url, '=' + num.textContent.trim());
    return { count: +num.textContent, vehicle: +num.textContent ? plateVehicle(doc) : null };
  }

  function plateInfo(plate) {
    const url = searchUrl(plate);
    if (countCache.has(url)) return Promise.resolve(countCache.get(url));
    if (pending.has(url)) return pending.get(url);
    const request = fetchPlateInfo(url)
      .then(info => { countCache.set(url, info); return info; })
      .finally(() => pending.delete(url));
    pending.set(url, request);
    return request;
  }
  const countPlate = plate => plateInfo(plate).then(info => info.count);

  // What the card says of a vehicle: its names in the page's own menus, and the path that exists there (an id the menus do not know
  // is dropped, so a fill never picks something else)
  function plateVehicleNames(v) {
    const d = vehicleData();
    const brand = d.brands.find(b => b.id === v.path[0]);
    if (!brand) return null;
    const path = [brand.id];
    const names = [brand.name];
    const model = v.path[1] && (d.models[brand.id] || []).map(String).includes(v.path[1]) ? v.path[1] : null;
    if (model) {
      path.push(model); names.push(d.modelNames[model]);
      const gen = v.path[2] && (d.gens[model] || []).map(String).includes(v.path[2]) && String(d.genNames[v.path[2]]) !== '0' ? v.path[2] : null;
      if (gen) { path.push(gen); names.push(d.genNames[gen]); }
    }
    return { path, text: names.join(' \u203a ') };
  }

  // The card above the vehicle menus: the count, and the vehicle of the photos already on the site
  function plateCard(plate, info, message) {
    const card = inlineCard({ id: 'pmg-plate-card', title: 'Plate check', before: document.querySelector('.pm-vehicle-fields-row') });
    if (!card) return;
    card.clear();
    if (!plate) { card.host.hidden = true; return; }
    card.message(message);
    const v = info && info.vehicle && plateVehicleNames(info.vehicle);
    const links = lookupLinks(plate);                                           // public lookup pages, plain links (75-lookups.js)
    const series = seriesLine(plate);                                           // your photos of the series of the plate (79-series.js)
    const register = registryLine(plate);                                       // the country's open register, on a click (80-registry.js)
    if (!v && !links && !series && !register) return;
    const agree = v && info.vehicle.of > 1 ? ` (${info.vehicle.photos} of ${info.vehicle.of} photos)` : '';
    card.body.append(h('div', { class: 'cardbox' },
      v ? h('p', { class: 'hint', text: 'The photos of this plate on the site show:' }) : null,
      v ? h('div', { class: 'vehline' }, h('b', { text: v.text }), h('span', { class: 'mute', text: agree })) : null,
      v ? h('div', { class: 'cardrow' }, h('button', { type: 'button', class: 'btn', text: 'Fill the menus', onclick: () => { vehicleFill(v.path); card.message('Menus filled.'); } })) : null,
      series, register, links));
  }

  // The result goes to the photo this tab is loading, if the batch is running
  function saveForBatch(plate, count) {
    const b = getBatch();
    if (!b || !b.active || !b.current) return;
    qGet(b.current).then(it => {
      if (!it) return;
      it.plate = plate; it.dupes = count;
      return qPut(it).then(() => {
        const q = queue.find(x => x.id === it.id);
        if (q) { q.plate = plate; q.dupes = count; if (managerOpen) refreshCard(q); }
      });
    }).catch(() => {});
  }

  let lastPlate = null;
  function showResult(text, kind) {
    const el = $('plateResult');
    el.textContent = text;
    el.className = 'presult' + (kind ? ' ' + kind : '');
  }

  async function checkPlate(manual) {
    if (!here.add) { showResult('Open an upload page to check a plate.'); return; }
    const plate = plateForForm();
    $('plateNow').textContent = plate || '—';
    lookupRefresh(plate);
    log('plate check', { manual, plate, country: here.country });
    if (!plate) { lastPlate = null; showResult('Type the plate in the form to check it.'); plateCard('', null, ''); return; }
    if (!manual && (plate === lastPlate || store.get('autoCheck', '1') !== '1')) return;
    lastPlate = plate;
    showResult('Checking…');
    plateCard(plate, null, 'Checking\u2026');
    try {
      const info = await plateInfo(plate);
      const n = info.count;
      if (plateForForm() !== plate) return;                        // the plate changed meanwhile
      const text = n ? `${n} photo${n > 1 ? 's' : ''} of this plate already on the site.` : 'Not on the site yet.';
      showResult(text, n ? 'warn' : 'ok');
      plateCard(plate, info, text);
      saveForBatch(plate, n);
    } catch (e) {
      showResult('Could not check: ' + e.message + '.', 'warn');
      plateCard(plate, null, 'Could not check: ' + e.message + '.');
    }
  }

  // Checks when the user leaves a field, presses Enter, or changes the plate type: no polling
  let checkTimer = null;
  const later = ms => { clearTimeout(checkTimer); checkTimer = setTimeout(() => checkPlate(false), ms); };
  const plateOn = () => here.add && featureOn('plate');
  document.addEventListener('input', e => { if (plateOn() && isPlateField(e.target)) later(700); }, true);
  document.addEventListener('blur', e => { if (plateOn() && isPlateField(e.target)) later(0); }, true);
  document.addEventListener('change', e => { if (plateOn() && e.target.tagName === 'SELECT') later(0); }, true);

  registerFeature({
    id: 'plate', label: 'Plate check',
    groups: [{
      drawer: 'search', title: 'Plate check', pages: ['add'],
      build: () => [
        h('div', { class: 'row' }, h('span', { class: 'lbl', text: 'Plate' }), h('b', { id: 'plateNow', text: '—' })),
        h('p', { id: 'plateResult', class: 'presult', text: 'Type the plate in the form to check it.' }),
        h('div', { class: 'btnrow' },
          h('button', { id: 'plateCheck', class: 'btn ghost', text: 'Check now' }),
          h('button', { id: 'plateOpen', class: 'btn ghost', text: 'Open the search' })),
        h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'autoCheck' }), 'Check as I type')
      ]
    }],
    init: () => {
      $('autoCheck').checked = store.get('autoCheck', '1') === '1';
      $('autoCheck').onchange = () => store.set('autoCheck', $('autoCheck').checked ? '1' : '0');
      $('plateCheck').onclick = () => checkPlate(true);
      // Safety net: some sites change a field without firing the events above. Reading a few fields is cheap.
      // It checks when the plate has stayed the same for one whole round (so not while the user is typing)
      let seen = null;
      setInterval(() => {
        if (!here.add || store.get('autoCheck', '1') !== '1') return;
        const plate = plateForForm() || null;
        if (plate === seen && plate !== lastPlate) checkPlate(false);
        seen = plate;
      }, 500);
      $('plateOpen').onclick = () => {
        const plate = plateForForm();
        if (plate) window.open(searchUrl(plate), '_blank');
      };
      checkPlate(false);
    }
  });
  /* =====================================================================
   *  SHORTCUTS  (every key of the script, and a way to change them)
   * ===================================================================== */
  // Click a key, then press the new one. A key another action already uses is swapped with this one.
  const MODIFIERS = ['Shift', 'Control', 'Alt', 'Meta'];

  function renderShortcuts() {
    const rows = Object.entries(actions)
      .sort(([, a], [, b]) => (a.hintOrder || 99) - (b.hintOrder || 99))
      .map(([id, a]) => h('div', { class: 'kbrow' },
        h('span', { class: 'kblabel', text: a.label }),
        h('span', { class: 'kbright' },
          h('button', { class: 'kbkey', text: keyName(a.bound), title: 'Click, then press the new key', onclick: () => capture(id) }),
          h('button', { class: 'kbreset' + (a.bound === a.code ? ' off' : ''), text: '↺', title: 'Back to the default key', onclick: () => { store.del('kb_' + id); rebuildKeys(); renderShortcuts(); } }))));
    rows.push(
      h('div', { class: 'kbrow fixed' }, h('span', { class: 'kblabel', text: 'Cancel, close, stop' }), h('span', { class: 'kbright' }, h('span', { class: 'kbkey static', text: 'Esc' }), h('span', { class: 'kbspacer' }))),
      h('div', { class: 'kbrow fixed' }, h('span', { class: 'kblabel', text: 'Select all photos (batch window)' }), h('span', { class: 'kbright' }, h('span', { class: 'kbkey static', text: 'Ctrl + A' }), h('span', { class: 'kbspacer' }))));
    $('kbList').replaceChildren(...rows);
  }

  function capture(id) {
    setStatus(`Press the new key for <b>${actions[id].label}</b>… (Esc cancels)`);
    app.capture = e => {
      if (MODIFIERS.includes(e.key)) return;                       // wait for the real key
      app.capture = null;
      if (e.key === 'Escape') { setStatus('Change cancelled.'); renderShortcuts(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) { setStatus('Use a single key, without Ctrl or Alt.'); renderShortcuts(); return; }
      setBinding(id, e.code);
    };
  }

  function setBinding(id, code) {
    const other = Object.keys(actions).find(o => o !== id && actions[o].bound === code);
    if (other) store.set('kb_' + other, actions[id].bound);       // swap with the other action
    store.set('kb_' + id, code);
    rebuildKeys(); renderShortcuts();
    setStatus(`<b>${actions[id].label}</b> is now <b>${keyName(code)}</b>${other ? ` (${actions[other].label} got the old key)` : ''}.`);
  }

  function resetAll() {
    Object.keys(actions).forEach(id => store.del('kb_' + id));
    rebuildKeys(); renderShortcuts();
    setStatus('Shortcuts back to the defaults.');
  }

  registerFeature({
    id: 'shortcuts', label: 'Shortcut editor',
    groups: [{
      drawer: 'keys', title: 'Keys',
      build: () => [
        h('div', { id: 'kbList', class: 'kblist' }),
        h('button', { class: 'btn ghost', text: 'Reset all to the defaults', onclick: resetAll })
      ]
    }],
    init: () => renderShortcuts()
  });
  /* =====================================================================
   *  GOOGLE LENS  (the photo is searched on Google Lens; the answer is the brand, model and generation it names)
   *    Built from the shared parts:
   *      bridge (lib/bridge.js)         asks Google, in another tab, for the titles of the Lens results of the photo
   *      vehicle (lib/vehicle.js)       compares those titles with the brands, models and generations of PlatesMania's menus
   *      inlineCard (ui/06-inline-card) shows the answer under the photo of the upload page, where it is used
   *    The Google side is 66-lens-google.js. On the upload page the search starts by itself as soon as a photo is chosen.
   *    Nothing is filled in the menus until the user clicks a choice.
   * ===================================================================== */
  settings.define('lens_auto', '1', 'Search each new photo on Google Lens', 'lens');

  // The photo to search: on the upload page the preview #zoomimg (a 1-pixel placeholder until a photo is chosen; its address is the
  // photo itself while it is not published), on another page the main photo. '' when there is none.
  const LENS_PLACEHOLDER = /^data:image\/gif/i;
  function lensPhoto() {
    const img = here.add ? document.getElementById('zoomimg') : [...document.images].find(i => /\/\/img\d+\.platesmania\.com\/\d+\/m\/\d+\.jpg/i.test(i.src));
    return img && img.src && !LENS_PLACEHOLDER.test(img.src) ? img.src.replace(/\/s\/(\d+\.jpg)/, '/m/$1') : '';
  }

  // Where the answer goes: the card under the photo of the upload page (above the vehicle menus when the page has no photo block),
  // and always the panel, so both show it at once
  function lensShow(message, rows, similar) {
    const photo = document.getElementById('zoomimgid'), menus = document.querySelector('.pm-vehicle-fields-row');
    const card = inlineCard({ id: 'pmg-lens-card', title: 'Google Lens', after: photo, before: photo ? null : menus });
    if (card) {
      card.message(message);
      card.clear();
      if (rows) {
        const first = [];
        for (const r of rows) { if (!r.candidates[0]) break; first.push(r.candidates[0].id); }
        cardChoices(card, rows.map(r => ({ label: r.category, level: r.level, choices: r.candidates })),
          { pick: lensPick, current: vehicleCurrent, action: { label: 'Fill with the first choices', path: first } });
      }
      if (similar && similar.length) card.body.prepend(lensSays(similar));              // above the columns (cardChoices empties the card first)
    }
    $('lensMsg').textContent = message;
    const out = $('lensOut');
    out.textContent = '';
    if (similar && similar.length) out.appendChild(lensSays(similar));
    if (!rows) return;
    // the same choices as the card, stacked (the drawer is narrow), and clickable the same way
    for (const r of rows) {
      out.appendChild(h('div', { class: 'cat', text: r.category }));
      out.appendChild(h('div', { class: 'lens-cands' }, r.candidates.length
        ? r.candidates.map((c, i) => h('button', { class: 'chip' + (i === 0 ? ' best' : ''), text: c.name, 'data-id': String(c.id), 'data-level': String(r.level), onclick: () => lensPick(c.path) }))
        : h('div', { class: 'lens-none', text: 'No choice' })));
    }
    const now = vehicleCurrent();
    out.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', now[+c.dataset.level] === c.dataset.id));
  }

  // A click on a choice fills the menus, then the guess is redone around what was picked: the models of the picked brand, the
  // generations of the picked model
  let lensTitles = [], lensNamed = [];
  const lensGuessNow = pin => vehicleGuess(lensNamed.concat(lensTitles), vehicleData(), pin, lensNamed.length);   // what Google names counts first, and more
  function lensPick(path) {
    vehicleFill(path);
    lensShow('Lens results compared with PlatesMania. Click a choice to fill the menu.', lensGuessNow({ brand: path[0], model: path[1] }), lensNamed);
  }

  // What Google itself calls the vehicle, each name a button: it goes into the site's own "brand and model" box, which finds the
  // vehicle (the way out when the menus of the page do not name it)
  function lensSays(similar) {
    return h('div', { class: 'cardbox says' }, h('div', { class: 'cat', text: 'Google says' }),
      h('div', { class: 'pills' }, similar.slice(0, 3).map(q => h('button', { type: 'button', class: 'pill', text: q, title: 'Use in the brand and model box',
        onclick: () => { if (!vehicleSearchBox(q)) setStatus('This page has no brand and model box.', 3000); } }))));
  }

  // The search: the photo goes to the Google side, the titles of the results come back
  function lensStart(photo, background) {
    lensShow('Searching on Google Lens…', null);
    bridgeAsk('lens', { photo }, lensMarkedUrl(), { background, timeout: 120 }).then(answer => {
      // { similar, titles }; an older answer is the titles alone
      lensTitles = Array.isArray(answer) ? answer : answer.titles || [];
      lensNamed = Array.isArray(answer) ? [] : answer.similar || [];
      const rows = lensGuessNow();
      lensShow(rows[0].candidates.length ? 'Lens results compared with PlatesMania. Click a choice to fill the menu.' : 'Lens answered, but no PlatesMania brand was found in the results.', rows, lensNamed);
      setStatus('Google Lens results are ready.', 3500);
    }, e => lensShow(e.message === 'no answer' ? 'No result came back from Google Lens. Open its tab to see the page.' : 'Could not open Google Lens: ' + e.message + '.', null));
    return true;
  }

  // A photo chosen on the upload page changes the address of #zoomimg: search it at once (not at load: a photo already there was seen)
  let lensSent = '';
  function lensWatch() {
    const img = document.getElementById('zoomimg');
    if (!img) return;
    new MutationObserver(() => setTimeout(() => {
      const photo = lensPhoto();
      if (!settings.on('lens_auto') || !photo || photo === lensSent) return;
      lensSent = photo;
      if (lensStart(photo, true)) setStatus('Photo sent to Google Lens (new tab).', 3500);
    }, 300)).observe(img, { attributes: true, attributeFilter: ['src'] });
  }

  registerFeature({
    id: 'lens', label: 'Google Lens',
    groups: [{
      drawer: 'search', title: 'Google Lens', pages: ['add', 'edit', 'gallery'],
      build: () => [
        h('button', { id: 'lensSearch', class: 'btn', text: 'Search this photo on Google Lens' }),
        h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'lensAuto' }), 'Search each new photo by itself'),
        h('p', { id: 'lensMsg', class: 'presult', text: 'Choose a photo: it is searched on Google Lens, and the likely brand, model and generation appear here and under the photo.' }),
        h('div', { id: 'lensOut', class: 'lens-out' })
      ]
    }],
    init: () => {
      $('lensSearch').onclick = () => {
        const photo = lensPhoto();
        if (!photo) { setStatus('No photo on this page yet: choose or upload one first.', 3500); return; }
        lensStart(photo, false);
      };
      $('lensAuto').checked = settings.on('lens_auto');
      $('lensAuto').onchange = () => settings.set('lens_auto', $('lensAuto').checked ? '1' : '0');
      lensWatch();
    }
  });
  /* =====================================================================
   *  GOOGLE LENS, ON THE GOOGLE SIDE  (the same script, opened by the Lens group of the panel; the job 'lens' of lib/bridge.js)
   *    Two steps, on the two pages Google shows:
   *      1. the page the panel opened (the marker in the address): the photo of the request goes into the "paste an image link" box
   *         of Google's search by image, and the search starts, the way the box is used by hand;
   *      2. the results page that follows (within three minutes of the request): the answer is { similar, titles }. similar = what
   *         Google itself calls the vehicle (the "similar searches" chips: links with a thumbnail whose address carries the query and a
   *         knowledge-graph id), titles = the titles of the results (links, headings, image descriptions). The panel compares both
   *         with its menus, and gives more weight to what Google names.
   *    A Google page the panel did not ask for is left alone. On any Google page the script stops here: no panel, no other feature.
   *    Only function declarations: this runs from core/00-open.js, before the rest of the script is set up.
   * ===================================================================== */
  function lensMarkedUrl() { return 'https://www.google.com/?olud&src=pm'; }

  // Logs of the dev build only
  function lensLog(...args) { if ('0' === '1') console.log('[NextPlaate] Lens (Google side)', ...args); }

  function onLensPage() {
    try {
      const u = new URL(location.href);
      return /^www\.google\./.test(u.hostname) && u.searchParams.has('olud') && u.searchParams.get('src') === 'pm';
    } catch (e) { return false; }
  }

  // What Google names: the text of the query of each similar-search chip (Lens links them with a knowledge-graph id or a Lens surface
  // and a thumbnail). Works in any language: it reads the address, not the words of the page.
  function lensSimilar() {
    const out = [];
    document.querySelectorAll('a[href*="q="]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (!/[?&](kgmid|lns_surface)=/.test(href) || !a.querySelector('img')) return;
      let q = '';
      try { q = (new URL(href, location.href).searchParams.get('q') || '').replace(/\+/g, ' ').trim(); } catch (e) { return; }
      if (q && !out.some(x => x.toLowerCase() === q.toLowerCase()) && out.length < 8) out.push(q);
    });
    return out;
  }

  // Step 2: the answer, once the page has the results (it fills in after loading)
  function lensReadResults() {
    const request = bridgePending('lens', 180);
    // a results page of Lens: its own host, or a search whose address carries Lens parameters (lns_mode, lns_surface...)
    const results = /^lens\.google\./.test(location.hostname) || (/^\/search/.test(location.pathname) && /[?&]lns_/.test(location.search));
    lensLog('results page?', { results, asked: !!request, url: location.href });
    if (!results || !request) return;
    const collect = () => {
      const out = [];
      document.querySelectorAll('a[href], [role="heading"], h1, h2, h3, img[alt]').forEach(el => {
        const t = (el.getAttribute('aria-label') || el.getAttribute('alt') || el.textContent || '').replace(/\s+/g, ' ').trim();
        if (t.length >= 8 && t.length <= 200 && !out.includes(t) && out.length < 150) out.push(t);
      });
      return out;
    };
    let tries = 0;
    const timer = setInterval(() => {
      const titles = collect(), similar = lensSimilar();
      tries++;
      // the results are there (titles); Google's own naming comes with them or a little later (about 6 s more), else it is left out
      const ready = titles.length >= 12 && (similar.length || tries >= 12);
      if (!ready && tries <= 40) return;                    // up to about 20 s for the results to appear
      clearInterval(timer);
      lensLog('found', { titles: titles.length, similar }, titles.slice(0, 5));
      if (titles.length || similar.length) bridgeAnswer('lens', request, { similar, titles });
    }, 500);
  }

  // Step 1 (and the entry for both): Google's own markup. The jsname values are the ones of the box and the search button today,
  // the other selectors are a fallback.
  function lensOnGoogle() {
    lensLog('Google page', location.href, 'asked by the panel:', onLensPage());
    if (!onLensPage()) { lensReadResults(); return; }
    let done = false, tries = 0;
    const first = (...sel) => sel.map(s => document.querySelector(s)).find(Boolean);
    const attempt = () => {
      if (done) return;
      const request = bridgePending('lens', 180);
      const photo = request ? request.payload.photo : '';
      const box = first('input[jsname="W7hAGe"]', 'input.cB9M7', 'input[type="text"]');
      const go = first('div[role="button"][jsname="ZtOxCb"]', 'button[type="submit"]', 'button, div[role="button"]');
      if (tries % 20 === 0) lensLog('looking for the box', { photo: photo.length, box: !!box, button: !!go, tries });
      if (!photo || !box || !go) return;
      done = true;
      lensLog('photo put in the box, search started', { box: box.outerHTML.slice(0, 120) });
      box.focus();
      box.value = photo;
      box.dispatchEvent(new Event('input', { bubbles: true }));
      box.dispatchEvent(new Event('change', { bubbles: true }));
      go.click();
      // when the click did nothing, Enter in the box does the same
      setTimeout(() => box.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', which: 13, keyCode: 13 })), 400);
    };
    const timer = setInterval(() => { if (done || tries++ > 120) clearInterval(timer); else attempt(); }, 150);   // about 18 s
    attempt();
  }
  /* =====================================================================
   *  COUNTRY FLAGS  (one click to the upload page of a country)
   *    The flags of the 96 countries with their names, each a link to /<country>/add, and a box to find one by name or code.
   *    Two places:
   *      - the panel (Batch upload drawer): all the countries;
   *      - on the upload pages (/add and /<country>/add) and on a member's profile (/user<id>), right on the site, to the right of
   *        the page content: the countries the
   *        user chose in Settings (all by default). Where the screen has room beside the content the bar stands there, wide enough
   *        for the flags but never under the panel, even with its drawer open (the rail and the drawer take 56 px + 340 px of the
   *        right edge); on a narrower screen it moves under the photo, in the right-hand column, and the page is not widened.
   *    The choice is the setting flags_chosen: 'all', or the codes separated by commas (an empty value is no country).
   *    The flags are the site's own images (/assets/img/profile-flags/<code>.svg): nothing is downloaded from elsewhere.
   * ===================================================================== */
  const flagUrl = code => `/assets/img/profile-flags/${code}.svg`;
  settings.define('flags_chosen', 'all', 'Countries on the side bar', 'flags');

  // The countries of the side bar: a Set of codes, or null for all of them
  function flagsChosen() {
    const v = settings.get('flags_chosen');
    return v === 'all' ? null : new Set(v.split(',').filter(Boolean));
  }

  // The flags as links, each with the name of its country; the country of the page is marked. only: a Set of codes to keep, or null.
  // An image that fails shows the code instead.
  function flagLinks(only) {
    return h('nav', { class: 'flags' }, COUNTRIES.filter(c => !only || only.has(c.code)).map(c => {
      const img = h('img', { src: flagUrl(c.code), alt: '', width: 22, height: 15 });
      img.addEventListener('error', () => img.replaceWith(h('span', { class: 'flagcode', text: c.code.toUpperCase() })));
      return h('a', { class: 'flag' + (c.code === here.country ? ' on' : ''), href: `/${c.code}/add`, title: c.name, 'data-find': (c.name + ' ' + c.code).toLowerCase() },
        img, h('span', { class: 'fname', text: c.name }));
    }));
  }

  // The flags with a box to find a country by its name or its code (96 of them: a name is faster than looking for a flag). With few
  // countries the box is not needed.
  const FLAGS_FIND_FROM = 13;
  function flagBlock(only) {
    const list = flagLinks(only);
    const many = list.children.length >= FLAGS_FIND_FROM;
    const find = h('input', { type: 'text', placeholder: 'Find a country…', hidden: !many });
    find.addEventListener('input', () => {
      const q = find.value.trim().toLowerCase();
      list.querySelectorAll('a.flag').forEach(a => { a.hidden = !!q && !a.dataset.find.includes(q); });
    });
    const none = only && !only.size ? h('p', { class: 'presult', text: 'No country chosen. Choose some in Settings, Country flags.' }) : null;
    return h('div', { class: 'flagblock' }, find, none, list);
  }

  // ---- the bar on the page
  const FLAGS_GAP = 16;          // space between the content and the bar, and between the bar and the panel
  const FLAGS_MIN = 150;         // narrower than this, the bar goes under the photo
  const FLAGS_MAX = 320;
  const FLAGS_CSS = `
    :host{display:block}
    .box{background:#fff;border:1px solid var(--line);padding:10px;display:flex;flex-direction:column;gap:8px}
    .t{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--primary-h)}
    .flags{max-height:70vh;overflow-y:auto}
  `;
  const flagsBarContent = () => [h('div', { class: 't', text: 'Add a photo in…' }), flagBlock(flagsChosen())];

  function flagsBar() {
    const host = h('div', { id: 'pmg-flags' });
    const root = host.attachShadow({ mode: 'open' });
    root.append(h('style', { text: UI_BASE + FLAGS_CSS }), h('div', { class: 'box' }, flagsBarContent()));
    return host;
  }

  // The choice changed in Settings: the bar follows at once
  function flagsRefresh() {
    const host = document.getElementById('pmg-flags');
    if (host) host.shadowRoot.querySelector('.box').replaceChildren(...flagsBarContent());
  }

  // Beside the content when there is room for it, else under the photo. Called at start, on resize and when the page has loaded.
  function flagsPlace() {
    const host = document.getElementById('pmg-flags');
    if (!host) return;
    const content = document.querySelector('.content .container, .container.content') || document.querySelector('.container');
    const vw = document.documentElement.clientWidth;
    const panel = 56 + Math.min(340, vw - 56);                       // the rail, and the drawer when it is open
    const right = content ? content.getBoundingClientRect().right : vw;
    const room = vw - panel - right - 2 * FLAGS_GAP;
    const photo = (document.getElementById('zoomimgid') || {}).parentElement;
    if (room >= FLAGS_MIN) {
      const top = (photo || content || document.body).getBoundingClientRect().top + window.scrollY;
      if (host.parentNode !== document.body) document.body.appendChild(host);
      host.style.cssText = `position:absolute;z-index:50;top:${Math.max(0, top)}px;left:${right + window.scrollX + FLAGS_GAP}px;width:${Math.min(room, FLAGS_MAX)}px`;
    } else {
      const after = document.getElementById('informer-preview-wrap') || document.getElementById('zoomimgid');
      const side = here.profile && content && content.querySelector('.col-md-3');      // a profile: under the avatar, in the left column
      host.style.cssText = 'position:static;margin-top:10px';
      if (after) after.parentNode.insertBefore(host, after.nextSibling);
      else if (side) side.appendChild(host);
      else if (content) content.insertBefore(host, content.firstChild);
      else document.body.appendChild(host);
    }
  }

  // ---- the choice, in Settings: a box per country, applied at once to the bar
  function flagsPicker() {
    const state = new Set(flagsChosen() || COUNTRIES.map(c => c.code));
    const count = h('p', { class: 'presult' });
    const boxes = [];
    const save = () => {
      settings.set('flags_chosen', state.size === COUNTRIES.length ? 'all' : [...state].join(','));
      count.textContent = state.size === COUNTRIES.length ? 'All the countries are on the side bar.' : `${state.size} of ${COUNTRIES.length} countries are on the side bar.`;
      flagsRefresh();
    };
    const rows = COUNTRIES.map(c => {
      const box = h('input', { type: 'checkbox', checked: state.has(c.code), id: 'flag_' + c.code });
      box.onchange = () => { box.checked ? state.add(c.code) : state.delete(c.code); save(); };
      boxes.push(box);
      return h('label', { class: 'chk', 'data-find': (c.name + ' ' + c.code).toLowerCase() }, box, h('img', { src: flagUrl(c.code), alt: '', width: 22, height: 15 }), c.name);
    });
    const setAll = on => { state.clear(); if (on) COUNTRIES.forEach(c => state.add(c.code)); boxes.forEach(b => { b.checked = on; }); save(); };
    const find = h('input', { type: 'text', placeholder: 'Find a country…' });
    find.addEventListener('input', () => {
      const q = find.value.trim().toLowerCase();
      rows.forEach(r => { r.hidden = !!q && !r.dataset.find.includes(q); });
    });
    save();
    return h('div', { class: 'flagpick' }, count,
      h('div', { class: 'btnrow' }, h('button', { class: 'btn ghost sm', text: 'All', onclick: () => setAll(true) }), h('button', { class: 'btn ghost sm', text: 'None', onclick: () => setAll(false) })),
      find, h('div', { class: 'pickrows' }, rows));
  }

  registerFeature({
    id: 'flags', label: 'Country flags',
    groups: [{
      drawer: 'upload', title: 'Add a photo in a country',
      build: () => [h('p', { class: 'presult', text: 'Click a country to open its upload page.' }), flagBlock(null)]
    }, {
      drawer: 'settings', title: 'Country flags: the side bar',
      build: () => [h('p', { class: 'presult', text: 'Choose the countries shown on the side of the upload pages. The panel always lists all of them.' }), flagsPicker()]
    }],
    init: () => {
      if (!here.addAny && !here.profile) return;
      document.body.appendChild(flagsBar());
      flagsPlace();
      window.addEventListener('resize', flagsPlace);
      window.addEventListener('load', flagsPlace);
    }
  });
  /* =====================================================================
   *  PLATE PREVIEW AS YOU TYPE  (the site's "Generate preview" button, pressed for you)
   *    On an upload page the site draws a preview of the plate from the country fields and shows a button to ask for it; any change
   *    in those fields clears it. Here the button is pressed as soon as the user stops typing (PREVIEW_DELAY), so the preview is
   *    always there. The request is the page's own (the script only clicks its button): no other request, never two less than
   *    PREVIEW_GAP apart, and nothing while a preview is loading, while there is no plate yet, or while the one shown is up to date.
   * ===================================================================== */
  const PREVIEW_DELAY = 700;      // ms after the last keystroke
  const PREVIEW_GAP = 2000;       // ms: the least time between two previews
  let previewTimer = null, previewLast = 0, previewSig = '', previewSynthetic = false;

  // The country fields: those before the photo field, like the site's own function (the description and the rest come after it)
  function previewFields() {
    const all = [...document.querySelectorAll('#frm input, #frm select, #frm textarea')];
    const file = all.findIndex(el => el.id === 'filename');
    return file === -1 ? all : all.slice(0, file);
  }
  const previewSignature = () => previewFields().map(el => (el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value)).join('\u0001');

  function previewNow() {
    const btn = document.getElementById('informer-preview-btn');
    if (!btn || btn.disabled || !plateForForm()) return;              // no button here, a preview is loading, or no plate yet
    const shown = btn.offsetParent === null;                          // the button is hidden while a preview is displayed
    const sig = previewSignature();
    if (shown && sig === previewSig) return;                          // the preview on the page is the one of these fields
    const wait = previewLast + PREVIEW_GAP - Date.now();
    if (wait > 0) { previewTimer = setTimeout(previewNow, wait); return; }
    if (shown) {                                                      // a preview that came back late is of older fields: clear it the way the site does
      const first = previewFields()[0];
      previewSynthetic = true;
      if (first) first.dispatchEvent(new Event('input', { bubbles: true }));
      previewSynthetic = false;
    }
    previewLast = Date.now();
    previewSig = sig;
    btn.click();
  }

  function previewLater(e) {
    if (previewSynthetic || !previewFields().includes(e.target)) return;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(previewNow, PREVIEW_DELAY);
  }

  registerFeature({
    id: 'preview', label: 'Plate preview as you type',
    init: () => {
      if (!here.add) return;
      document.addEventListener('input', previewLater, true);
      document.addEventListener('change', previewLater, true);
    }
  });
  /* =====================================================================
   *  SETTINGS DRAWER  (switch a feature off or on; the page is reloaded to apply it)
   *    One line per feature that has an id and a label (registerFeature). A switched-off feature has no control,
   *    no key and no Esc step; whatever it requires switches it off too.
   * ===================================================================== */
  function renderSettings() {
    const rows = settings.list('features').map(d => {
      const f = features.find(x => 'feature_' + x.id === d.id);
      const needs = ((f && f.requires) || []).map(r => (features.find(x => x.id === r) || {}).label || r);
      const box = h('input', { type: 'checkbox', id: 'set_' + d.id });
      const blocked = settings.on(d.id) && f && !featureOn(f.id);   // on, but something it needs is off: shown as off and not clickable
      box.checked = settings.on(d.id) && !blocked;
      box.disabled = !!blocked;
      box.onchange = () => { settings.set(d.id, box.checked ? '1' : '0'); $('setApply').hidden = false; renderSettings(); };
      const note = blocked ? ' (off: it needs ' + needs.join(', ') + ')' : needs.length ? ' (needs ' + needs.join(', ') + ')' : '';
      return h('label', { class: 'chk' + (blocked ? ' dim' : '') }, box, d.label + note);
    });
    $('setList').replaceChildren(...rows);
  }

  registerFeature({
    id: 'settings', locked: true,
    groups: [{
      drawer: 'settings', title: 'Features',
      build: () => [
        h('p', { class: 'presult', text: 'Switch a feature off to remove its controls and keys. The page reloads to apply the change.' }),
        h('div', { id: 'setList', class: 'chklist' }),
        h('button', { id: 'setApply', class: 'btn', hidden: true, text: 'Apply (reload the page)', onclick: () => location.reload() })
      ]
    }],
    init: () => renderSettings()
  });
  /* =====================================================================
   *  TAGS  (the site's tag pickers, made quick to use)
   *    The site hides its 52 tags in a closed accordion on the upload page and in a pop-up on a photo page ("add tags"), each a long
   *    list with a "+" to press for every tag. Here one picker replaces both: every tag is a button, grouped like the site groups
   *    them; a search box finds one by typing; what is chosen is shown as removable chips; the tags used most and the ones of the
   *    last upload are one click away.
   *      - upload page: a card above the site's section (which is hidden);
   *      - photo page: the "add tags" / "edit tags" link opens a window of ours (ui/07-modal.js) instead of the site's pop-up; Save
   *        presses the site's own Save button, so the site saves the tags exactly as before; Cancel gives the boxes back as they were.
   *    The site's own check boxes stay the source of truth: a click only checks or unchecks the real box and fires its change event,
   *    so the form is sent as before and the site's own counter keeps working. Switching the feature off brings the site's own back.
   * ===================================================================== */
  const TAGS_OFTEN = 6;           // how many of the most used tags the picker offers up front

  // The tags of a picker: from the site's own check boxes (name CheckBox[id], one label each) and its group headings
  function siteTags(picker) {
    if (!picker) return [];
    const groups = {};
    picker.querySelectorAll('.pm-tag-type1-group').forEach(g => {
      const name = g.querySelector('.pm-tag-type1-toggle span');
      groups[g.dataset.groupId] = name ? name.textContent.trim() : '';
    });
    return [...picker.querySelectorAll('input[name^="CheckBox["]')].map(input => {
      const label = input.closest('label');
      const span = label && label.querySelector('span');
      const id = (input.name.match(/\[(\d+)\]/) || [])[1];
      const group = label && label.dataset.groupId;
      return { id, name: span ? span.textContent.trim() : input.id, group: group || '0', groupName: groups[group] || 'Other', input };
    });
  }

  const tagsCount = () => { try { return JSON.parse(store.get('tags_count', '{}')); } catch (e) { return {}; } };
  const tagsLast = () => { try { return JSON.parse(store.get('tags_last', '[]')); } catch (e) { return []; } };

  // A tag is chosen or not by its real box; the change event is what the site's own code (and its counter) listens to
  function tagToggle(tag, on) {
    const want = on === undefined ? !tag.input.checked : on;
    if (tag.input.checked === want) return;
    tag.input.checked = want;
    tag.input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // What was used is remembered when the tags are sent (the form, or Save in the window)
  function tagsRemember(tags) {
    const ids = tags.filter(t => t.input.checked).map(t => t.id);
    if (!ids.length) return;
    const count = tagsCount();
    ids.forEach(id => { count[id] = (count[id] || 0) + 1; });
    store.set('tags_count', JSON.stringify(count));
    store.set('tags_last', JSON.stringify(ids));
  }

  // The picker: { el, sync }. say(text) tells how many are chosen (the title bar of the card or of the window).
  function tagPicker(tags, say) {
    const byId = Object.fromEntries(tags.map(t => [t.id, t]));
    const pill = tag => h('button', { type: 'button', class: 'pill', 'data-id': tag.id, text: tag.name, onclick: () => { tagToggle(tag); sync(); } });

    const chosen = h('div', { class: 'pills' });
    const clear = h('button', { type: 'button', class: 'btn ghost sm', text: 'Clear', onclick: () => { tags.forEach(t => tagToggle(t, false)); sync(); } });
    const find = h('input', { type: 'text', placeholder: 'Find a tag…' });
    const quick = h('div', { class: 'tagquick' });
    const groups = h('div', { class: 'taggroups' });

    const groupEls = [...new Set(tags.map(t => t.group))].map(g => {
      const list = tags.filter(t => t.group === g).sort((a, b) => a.name.localeCompare(b.name));
      return h('div', { class: 'taggroup' }, h('div', { class: 'cat', text: list[0].groupName }), h('div', { class: 'pills' }, list.map(pill)));
    });
    groups.append(...groupEls);

    // what is shown depends on the choice: chips on top, the groups with the chosen ones marked
    function sync() {
      const on = tags.filter(t => t.input.checked);
      chosen.replaceChildren(...(on.length
        ? on.map(t => h('button', { type: 'button', class: 'pill on removable', text: t.name + '  ×', title: 'Remove', onclick: () => { tagToggle(t, false); sync(); } }))
        : [h('span', { class: 'mute', text: 'No tag chosen' })]));
      clear.hidden = !on.length;
      say(on.length ? `${on.length} tag${on.length > 1 ? 's' : ''} chosen` : 'Choose the tags of the photo');
      [groups, quick].forEach(box => box.querySelectorAll('.pill').forEach(p => p.classList.toggle('on', byId[p.dataset.id].input.checked)));
    }

    // the most used tags, and the ones of the last upload (the site never remembers them)
    const often = Object.entries(tagsCount()).filter(([id]) => byId[id]).sort((a, b) => b[1] - a[1]).slice(0, TAGS_OFTEN).map(([id]) => byId[id]);
    const last = tagsLast().filter(id => byId[id]).map(id => byId[id]);
    if (often.length) quick.append(h('div', { class: 'cat', text: 'Most used' }), h('div', { class: 'pills' }, often.map(pill)));
    if (last.length) quick.append(h('div', { class: 'cat', text: 'Last upload' }), h('div', { class: 'pills' }, last.map(pill),
      h('button', { type: 'button', class: 'btn sm', text: 'Use again', onclick: () => { last.forEach(t => tagToggle(t, true)); sync(); } })));
    quick.hidden = !quick.children.length;

    // search: filters the groups; Enter chooses the first tag that matches
    find.addEventListener('input', () => {
      const q = find.value.trim().toLowerCase();
      groupEls.forEach(g => {
        let any = false;
        g.querySelectorAll('.pill').forEach(p => { const hide = !!q && !byId[p.dataset.id].name.toLowerCase().includes(q); p.hidden = hide; any = any || !hide; });
        g.hidden = !any;
      });
      quick.hidden = !!q || !quick.children.length;
    });
    find.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();                                        // not the form's own Enter
      const first = groups.querySelector('.pill:not([hidden])');
      if (first) { tagToggle(byId[first.dataset.id]); find.select(); sync(); }
    });

    const el = h('div', { class: 'tagbox' }, h('div', { class: 'tagrow' }, chosen, clear), find, quick, groups);
    sync();
    return { el, sync, find };
  }

  // ---- the upload page: a card above the site's section
  function tagsCard() {
    const picker = document.getElementById('add-tags-picker');
    const tags = siteTags(picker);
    if (!tags.length) return;
    const site = picker.closest('.panel-group') || picker;          // the site's whole section
    const card = inlineCard({ id: 'pmg-tags', title: 'Tags', before: site, closable: false });
    if (!card) return;
    site.hidden = true;
    site.style.display = 'none';
    const { el, sync } = tagPicker(tags, card.message);
    card.body.append(el);
    // the site's own code may change a box too (a related tag, its undo): the card follows
    picker.addEventListener('change', sync);
    new MutationObserver(sync).observe(picker, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    const form = picker.closest('form');
    if (form) form.addEventListener('submit', () => tagsRemember(tags), true);
  }

  // ---- a photo page: the "add tags" link opens our window instead of the site's pop-up
  function tagsWindow() {
    const picker = document.querySelector('#tagedit .pm-tag-type1');
    const tags = siteTags(picker);
    if (!tags.length || !document.getElementById('tags-edit-link')) return;
    document.addEventListener('click', e => {
      if (!(e.target.closest && e.target.closest('#tags-edit-link'))) return;
      e.preventDefault();
      e.stopPropagation();                                          // the site's own pop-up does not open
      const start = tags.map(t => t.input.checked);                 // what the boxes were: Cancel gives it back
      let modal = null;                                              // the picker says how many are chosen before the window exists
      const { el, sync, find } = tagPicker(tags, text => { if (modal) modal.message(text); });
      modal = modalOpen({
        id: 'pmg-tags-modal', title: 'Tags', body: el,
        onDismiss: () => { tags.forEach((t, i) => tagToggle(t, start[i])); },
        actions: [
          { label: 'Cancel', kind: 'ghost', run: () => modal.dismiss() },
          { label: 'Save', run: () => {
            tagsRemember(tags);
            const save = document.getElementById('submit');          // the site's own Save: it sends the tags as it always did
            if (save) save.click();
            modal.close();
            setStatus('Saving the tags…', 3000);
          } }
        ]
      });
      sync();
      find.focus();
    }, true);
  }

  registerFeature({
    id: 'tags', label: 'Tag picker',
    init: () => { if (here.add) tagsCard(); else if (here.photo) tagsWindow(); }
  });
  /* =====================================================================
   *  EXTRA INFORMATION  (the site's "Extra information" box, large from the start and in the look of the panel)
   *    The site shows a small three-line box with a label. Here a card takes its place: a tall box that grows with what is typed, the
   *    site's own hint, a character count, the location saved in Details one click away, and the date of the photo (its EXIF date,
   *    which the site shows under the photo once it is chosen) in two forms. The card sits above the tags card with
   *    a clear space between the two.
   *    The site's own box stays the source of truth (it is only hidden): what is typed in the card is copied into it with its input
   *    event, so the form is sent exactly as before; and what the site (or another script) writes in it shows in the card.
   *    A box inside a shadow root is not part of the form, which is why the card does not simply take the real one in.
   * ===================================================================== */
  const EXTRA_MIN = 180;          // px: the height of the box before anything is typed

  // The date the photo was taken: the site lists the EXIF dates of the photo under it (#fotodiv, "YYYY.MM.DD HH:MM:SS" in the text and
  // in the onclick that adds it to the box); the earliest is the shot. null when the photo has none.
  function photoDate() {
    const found = [...document.querySelectorAll('#fotodiv span[onclick^="appdop"]')].map(el => {
      const m = (el.textContent + ' ' + (el.getAttribute('onclick') || '')).match(/(\d{4})[.:](\d{2})[.:](\d{2})(?:\s+(\d{2}):(\d{2}):(\d{2}))?/);
      return m ? { y: +m[1], m: +m[2], d: +m[3], at: Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)) } : null;
    }).filter(Boolean).sort((a, b) => a.at - b.at);
    return found[0] || null;
  }
  const extraMonth = m => new Date(Date.UTC(2000, m - 1, 1)).toLocaleDateString('en', { month: 'long', timeZone: 'UTC' });

  function extraCard() {
    const real = document.querySelector('#frm textarea[name="dop"]');
    if (!real) return;
    const block = real.closest('.row') || real.closest('section') || real;       // the site's label and box
    const card = inlineCard({ id: 'pmg-extra', title: 'Extra information', before: block, closable: false });
    if (!card) return;
    block.style.display = 'none';

    // the site's hint is shown once, above the box; the box itself only says where to type
    const mine = h('textarea', { rows: 8, placeholder: 'Type here…', value: real.value, 'aria-label': 'Extra information' });
    mine.className = 'extra';
    const count = h('span', { class: 'count' });
    // the date buttons: month and year, or the whole date; there only while the photo has a date
    const dateBtn = full => h('button', { type: 'button', class: 'btn ghost sm', onclick: () => {
      const d = photoDate();
      if (d) insert(full ? `${d.d} ${extraMonth(d.m)} ${d.y}` : `${extraMonth(d.m)} ${d.y}`);
    } });
    const dateMonth = dateBtn(false), dateFull = dateBtn(true);
    const here_ = () => (store.get('place', '') || '').trim();                  // the location saved in Details (never its default)
    // adds a text on a line of its own at the end
    function insert(text) {
      mine.value = mine.value.trim() ? mine.value.replace(/\s+$/, '') + '\n' + text : text;
      push();                                                                // before the focus: focusing re-reads the site's box
      mine.focus();
    }
    const place = h('button', { type: 'button', class: 'btn ghost sm', onclick: () => insert(here_()) });

    function grow() {
      mine.style.height = 'auto';
      mine.style.height = Math.max(EXTRA_MIN, mine.scrollHeight + 2) + 'px';
    }
    function show() {
      count.textContent = mine.value.length ? `${mine.value.length} character${mine.value.length > 1 ? 's' : ''}` : '';
      place.hidden = !here_();
      place.textContent = 'Use my location: ' + here_();
      const d = photoDate();
      dateMonth.hidden = dateFull.hidden = !d;
      if (d) { dateMonth.textContent = `Date: ${extraMonth(d.m)} ${d.y}`; dateFull.textContent = `${d.d} ${extraMonth(d.m)} ${d.y}`; }
      grow();
    }
    function push() {                                                         // card -> site
      real.value = mine.value;
      real.dispatchEvent(new Event('input', { bubbles: true }));
      show();
    }
    mine.addEventListener('input', push);
    real.addEventListener('input', () => { if (real.value !== mine.value) { mine.value = real.value; show(); } });   // site -> card
    mine.addEventListener('focus', () => { if (real.value !== mine.value) { mine.value = real.value; show(); } });

    card.body.append(h('div', { class: 'cardbox' },
      h('p', { class: 'hint', text: real.placeholder || 'Anything worth knowing about the photo.' }),
      mine, h('div', { class: 'cardrow' }, place, dateMonth, dateFull, count)));
    show();
    // the site fills #fotodiv when a photo is chosen (and again when another is): the date buttons follow
    const photo = document.getElementById('fotodiv');
    if (photo) new MutationObserver(show).observe(photo, { childList: true, subtree: true, characterData: true });
    requestAnimationFrame(grow);
  }

  registerFeature({
    id: 'extra', label: 'Extra information box',
    init: () => { if (here.add) extraCard(); }
  });
  /* =====================================================================
   *  MEMBER SHORTCUTS  (the profiles of members you go to often, one click away)
   *    A shortcut is a member's picture and name; a click goes to the member's page (/user<id>). The list is yours (kept in the
   *    browser) and starts with you: the member who is logged in (read from the site's top bar) is always the first line, which
   *    cannot be moved or removed.
   *    Two ways of using it, so the everyday one stays clean:
   *      - looking: only the lines, nothing else. On a member's profile a star in the title saves that member (or takes them off);
   *        with more than eight members a box finds one by typing;
   *      - editing (the Edit button, Done to leave): each line gets a grip to drag it (a bar shows where it lands, never above you;
   *        or focus the grip and press Up / Down), a cross to remove it, and a box adds a member by number or by the link of
   *        their page (the page is read once, through the script's own queue, for the picture and the name).
   *    Your own picture is also in the panel's bar, under the logo, in a circle: a click goes to your page.
   *    The list is in the panel (Gallery drawer) and, on a member's profile, right on the site, to the LEFT of the content, level with
   *    the profile picture (the flags are on the right); on a narrower screen it moves under the picture, in the left column.
   * ===================================================================== */
  const MEMBERS_GAP = 16;
  const MEMBERS_MIN = 170;        // narrower than this, the list goes under the picture
  const MEMBERS_MAX = 300;
  const MEMBERS_FIND_FROM = 9;    // from this many members, a box to find one
  let membersEditing = false;     // editing or looking (the same in the panel and on the page)

  const membersGet = () => { try { const v = JSON.parse(store.get('members', '[]')); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const membersSet = list => store.set('members', JSON.stringify(list));

  // The member of a profile page (the page itself, or one fetched): its number, name and picture; null when it is not a profile
  function memberInfo(doc, id) {
    const name = doc.querySelector('.profile h1 a, .container.profile h1 a');
    const img = doc.querySelector('.profile-img');
    const small = doc.querySelector('.profile h1 small');
    const num = id || ((small && small.textContent.match(/ID:\s*(\d+)/)) || [])[1];
    if (!num || !name) return null;
    return { id: String(num), name: name.textContent.trim(), avatar: img ? img.getAttribute('src') || '' : '' };
  }

  // The number out of what the user typed: "121546", "user121546", or the link of the page
  const memberIdOf = text => ((String(text).trim().match(/^(?:.*\/)?(?:user)?(\d{1,9})\/?(?:[?#].*)?$/i)) || [])[1] || '';

  // ---- you: the logged-in member, from the first link of the site's top bar (/user<id>); the picture is kept from your own page
  let meAvatarAsked = false;
  function membersMe() {
    const link = document.querySelector('.header .topbar .loginbar a[href^="/user"]');
    const id = link && (link.getAttribute('href').match(/^\/user(\d+)/) || [])[1];
    if (!id) return null;
    let kept = {};
    try { kept = JSON.parse(store.get('members_me', '{}')); } catch (e) { /* none yet */ }
    const own = memberHere();
    const me = { id, name: link.textContent.trim(), avatar: (own && own.id === id ? own.avatar : kept.id === id ? kept.avatar : '') || '' };
    if (me.id !== kept.id || me.name !== kept.name || me.avatar !== kept.avatar) store.set('members_me', JSON.stringify(me));
    return me;
  }
  // Your own picture is only on your own page: read it once, in the background, when it is not known yet
  function membersMeAvatar(me) {
    if (!me || me.avatar || meAvatarAsked) return;
    meAvatarAsked = true;
    siteFetch('/user' + me.id).then(text => {
      const m = memberInfo(new DOMParser().parseFromString(text, 'text/html'), me.id);
      if (m && m.avatar) { store.set('members_me', JSON.stringify({ ...me, avatar: m.avatar })); membersRefresh(); }
    }).catch(() => { /* the line shows the initial instead */ });
  }

  // You first, then the members you added (you are not listed twice if you added yourself)
  function membersAll() {
    const me = membersMe();
    return { me, others: membersGet().filter(x => !me || x.id !== me.id) };
  }

  function memberAdd(m) {
    const list = membersGet().filter(x => x.id !== m.id);
    list.push(m);
    membersSet(list);
    membersRefresh();
  }
  function memberRemove(id) {
    membersSet(membersGet().filter(x => x.id !== id));
    membersRefresh();
  }
  // Moves a member to another place among the added ones (to: the index in that list)
  function memberMove(id, to) {
    const list = membersGet();
    const from = list.findIndex(x => x.id === id);
    if (from < 0) return;
    const [m] = list.splice(from, 1);
    list.splice(Math.max(0, Math.min(to, list.length)), 0, m);
    membersSet(list);
  }

  // The page we are on, when it is a profile
  const memberHere = () => (here.profile ? memberInfo(document, (location.pathname.match(/\d+/) || [])[0]) : null);

  // ---- the parts of the view
  function memberLine(m, me) {
    const initial = h('span', { class: 'mav', text: (m.name[0] || '?').toUpperCase() });
    const img = h('img', { src: m.avatar, alt: '', width: 40, height: 40 });
    img.addEventListener('error', () => img.replaceWith(initial));
    const now = memberHere();
    return h('a', { class: 'member' + (now && now.id === m.id ? ' on' : '') + (me ? ' me' : ''), href: `/user${m.id}`, title: m.name },
      m.avatar ? img : initial, h('span', { class: 'mname', text: m.name }), me ? h('span', { class: 'mtag', text: 'You' }) : null);
  }

  // The lines. Looking: links only. Editing: a grip and a cross on each added member, and the lines can be dragged.
  function membersLines(where, others, me, filter) {
    const box = h('div', { class: 'members', 'data-where': where });
    if (me) box.append(h('div', { class: 'mrow pinned', 'data-id': me.id }, membersEditing ? h('span', { class: 'grip off', title: 'You are always first' }) : null, memberLine(me, true)));
    others.filter(m => !filter || m.name.toLowerCase().includes(filter)).forEach(m => {
      const i = others.indexOf(m);
      const row = h('div', { class: 'mrow', 'data-id': m.id }, memberLine(m, false));
      if (membersEditing) {
        const grip = h('button', { type: 'button', class: 'grip', title: 'Drag to move (or press the Up and Down arrows here)', text: '⋮⋮' });
        grip.addEventListener('keydown', e => {
          if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
          e.preventDefault();
          memberMove(m.id, i + (e.key === 'ArrowUp' ? -1 : 1));
          membersRefresh(where, m.id);
        });
        row.prepend(grip);
        row.append(h('button', { type: 'button', class: 'iconbtn', title: 'Remove ' + m.name, text: '×', onclick: () => memberRemove(m.id) }));
        row.draggable = true;
        row.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', m.id); e.dataTransfer.effectAllowed = 'move'; row.classList.add('dragging'); });
        row.addEventListener('dragend', () => box.querySelectorAll('.dragging, .before, .after').forEach(x => x.classList.remove('dragging', 'before', 'after')));
      }
      box.append(row);
    });
    if (membersEditing) {
      // dropping: the line goes before or after the one under the pointer, by the half of it the pointer is in; never above you
      box.addEventListener('dragover', e => {
        const over = e.target.closest && e.target.closest('.mrow');
        if (!over || !box.querySelector('.dragging')) return;
        e.preventDefault();
        box.querySelectorAll('.before, .after').forEach(x => x.classList.remove('before', 'after'));
        const r = over.getBoundingClientRect();
        over.classList.add(!over.classList.contains('pinned') && e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      });
      box.addEventListener('drop', e => {
        const over = e.target.closest && e.target.closest('.mrow');
        const id = e.dataTransfer.getData('text/plain');
        if (!over || !id) return;
        e.preventDefault();
        const list = membersAll().others;
        const target = list.findIndex(x => x.id === over.dataset.id);              // -1 when it is you: the first place
        const from = list.findIndex(x => x.id === id);
        if (from < 0) return;
        let to = target < 0 ? 0 : target + (over.classList.contains('after') ? 1 : 0);
        if (from < to) to -= 1;                                                     // the line leaves its place before it lands
        memberMove(id, to);
        membersRefresh();
      });
    }
    return box;
  }

  // Add by number or link (editing only)
  function membersAddBox() {
    const input = h('input', { type: 'text', placeholder: 'Number or link' });
    const msg = h('p', { class: 'presult', hidden: true });
    const say = (text, warn) => { msg.hidden = !text; msg.textContent = text || ''; msg.className = 'presult' + (warn ? ' warn' : ''); };
    const go = async () => {
      const id = memberIdOf(input.value);
      const { me } = membersAll();
      if (!id) { say('Type the number of the member (121546) or the link of the page.', true); return; }
      if ((me && me.id === id) || membersGet().some(x => x.id === id)) { say('This member is already in the list.'); return; }
      say('Reading the page…');
      try {
        const doc = new DOMParser().parseFromString(await siteFetch('/user' + id), 'text/html');
        const m = memberInfo(doc, id);
        if (!m) { say('No member with this number.', true); return; }
        memberAdd(m);                                                                // the view is drawn again: this box with it
      } catch (e) { say('Could not read the page: ' + e.message + '.', true); }
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    return h('div', { class: 'membersadd' }, h('div', { class: 'addrow' }, input, h('button', { type: 'button', class: 'btn ghost fit', text: 'Add', onclick: go })), msg);
  }

  // The whole view: the buttons of the title line, the lines, the box to add (editing), the hint
  function membersView(where) {
    const { me, others } = membersAll();
    membersMeAvatar(me);
    const now = memberHere();
    const here_ = now && !(me && me.id === now.id) ? now : null;                        // not offered on your own page
    const saved = !!(here_ && membersGet().some(x => x.id === here_.id));
    const star = here_ ? h('button', { type: 'button', class: 'iconbtn star' + (saved ? ' on' : ''), text: saved ? '★' : '☆',
      title: saved ? `Take ${here_.name} off the shortcuts` : `Save ${here_.name} in the shortcuts`, onclick: () => (saved ? memberRemove(here_.id) : memberAdd(here_)) }) : null;
    const edit = h('button', { type: 'button', class: 'btn ghost sm', text: membersEditing ? 'Done' : 'Edit', title: membersEditing ? 'Leave editing' : 'Reorder, remove or add members',
      onclick: () => { membersEditing = !membersEditing; membersRefresh(); } });
    const head = h('div', { class: 'mhead' }, where === 'bar' ? h('span', { class: 't', text: 'Member shortcuts' }) : h('span', { class: 'mute', text: others.length ? `${others.length} saved` : '' }),
      h('span', { class: 'mactions' }, star, edit));
    const kids = [head];
    if (!membersEditing && others.length >= MEMBERS_FIND_FROM) {
      const find = h('input', { type: 'text', placeholder: 'Find a member…' });
      const lines = h('div', { class: 'mlines' }, membersLines(where, others, me, ''));
      find.addEventListener('input', () => lines.replaceChildren(membersLines(where, others, me, find.value.trim().toLowerCase())));
      kids.push(find, lines);
    } else kids.push(membersLines(where, others, me, ''));
    if (!others.length) kids.push(h('p', { class: 'hint', text: here_ ? 'Press the star to save this member.' : 'Open a member’s page and press the star, or press Edit to add one by number.' }));
    if (membersEditing) kids.push(membersAddBox());
    return kids.filter(Boolean);                                                            // replaceChildren would write a null as the word "null"
  }

  // ---- the bar on a profile page, to the left of the content
  const MEMBERS_CSS = `
    :host{display:block}
    .box{background:#fff;border:1px solid var(--line);padding:12px;display:flex;flex-direction:column;gap:12px}
    .t{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--primary-h)}
    .members,.mlines{max-height:60vh;overflow-y:auto}
  `;
  function membersBar() {
    const host = h('div', { id: 'pmg-members' });
    const root = host.attachShadow({ mode: 'open' });
    root.append(h('style', { text: UI_BASE + MEMBERS_CSS }), h('div', { class: 'box' }, membersView('bar')));
    return host;
  }

  // Your own picture in the panel's bar, under the logo: a circle, and a click goes to your page (nothing when nobody is logged in)
  function membersRail() {
    const rail = $('rail');
    const old = rail.querySelector('.rme');
    if (old) old.remove();
    const { me } = membersAll();
    if (!me) return;
    const initial = h('span', { text: (me.name[0] || '?').toUpperCase() });
    const img = h('img', { src: me.avatar, alt: '' });
    img.addEventListener('error', () => img.replaceWith(initial));
    const own = memberHere();
    rail.querySelector('.logo').after(h('a', { class: 'rme' + (own && own.id === me.id ? ' on' : ''), href: `/user${me.id}`, title: `${me.name} (your page)` }, me.avatar ? img : initial));
  }

  // Everything that shows the list follows a change (the panel and the bar). focus: a member whose grip gets the keyboard focus back
  function membersRefresh(where, focus) {
    membersRail();
    const host = document.getElementById('pmg-members');
    if (host) host.shadowRoot.querySelector('.box').replaceChildren(...membersView('bar'));
    const slot = $('membersPanel');
    if (slot) slot.replaceChildren(...membersView('panel'));
    if (focus) {
      const root = where === 'bar' && host ? host.shadowRoot : slot;
      const grip = root && root.querySelector(`.mrow[data-id="${focus}"] .grip`);
      if (grip) grip.focus();
    }
  }

  // To the left of the content when there is room, else under the picture
  function membersPlace() {
    const host = document.getElementById('pmg-members');
    if (!host) return;
    const content = document.querySelector('.container.content, .content .container') || document.querySelector('.container');
    const left = content ? content.getBoundingClientRect().left : 0;
    const room = left - 2 * MEMBERS_GAP;
    if (room >= MEMBERS_MIN) {
      const width = Math.min(room, MEMBERS_MAX);
      const top = (content || document.body).getBoundingClientRect().top + window.scrollY;
      if (host.parentNode !== document.body) document.body.appendChild(host);
      host.style.cssText = `position:absolute;z-index:50;top:${Math.max(0, top)}px;left:${left + window.scrollX - MEMBERS_GAP - width}px;width:${width}px`;
    } else {
      const side = content && content.querySelector('.col-md-3');
      host.style.cssText = 'position:static;margin-top:10px';
      if (side) side.insertBefore(host, document.getElementById('pmg-flags') || null);
      else if (content) content.insertBefore(host, content.firstChild);
      else document.body.appendChild(host);
    }
  }

  registerFeature({
    id: 'members', label: 'Member shortcuts',
    groups: [{
      drawer: 'gallery', title: 'Member shortcuts',
      build: () => [h('div', { id: 'membersPanel', class: 'members-panel' }, membersView('panel'))]
    }],
    init: () => {
      const now = memberHere();
      if (now && membersGet().some(x => x.id === now.id)) membersSet(membersGet().map(x => (x.id === now.id ? now : x)));   // the picture and the name may have changed
      membersRefresh();
      if (!here.profile) return;
      document.body.appendChild(membersBar());
      membersPlace();
      window.addEventListener('resize', membersPlace);
      window.addEventListener('load', membersPlace);
    }
  });
  /* =====================================================================
   *  FLOATING UPLOAD BUTTON  (the form is long: the Upload button follows you while it is out of view)
   *    The site's Upload button is at the very end of a long form (plate, photo, vehicle, extra information, tags). While it is not on
   *    the screen, a button of ours stands at the bottom of the window; it presses the site's own button, so the form's own checks and
   *    options ("upload in a new tab") apply exactly as before. When the real button comes into view, ours goes away.
   * ===================================================================== */
  function uploadButton() {
    const form = document.getElementById('frm');
    return form && form.querySelector('button[type="submit"], input[type="submit"]');
  }

  function floatingUpload() {
    const real = uploadButton();
    if (!real || document.getElementById('pmg-upload-fab')) return;
    const host = h('div', { id: 'pmg-upload-fab', hidden: true });
    host.style.cssText = 'position:fixed;z-index:60;bottom:16px;left:16px';
    const root = host.attachShadow({ mode: 'open' });
    root.append(h('style', { text: UI_BASE + '.btn{box-shadow:0 4px 14px rgba(0,0,0,.25)}' }),
      h('button', { type: 'button', class: 'btn lg', text: 'Upload', title: 'Presses the Upload button of the form', onclick: () => real.click() }));
    document.body.appendChild(host);
    // out of view = ours is shown (a button under the fold, or above it after a scroll)
    const place = () => {
      const content = document.querySelector('.content .container, .container.content') || document.querySelector('.container');
      const left = content ? Math.max(16, Math.round(content.getBoundingClientRect().left)) : 16;
      host.style.left = left + 'px';
    };
    const watch = new IntersectionObserver(entries => { host.hidden = entries[entries.length - 1].isIntersecting; }, { threshold: 0.2 });
    watch.observe(real);
    place();
    window.addEventListener('resize', place);
  }

  registerFeature({
    id: 'floatupload', label: 'Floating upload button',
    init: () => { if (here.add) floatingUpload(); }
  });
  /* =====================================================================
   *  PLATE LOOKUP LINKS  (the plate you type, one click from the public pages that know it)
   *    For the plate the form reads (src/lib/plate), a link to each public lookup site of the country (src/lib/lookups.js), and to
   *    a picture search. They are plain links that open in a new tab: nothing is sent anywhere before a click. They are in the
   *    plate card above the vehicle menus and in the Search drawer. In Settings each site can be hidden.
   * ===================================================================== */
  const lookupHidden = () => new Set((store.get('lookup_hidden', '') || '').split(',').filter(Boolean));

  // The links for a plate, minus the sites the user hid; null when there is no plate or nothing to show
  function lookupLinks(plate) {
    if (!plate || !featureOn('lookup')) return null;
    const hidden = lookupHidden();
    const sites = lookupFor(here.country, plate).filter(s => !hidden.has(s.key));
    if (!sites.length) return null;
    return h('div', { class: 'lookups' }, h('div', { class: 'cat', text: 'Look up this plate' }),
      h('div', { class: 'pills' }, sites.map(s => h('a', { class: 'pill', href: s.href, target: '_blank', rel: 'noopener noreferrer', text: s.name, title: 'Opens ' + s.name + ' in a new tab' }))));
  }

  // The drawer shows the same links, for the plate of the form
  function lookupRefresh(plate) {
    const box = $('lookupBox');
    if (!box) return;
    box.replaceChildren(...[lookupLinks(plate) || h('p', { class: 'presult', text: plate ? 'No lookup site for this country.' : 'Type the plate in the form to see the sites.' })]);
  }

  // Settings: a box per site, to hide the ones that are of no use (a site that failed, or that you never open)
  function lookupPicker() {
    const hidden = lookupHidden();
    const save = () => store.set('lookup_hidden', [...hidden].join(','));
    const rows = [];
    for (const cc of Object.keys(LOOKUP_SITES)) {
      const country = cc === '*' ? 'Every country' : cName(cc);
      for (const s of LOOKUP_SITES[cc]) {
        const key = cc + '|' + s.name;
        const box = h('input', { type: 'checkbox', checked: !hidden.has(key) });
        box.onchange = () => { box.checked ? hidden.delete(key) : hidden.add(key); save(); checkPlate(true); };                                  // the plate is checked again (from the cache: no request) and both places redraw
        rows.push(h('label', { class: 'chk' }, box, h('span', { text: s.name }), h('span', { class: 'mute', text: ' · ' + country })));
      }
    }
    return h('div', { class: 'pickrows' }, rows);
  }

  registerFeature({
    id: 'lookup', label: 'Plate lookup links',
    groups: [{
      drawer: 'search', title: 'Look up the plate', pages: ['add'],
      build: () => [h('div', { id: 'lookupBox' })]
    }, {
      drawer: 'settings', title: 'Lookup sites',
      build: () => [h('p', { class: 'presult', text: 'Untick the sites you never use. They are only links: nothing is sent before you click.' }), lookupPicker()]
    }],
    init: () => lookupRefresh(plateForForm())
  });
  /* =====================================================================
   *  PROFILE: THE REAL UPLOADS  (a member's profile page)
   *    The "uploaded" figure of a profile is a statistic the site recalculates from time to time, and its (+n) runs since that
   *    last calculation, not since today. The gallery of the member is always live, so the card asks it twice: the whole gallery
   *    (the real total) and the day (from 03:30 local time, when the site's day starts, to 03:30 the next day), and shows both
   *    next to the figure of the profile, with the difference. Two requests through the shared queue (src/lib/http.js).
   * ===================================================================== */
  const DAY_STARTS = { h: 3, m: 30 };

  // The site's date format in a search: MM/DD/YYYY HH:MM:00 in local time (the page sends tz_offset with it)
  const profileDate = d => {
    const p = n => String(n).padStart(2, '0');
    return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:00`;
  };

  // The day now in force: [start, end) with start the last 03:30 that has passed
  function profileDay(now) {
    const start = new Date(now);
    start.setHours(DAY_STARTS.h, DAY_STARTS.m, 0, 0);
    if (now < start) start.setDate(start.getDate() - 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  // The address of the member's gallery, whole or for the day
  function profileGallery(id, day) {
    if (!day) return `/gallery.php?usr=${id}`;
    return `/gallery.php?usr=${id}&tz_offset=${day.start.getTimezoneOffset()}&date1=${encodeURIComponent(profileDate(day.start))}&date2=${encodeURIComponent(profileDate(day.end))}`;
  }

  // The count a gallery page announces ("License plates found N")
  async function profileCount(url) {
    const doc = new DOMParser().parseFromString(await siteFetch(url), 'text/html');
    const num = doc.querySelector('.breadcrumbs h1 b');
    if (!num || !/^\s*\d+\s*$/.test(num.textContent)) throw new Error('no count on the page');
    return +num.textContent;
  }

  const profileNumber = text => +String(text).replace(/\D/g, '') || 0;
  const profileFormat = n => n.toLocaleString('en').replace(/,/g, ' ');

  function profileCard() {
    const link = document.querySelector('.service-block-v3 .counter a[href*="usr="]');
    const id = (location.pathname.match(/\/user(\d+)/) || [])[1];
    const anchor = document.querySelector('.service-block-v3');
    const card = id && link && anchor && inlineCard({ id: 'pmg-profile-card', title: 'Uploads', after: anchor, closable: false });
    if (!card) return;
    const shown = profileNumber(link.textContent);
    card.message('Counting the gallery…');
    const day = profileDay(new Date());
    Promise.all([profileCount(profileGallery(id)), profileCount(profileGallery(id, day))]).then(([total, today]) => {
      card.message('');
      card.clear();
      const gap = total - shown;
      const at = `${String(DAY_STARTS.h).padStart(2, '0')}:${String(DAY_STARTS.m).padStart(2, '0')}`;
      card.body.append(h('div', { class: 'cardbox' },
        h('div', { class: 'stats' },
          h('div', { class: 'stat' }, h('b', { text: profileFormat(total) }), h('span', { class: 'mute', text: 'photos in the gallery now' })),
          h('div', { class: 'stat' }, h('b', { text: '+' + today }), h('span', { class: 'mute', text: `today (since ${at})` }))),
        h('p', { class: 'hint', text: gap === 0 ? 'The profile figure is up to date.' : `The profile says ${profileFormat(shown)}: ${Math.abs(gap)} ${gap > 0 ? 'more' : 'fewer'} in the gallery, the site has not recalculated yet.` }),
        h('div', { class: 'cardrow' }, h('a', { class: 'btn ghost sm', href: profileGallery(id, day), target: '_blank', rel: 'noopener noreferrer', text: 'See today’s photos' }))));
    }).catch(e => card.message('Not counted: ' + e.message));
  }

  registerFeature({
    id: 'profile', label: 'Profile: real uploads',
    init: () => { if (here.profile) profileCard(); }
  });
  /* =====================================================================
   *  YOUR PHOTOS OF THIS VEHICLE  (upload page, under the brand / model / generation menus)
   *    Whatever the menus hold, however it got there (you, the plate check, Lens), the card says how many photos of that brand,
   *    that model and that generation you already have on the site, each number a link to those photos. The count is the one the
   *    site announces for your gallery filtered on the vehicle (gallery.php?usr=<you>&markaavto=&model=&modgen=), asked through the
   *    shared queue, the most precise level first, and kept for the visit: choosing the same vehicle again asks nothing.
   * ===================================================================== */
  const mineCache = new Map();      // address -> count

  // The menus now: [{ label, url }] from the most precise level that is chosen up to the brand; [] when no brand
  function mineLevels(me) {
    const menus = vehicleMenus(), values = vehicleCurrent();
    const chosen = values.map(v => (+v > 0 && +v !== 200 ? v : ''));
    if (!chosen[0]) return [];
    const names = menus.map(el => (el && el.selectedOptions[0] ? el.selectedOptions[0].textContent.trim() : ''));
    const keys = ['markaavto', 'model', 'modgen'];
    const levels = [];
    for (let i = 0; i < 3; i++) {
      if (!chosen[i]) break;
      levels.unshift({ name: names[i], key: keys[i],
        url: `/gallery.php?usr=${me}&` + keys.slice(0, i + 1).map((k, j) => `${k}=${chosen[j]}`).join('&') });
    }
    return levels;
  }

  async function mineCount(url) {
    if (mineCache.has(url)) return mineCache.get(url);
    const n = await profileCount(url);                                        // 76-profile.js: the count a gallery page announces
    mineCache.set(url, n);
    return n;
  }

  function mineCard(me) {
    const row = document.querySelector('.pm-vehicle-fields-row');
    const card = row && inlineCard({ id: 'pmg-mine-card', title: 'Your photos', after: row, closable: false });
    if (!card) return;
    card.host.hidden = true;
    let shown = '', run = 0;
    const draw = () => {
      const levels = mineLevels(me), sig = levels.map(l => l.url).join('|');
      if (sig === shown) return;
      shown = sig;
      const mine = ++run;                                                      // a newer choice drops the answers still coming
      card.host.hidden = !levels.length;
      card.clear();
      if (!levels.length) return;
      const where = { markaavto: 'brand', model: 'model', modgen: 'generation' };
      const items = levels.map(l => {
        const num = h('a', { class: 'mine-n', href: l.url, target: '_blank', rel: 'noopener noreferrer', text: '…', title: 'Opens your photos of this in a new tab' });
        return { l, num, el: h('div', { class: 'stat' }, num, h('span', { class: 'mute', text: `${where[l.key]}: ${l.name}` })) };
      });
      card.message('');
      card.body.append(h('div', { class: 'cardbox' }, h('div', { class: 'stats' }, items.map(i => i.el))));
      (async () => {
        for (const i of items) {
          try {
            const n = await mineCount(i.l.url);
            if (mine !== run) return;
            i.num.textContent = String(n);
            i.num.classList.toggle('zero', n === 0);
          } catch (e) { if (mine === run) card.message('Not counted: ' + e.message); return; }
        }
      })();
    };
    // the menus change by the site's own script, by the plate check and by Lens: a short look at them, and the events, cover all three
    let timer = 0;
    const soon = () => { clearTimeout(timer); timer = setTimeout(draw, 500); };
    vehicleMenus().forEach(el => el && el.addEventListener('change', soon));
    setInterval(soon, 1500);
    draw();
  }

  registerFeature({
    id: 'mine', label: 'Your photos of this vehicle',
    init: () => {
      if (!here.add) return;
      const me = membersMe();                                                 // 73-members.js: the logged-in member
      if (me) mineCard(me.id);
    }
  });
  /* =====================================================================
   *  PROFILE: REGIONS  (a member's profile page)
   *    How many regions (departments, districts, states...) of a country a member has a photo from, and which ones are missing.
   *    The site has the figures on userreg.php?gallery=<system>-<id>: one table row per region, the photo count a link when the
   *    member has some (a dash when not), and a menu listing every system of every country, so nothing is listed here: the first
   *    page asked gives the menu, the member picks a system, and each system is asked once (nothing on loading the profile).
   * ===================================================================== */
  const regionsCache = new Map();      // system -> parsed page

  // What a userreg page holds: the systems of its menu and the rows of its table (the region code is empty for the line that
  // gathers photos without a region)
  function regionsParse(doc) {
    const systems = [...doc.querySelectorAll('select[name="gallery"] option')].map(o => ({ code: o.value.replace(/-\d+$/, ''), name: o.textContent.trim(), selected: o.hasAttribute('selected') }));
    const rows = [...doc.querySelectorAll('#example tbody tr')].map(tr => {
      const td = tr.querySelectorAll('td'), link = td[4] && td[4].querySelector('a');
      return td.length >= 5 ? { code: td[2].textContent.trim(), name: td[3].textContent.trim(), count: link ? profileNumber(link.textContent) : 0, href: link ? link.getAttribute('href') : '' } : null;
    }).filter(Boolean);
    return { systems, rows };
  }

  // The figures of a table: regions with a code are the ones to collect; photos with no region count in the photos only
  function regionsFigures(rows) {
    const regions = rows.filter(r => r.code);
    const seen = regions.filter(r => r.count > 0).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const missing = regions.filter(r => !r.count);
    const photos = rows.reduce((sum, r) => sum + r.count, 0);
    return { total: regions.length, seen, missing, photos, percent: regions.length ? Math.round(seen.length * 100 / regions.length) : 0 };
  }

  async function regionsAsk(system, id) {
    if (regionsCache.has(system)) return regionsCache.get(system);
    const page = regionsParse(new DOMParser().parseFromString(await siteFetch(`/userreg.php?gallery=${system}-${id}`), 'text/html'));
    if (!page.rows.length && !page.systems.length) throw new Error('no region table on the page');
    regionsCache.set(system, page);
    return page;
  }

  function regionsCard() {
    const id = (location.pathname.match(/\/user(\d+)/) || [])[1];
    const anchor = document.getElementById('pmg-profile-card') || document.querySelector('.service-block-v3');
    const card = id && anchor && inlineCard({ id: 'pmg-regions-card', title: 'Regions', after: anchor, closable: false });
    if (!card) return;
    const globe = document.querySelector('a[href^="/userreg.php?gallery="]');       // the site's own link: the system it starts from
    const first = (globe && (globe.getAttribute('href').match(/gallery=([a-z0-9]+)-/) || [])[1]) || '';
    let menu = null, run = 0;

    const start = h('button', { type: 'button', class: 'btn ghost sm', text: 'Show the regions of a country', onclick: () => { start.disabled = true; show(first || 'fr1'); } });
    card.body.append(h('div', { class: 'cardbox' }, h('p', { class: 'hint', text: 'Which regions of a country you have photos from, and which are missing.' }), h('div', { class: 'cardrow' }, start)));

    async function show(system) {
      const mine = ++run;
      card.message('Reading the regions…');
      let page;
      try { page = await regionsAsk(system, id); } catch (e) { if (mine === run) { card.message('Not read: ' + e.message); start.disabled = false; } return; }
      if (mine !== run) return;
      card.message('');
      if (!menu && page.systems.length) {
        menu = h('select', { 'aria-label': 'Country' }, page.systems.map(s => h('option', { value: s.code, text: s.name })));
        menu.onchange = () => show(menu.value);
      }
      if (menu) menu.value = system;
      const f = regionsFigures(page.rows);
      card.clear();
      card.body.append(h('div', { class: 'cardbox' },
        menu ? h('div', { class: 'cardrow' }, menu) : null,
        f.total ? h('div', null,
          h('div', { class: 'stats' },
            h('div', { class: 'stat' }, h('b', { text: `${f.seen.length} / ${f.total}` }), h('span', { class: 'mute', text: `regions (${f.percent}%)` })),
            h('div', { class: 'stat' }, h('b', { text: String(f.photos) }), h('span', { class: 'mute', text: 'photos' }))),
          h('div', { class: 'track', role: 'img', 'aria-label': `${f.percent}% of the regions` }, h('div', { class: 'fill', style: `width:${f.percent}%` })))
          : h('p', { class: 'hint', text: 'This country has no regions to collect.' }),
        f.seen.length ? h('div', { class: 'pills' }, f.seen.map(r => h('a', { class: 'pill', href: r.href, target: '_blank', rel: 'noopener noreferrer', text: `${r.code ? r.code + ' ' : ''}${r.name} · ${r.count}`, title: 'Opens your photos of this region in a new tab' }))) : null,
        f.missing.length && f.seen.length ? h('details', { class: 'missing' }, h('summary', { text: `${f.missing.length} missing` }), h('p', { class: 'hint', text: f.missing.map(r => `${r.code ? r.code + ' ' : ''}${r.name}`).join(' · ') })) : null));
    }
  }

  registerFeature({
    id: 'regions', label: 'Profile: regions',
    init: () => { if (here.profile) regionsCard(); }
  });
  /* =====================================================================
   *  SERIES  (the letters around the digits of a plate: HF-137-QQ is in the series HF-*-QQ)
   *    Two places:
   *    - the plate card of the upload page: how many photos of the series of the plate you already have (the site's quick search,
   *      gallery.php?fastsearch=HF * QQ&usr=<you>, one request through the shared queue, kept for the visit);
   *    - a series page of the site (/fr/series-HF-QQ-1, the 999 numbers of a series): how many numbers are on the site, which
   *      ones, and how many photos of the series you have.
   *    Only the countries whose plates and series pages were checked on the real site are listed in SERIES.
   * ===================================================================== */
  // country -> how the plate gives its series: the two groups of letters around the digits
  const SERIES = { fr: /^([A-Z]{2})[\s-]\d{3}[\s-]([A-Z]{2})$/ };
  const seriesCache = new Map();      // address -> count

  // { letters: ['HF', 'QQ'], query: 'HF * QQ', label: 'HF-*-QQ' } for a plate of a listed country, else null
  function seriesOf(cc, plate) {
    const m = SERIES[cc] && SERIES[cc].exec(String(plate).toUpperCase());
    return m ? { query: `${m[1]} * ${m[2]}`, label: `${m[1]}-*-${m[2]}` } : null;
  }

  const seriesGallery = (cc, query, me) => `/${cc}/gallery.php?fastsearch=${encodeURIComponent(query)}&usr=${me}`;

  async function seriesMine(url) {
    if (seriesCache.has(url)) return seriesCache.get(url);
    const n = await profileCount(url);                                       // 76-profile.js: the count a gallery page announces
    seriesCache.set(url, n);
    return n;
  }

  // The line of the plate card; it fills itself when the count comes. null when the plate has no series or you are not known
  function seriesLine(plate) {
    const me = membersMe(), series = featureOn('series') && me && seriesOf(here.country, plate);
    if (!series) return null;
    const url = seriesGallery(here.country, series.query, me.id);
    const num = h('a', { class: 'mine-n', href: url, target: '_blank', rel: 'noopener noreferrer', text: '…', title: 'Opens your photos of this series in a new tab' });
    const line = h('div', { class: 'stat' }, num, h('span', { class: 'mute', text: `your photos in the series ${series.label}` }));
    seriesMine(url).then(n => { num.textContent = String(n); }, e => { line.replaceChildren(h('span', { class: 'mute', text: 'Series not counted: ' + e.message })); });
    return h('div', { class: 'stats' }, line);
  }

  // A series page: the numbers on the site are the cells with a photo (the others offer to upload that number)
  function seriesPage() {
    const m = location.pathname.match(/^\/([a-z]{2})\/series-([A-Z]{2})-([A-Z]{2})-\d+/i);
    const table = document.querySelector('table.table-condensed');
    const card = m && table && inlineCard({ id: 'pmg-series-card', title: `Series ${m[2].toUpperCase()}-*-${m[3].toUpperCase()}`, before: table, closable: false });
    if (!card) return;
    const cells = [...table.querySelectorAll('td')], present = cells.filter(td => td.querySelector('a[href*="/nomer"]'));
    const numbers = present.map(td => ({ n: td.textContent.trim(), href: td.querySelector('a[href*="/nomer"]').getAttribute('href') })).sort((a, b) => a.n.localeCompare(b.n));
    const mine = h('a', { class: 'mine-n', text: '…' });
    const me = membersMe();
    card.body.append(h('div', { class: 'cardbox' },
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', { text: `${present.length} / ${cells.length}` }), h('span', { class: 'mute', text: 'numbers on the site' })),
        me ? h('div', { class: 'stat' }, mine, h('span', { class: 'mute', text: 'your photos in this series' })) : null),
      present.length ? h('div', { class: 'pills' }, numbers.map(x => h('a', { class: 'pill', href: x.href, text: x.n, title: 'Opens the photo' }))) : h('p', { class: 'hint', text: 'No number of this series is on the site yet.' })));
    if (me) {
      const url = seriesGallery(m[1].toLowerCase(), `${m[2].toUpperCase()} * ${m[3].toUpperCase()}`, me.id);
      mine.href = url; mine.target = '_blank'; mine.rel = 'noopener noreferrer';
      seriesMine(url).then(n => { mine.textContent = String(n); }, e => { card.message('Not counted: ' + e.message); });
    }
  }

  registerFeature({
    id: 'series', label: 'Series counter',
    init: () => { if (/\/series-[A-Z]{2}-[A-Z]{2}-\d+/i.test(location.pathname) && featureOn('series')) seriesPage(); }
  });
  /* =====================================================================
   *  OFFICIAL REGISTER  (plate card of the upload page, for the countries of src/lib/registries.js)
   *    A button asks the open register of the country about the plate (make, model, year, colour, end of the inspection) and shows
   *    the answer; where the make is written in the alphabet of the menus, "Fill the menus" compares it with them like Lens does.
   *    The plate is sent to that register only when the button is clicked, and the answer is kept for the visit.
   * ===================================================================== */
  const registryCache = new Map();      // address -> facts (or null when the register has no such plate)

  async function registryAsk(reg, plate) {
    const url = reg.url(plate);
    if (registryCache.has(url)) return registryCache.get(url);
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error('the register answered ' + res.status);
      const facts = reg.read(await res.json());
      registryCache.set(url, facts);
      return facts;
    } finally { clearTimeout(timer); }
  }

  // The first choice of each menu for the text of the answer, or [] when the menus do not know the make
  function registryPath(facts) {
    const rows = vehicleGuess([`${facts.make} ${facts.model} ${facts.year}`], vehicleData());
    const path = [];
    for (const r of rows) { if (!r.candidates[0]) break; path.push(r.candidates[0].id); }
    return path;
  }

  // The block of the plate card; null when the country has no register, the plate is not of its shape or the feature is off
  function registryLine(plate) {
    const reg = REGISTRIES[here.country];
    const asked = reg && featureOn('registry') && reg.plate(plate);
    if (!asked) return null;
    const out = h('div', { class: 'cardrow' });
    const ask = h('button', { type: 'button', class: 'btn ghost sm', text: `Ask ${reg.name}`, title: 'Sends this plate to that open register', onclick: async () => {
      ask.disabled = true;
      out.replaceChildren(h('span', { class: 'mute', text: 'Asking…' }));
      try {
        const facts = await registryAsk(reg, asked);
        if (!facts) { out.replaceChildren(h('span', { class: 'mute', text: 'No such plate in that register.' })); return; }
        const path = registryPath(facts);
        const text = [facts.make, facts.model, facts.year, facts.colour, facts.until ? 'inspection until ' + facts.until : ''].filter(Boolean).join(' · ');
        out.replaceChildren(h('b', { text }), path.length ? h('button', { type: 'button', class: 'btn sm', text: 'Fill the menus', onclick: () => vehicleFill(path) }) : null);
      } catch (e) { out.replaceChildren(h('span', { class: 'mute', text: 'Not read: ' + (e.name === 'AbortError' ? 'no answer in 15 s' : e.message) })); ask.disabled = false; }
    } });
    return h('div', { class: 'cardrow' }, ask, out);
  }

  registerFeature({ id: 'registry', label: 'Official register (NL, IL)', init: () => {} });
  /* =====================================================================
   *  BATCH UPLOAD
   *  U opens a window: add photos (or a folder), click photos to select them (blue), give the selection a
   *  country. "Start uploading" then opens ONE NEW TAB PER PHOTO, spaced out by a delay (Cloudflare-friendly).
   *  Each tab opens that country's /xx/add page, puts its photo in the form and opens the site's own
   *  "Upload through editor". You still crop / retouch / press Add / type the plate / send yourself.
   *  The photos live in IndexedDB (the files themselves) so every tab can read them; the original file
   *  is what gets uploaded, the previews are only for the window.
   * ===================================================================== */

  // ---- storage of the queue (IndexedDB: holds the photo files themselves) ----
  let _db = null;
  const idbOpen = () => _db ? Promise.resolve(_db) : new Promise((res, rej) => {
    const r = indexedDB.open('pmg-batch', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('q', { keyPath: 'id' });
    r.onsuccess = () => { _db = r.result; res(_db); };
    r.onerror = () => rej(r.error);
  });
  const idbDo = async (mode, fn) => {
    const db = await idbOpen();
    return new Promise((res, rej) => {
      const t = db.transaction('q', mode), r = fn(t.objectStore('q'));
      t.oncomplete = () => res(r && r.result);
      t.onerror = t.onabort = () => rej(t.error);
    });
  };
  const qAll = () => idbDo('readonly', s => s.getAll()).then(a => (a || []).sort((x, y) => x.order - y.order));
  const qGet = id => idbDo('readonly', s => s.get(id));
  const qPut = it => idbDo('readwrite', s => s.put(it));
  const qDel = id => idbDo('readwrite', s => s.delete(id));
  const qClear = () => idbDo('readwrite', s => s.clear());

  // ---- run state of THIS tab (sessionStorage): { active, current, pendingSubmit, ts } ----
  // Every tab opened by "Start uploading" works on its own photo
  const getBatch = () => { try { return JSON.parse(sessionStorage.getItem('pmg_batch') || 'null'); } catch (e) { return null; } };
  const setBatch = b => { try { sessionStorage.setItem('pmg_batch', b ? JSON.stringify(b) : 'null'); } catch (e) {} };

  let queue = [];
  const sel = new Set();   // photos picked in the manager (shown in blue)
  let managerOpen = false, lastIdx = -1;
  const loadMine = () => { try { const a = JSON.parse(store.get('mine', 'null')); if (Array.isArray(a) && a.length) return a; } catch (e) {} return ['lu', 'de', 'fr']; };
  let mine = loadMine();
  let brush = store.get('brush', '');
  if (!brush || !mine.includes(brush)) brush = mine[0];

  const isOpenable = q => q.status === 'pending' || q.status === 'opened';           // can be (re)loaded into an upload tab
  const isFinished = q => q.status === 'done' || q.status === 'submitted';
  const pl = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const readyCount = () => queue.filter(q => q.status === 'pending' && q.country).length;

  // ---- plate categories of each country (learned from that country's own /xx/add page) ----
  // A failed or Cloudflare-blocked load is NOT remembered as "no categories": it is tried again after a cooldown.
  const catsCache = {}; // code -> undefined (unknown) | null (loading, so callers share one request) | [{v,l}]
  const catsFailedAt = {}; // code -> time of the last failed try
  async function ensureCats(code) {
    if (!code || catsCache[code] !== undefined) return;
    if (catsFailedAt[code] && Date.now() - catsFailedAt[code] < 60000) return;
    try { const s = store.get('cats_' + code, ''); if (s) { catsCache[code] = JSON.parse(s); return; } } catch (e) {}
    catsCache[code] = null;
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 10000); // never wait forever
    try {
      const res = await fetch('/' + code + '/add', { credentials: 'same-origin', signal: ctrl.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const page = new DOMParser().parseFromString(await res.text(), 'text/html');
      const sel = page.querySelector('select[name="ctype"], select[name="drop_2"]');   // Andorra and Malta call the menu drop_2
      // the Netherlands has an upload form but no type menu: nothing to choose, which is not an error
      if (!sel && !page.getElementById('frm')) throw new Error('no category list on the page (Cloudflare check?)');
      catsCache[code] = sel ? [...sel.options].map(o => ({ v: o.value, l: o.textContent.trim() })) : [];
      store.set('cats_' + code, JSON.stringify(catsCache[code]));
    } catch (e) {
      delete catsCache[code]; catsFailedAt[code] = Date.now();
    } finally { clearTimeout(timer); }
    if (managerOpen) queue.filter(q => q.country === code).forEach(refreshCard);
  }

  // ---- manager overlay (its own shadow root) ----
  const mhost = document.createElement('div');
  mhost.id = 'pmg-batch';
  mhost.style.cssText = 'position:fixed;inset:0;z-index:2147483646;display:none;';
  const mroot = mhost.attachShadow({ mode: 'open' });
  mroot.innerHTML = `
    <style>${UI_BASE}
      .ov{position:absolute;inset:0;background:rgba(17,17,17,.55);display:flex;justify-content:center;padding:22px}
      .sheet{background:var(--bg);border-radius:var(--r);width:min(1400px,100%);max-height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35)}
      .top{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:56px;padding:0 16px;background:#fff;color:var(--ink);flex-wrap:wrap;border-bottom:1px solid var(--line)}
      .top h2{margin:0;font-size:16px;font-weight:700;display:flex;align-items:center;gap:14px}
      .top h2 small{font-size:14px;font-weight:500;color:var(--mute)}
      .acts{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .inl{display:inline-flex;align-items:center;gap:6px;font-size:13px}

      .paint{padding:12px 18px;background:#fff;border-bottom:1px solid var(--line);display:flex;gap:10px;align-items:center;flex-wrap:wrap}
      .lbl{font-weight:600;font-size:13px}
      .chips{display:flex;gap:8px;flex-wrap:wrap}
      .chip{display:inline-flex;align-items:center;gap:7px;height:var(--h);padding:0 10px;border-radius:var(--r);border:2px solid var(--line2);background:#fff;color:var(--ink);font:inherit;font-size:13px;cursor:pointer}
      .chip:hover{border-color:var(--primary-soft);background:var(--primary-tint)}
      .chip.on{background:var(--primary-soft);color:var(--primary-h);border-color:var(--primary-soft)}
      .chip kbd{display:inline-grid;place-items:center;min-width:18px;height:18px;border-radius:var(--r);background:var(--soft);color:var(--ink);font:700 11px system-ui}
      .chip.on kbd{background:#fff}
      .chip .rm{margin-left:2px;opacity:.55;font-size:16px;line-height:1}
      .chip .rm:hover{opacity:1}
      select.more{max-width:210px;font-size:13px}
      .tools{padding:10px 18px;background:var(--paper);border-bottom:1px solid var(--line);display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .tools .inl{margin-left:auto}
      .inl input[type=range]{width:140px}
      .msg{padding:6px 18px 0;min-height:28px;font-size:13px;color:var(--mute)}

      .grid{flex:1 1 0;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:14px 18px 18px;display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--cw,300px),1fr));gap:14px;align-content:start;grid-auto-rows:max-content}
      .grid::-webkit-scrollbar{width:12px}
      .grid::-webkit-scrollbar-thumb{background:var(--line2);border-radius:var(--r);border:3px solid var(--bg)}
      .empty{grid-column:1/-1;padding:40px 10px;text-align:center;color:var(--mute)}
      .card{position:relative;background:#fff;border:2px solid var(--primary-soft);border-radius:var(--r);overflow:hidden;cursor:pointer;user-select:none}
      .card.none{border:2px dashed var(--line2)}
      .card.done,.card.submitted{opacity:.5;cursor:default}
      .card.sel{border:3px solid var(--primary);box-shadow:0 0 0 3px var(--ring);background:var(--primary-tint)}
      .card.sel::after{content:'✓';position:absolute;bottom:34px;right:8px;width:24px;height:24px;border-radius:var(--r);background:var(--primary);color:var(--on-primary);display:grid;place-items:center;font-weight:800;font-size:14px;pointer-events:none}
      .card.sel img,.card.sel .noprev{filter:brightness(.92) saturate(1.1)}
      .card img,.card .noprev{width:100%;aspect-ratio:4/3;display:block;background:var(--soft)}
      .card img{object-fit:cover}
      .card .noprev{display:flex;align-items:center;justify-content:center;color:var(--mute);font:600 11px system-ui,sans-serif;text-align:center;padding:6px}
      .dupbadge{margin:4px 8px 0;padding:2px 8px;border-radius:var(--r);background:var(--warn-soft);color:var(--warn-ink);font-size:11px;font-weight:700;align-self:flex-start}
      .name{padding:6px 8px 0;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:6px 8px 8px}
      .badge{min-width:36px;text-align:center;padding:2px 8px;border-radius:var(--r);background:var(--primary-soft);color:var(--primary-h);font-weight:700;font-size:13px}
      .none .badge{background:var(--soft);color:var(--mute)}
      select.cat{flex:1 1 100%;min-width:0;height:28px;padding:0 6px;font-size:12px;border-radius:var(--r)}
      .st{position:absolute;top:6px;left:6px;padding:2px 8px;border-radius:var(--r);background:#fff;border:1px solid var(--line2);font-size:11px;font-weight:700}
      .mini{position:absolute;top:6px;height:24px;border-radius:var(--r);border:1px solid var(--line2);font-size:11px;font-weight:700;cursor:pointer}
      .mini.rt{right:36px;padding:0 8px;background:var(--primary-soft);border-color:var(--primary-soft);color:var(--primary-h)}
      .mini.x{right:6px;width:24px;padding:0;background:#fff;color:var(--mute);font-size:16px;line-height:1;display:none}
      .card:hover .mini.x{display:block}
      .mini.x:hover{background:var(--danger);border-color:var(--danger);color:#fff}

      .zoom{position:fixed;top:50%;transform:translateY(-50%);z-index:5;width:min(760px,52vw);pointer-events:none;border:3px solid var(--ink);border-radius:var(--r);background:var(--ink);box-shadow:0 18px 50px rgba(0,0,0,.5);overflow:hidden}
      .zoom img{display:block;width:100%;max-height:88vh;object-fit:contain;background:var(--ink)}
      .zoom .zl{position:absolute;left:8px;bottom:8px;background:rgba(0,0,0,.65);color:#fff;font:600 12px system-ui,sans-serif;padding:3px 8px;border-radius:var(--r)}

      .foot{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 18px;background:#fff;border-top:1px solid var(--line);flex-wrap:wrap}
      #mInfo{font-size:13px;color:var(--mute)}
      .cfm{position:absolute;inset:0;z-index:6;background:rgba(17,17,17,.45);display:flex;align-items:center;justify-content:center;padding:16px}
      .cbox{background:#fff;border-radius:var(--r);padding:20px;max-width:420px;width:100%;box-shadow:0 18px 50px rgba(0,0,0,.3)}
      .cbox h3{margin:0 0 8px;font-size:16px}
      .cbox p{margin:0 0 16px;color:var(--mute);font-size:14px}
      .cbox .acts{display:flex;justify-content:flex-end;gap:8px}
      @media (max-width:640px){ .ov{padding:0} .sheet{border-radius:0} .top h2 small{display:none} .tools .inl{margin-left:0} .grid{grid-template-columns:repeat(auto-fill,minmax(min(var(--cw,300px),100%),1fr))} }
    </style>
    <div class="zoom" id="zoom" hidden><img alt=""><span class="zl"></span></div>
    <div class="ov" id="ov">
      <div class="sheet">
        <div class="top">
          <h2>${WORDMARK(38)}<small>Batch upload</small></h2>
          <div class="acts">
            <button class="btn" id="mAdd">Add photos</button>
            <button class="btn ghost" id="mFolder">Add a folder</button>
            <label class="inl"><input type="checkbox" id="mSub"> with sub-folders</label>
            <button class="btn ghost" id="mClear">Clear all</button>
            <button class="btn ghost" id="mClose" title="Close (Esc)">Close</button>
          </div>
        </div>
        <div class="paint">
          <span class="lbl">1 · Click photos to select them (blue)</span>
          <span class="lbl">2 · Then give them a country:</span>
          <div class="chips" id="chips"></div>
          <select class="more" id="more"></select>
        </div>
        <div class="tools">
          <button class="btn ghost sm" id="mSelAll">Select all</button>
          <button class="btn ghost sm" id="mSelUn">Select without country</button>
          <button class="btn ghost sm" id="mSelNone">Deselect</button>
          <button class="btn danger sm" id="mDel" disabled>Delete selected</button>
          <label class="inl">Size <input type="range" id="mSize" min="200" max="560" step="10"></label>
        </div>
        <div class="msg" id="mMsg">Click photos to select them, then press a country (or its number key). Shift+click = range · Ctrl+A = all · 0 = remove country · Del = delete · Hover a photo to zoom.</div>
        <div class="grid" id="grid"></div>
        <div class="foot">
          <span id="mInfo"></span>
          <button class="btn lg" id="mStart" disabled>Start uploading</button>
        </div>
      </div>
    </div>
    <div class="cfm" id="cfm" hidden><div class="cbox" role="dialog" aria-modal="true"><h3 id="cfmTitle"></h3><p id="cfmText"></p><div class="acts"><button class="btn ghost" id="cfmNo">Cancel</button><button class="btn danger" id="cfmYes">Clear</button></div></div></div>
    <input type="file" id="fMulti" multiple accept="image/*" hidden>
    <input type="file" id="fFolder" webkitdirectory multiple hidden>`;
  document.body.appendChild(mhost);
  const M = id => mroot.getElementById(id);

  function openManager() {
    managerOpen = true; document.documentElement.classList.add('pmg-busy'); mhost.style.display = 'block';
    if (document.activeElement) document.activeElement.blur(); host.style.display = 'none'; app.modal = { onKey: managerKey };
    renderChips(); fillMore(); renderGrid();
    qAll().then(a => { if (managerOpen && !multi) { queue = a; renderGrid(); fillThumbs(); } }).catch(() => {}); // pick up what other tabs finished
  }
  function closeManager() {
    try { hideZoom(); } catch (e) {}
    managerOpen = false; document.documentElement.classList.remove('pmg-busy'); mhost.style.display = 'none'; host.style.display = ''; app.modal = null;
    updateBatchInfo();
  }
  // A confirmation drawn in this window (window.confirm would show the browser's own box)
  function askConfirm(title, text, okLabel) {
    return new Promise(resolve => {
      M('cfmTitle').textContent = title; M('cfmText').textContent = text; M('cfmYes').textContent = okLabel;
      const done = ok => { M('cfm').hidden = true; app.modal = { onKey: managerKey }; resolve(ok); };
      M('cfm').hidden = false;
      M('cfmYes').onclick = () => done(true);
      M('cfmNo').onclick = () => done(false);
      app.modal = { onKey: e => { if (e.key === 'Escape') { e.preventDefault(); done(false); } else if (e.key === 'Enter') { e.preventDefault(); done(true); } } };
    });
  }
  function managerKey(e) {
    const t = e.composedPath ? e.composedPath()[0] : e.target;
    const typing = t instanceof Node && mroot.contains(t) && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && /^(text|number|search)$/i.test(t.type)));
    log('window key', e.code, 'ctrl', e.ctrlKey, 'target', t && (t.tagName + (t.id ? '#' + t.id : '')), 'typing', !!typing, 'queue', queue.length);
    if (e.key === 'Escape') { e.preventDefault(); if (sel.size) { sel.clear(); syncSel(); } else closeManager(); return; }
    if (typing) return;
    if ((e.ctrlKey || e.metaKey) && isSelectAll(e)) { e.preventDefault(); queue.forEach(q => sel.add(q.id)); syncSel(); log('select all: ' + sel.size + ' photos selected'); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { if (sel.size) { e.preventDefault(); deleteSelected(); } return; }
    const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
    if (m && mine[+m[1] - 1]) { e.preventDefault(); brush = mine[+m[1] - 1]; store.set('brush', brush); renderChips(); assignSel(brush); }
    else if (/^(?:Digit|Numpad)0$/.test(e.code)) { e.preventDefault(); assignSel(''); }
  }

  const saveMine = () => store.set('mine', JSON.stringify(mine));
  function renderChips() {
    const box = M('chips'); box.innerHTML = '';
    mine.forEach((code, i) => {
      const b = document.createElement('button');
      b.className = 'chip' + (code === brush ? ' on' : '');
      const k = document.createElement('kbd'); k.textContent = i + 1;
      const c = document.createElement('b'); c.textContent = code.toUpperCase();
      const n = document.createElement('span'); n.textContent = cName(code);
      const x = document.createElement('span'); x.className = 'rm'; x.textContent = '×'; x.title = 'Remove from my countries';
      x.onclick = ev => {
        ev.stopPropagation();
        mine = mine.filter(m => m !== code); saveMine();
        if (brush === code) { brush = mine[0] || ''; store.set('brush', brush); }
        renderChips(); fillMore();
      };
      b.onclick = () => { brush = code; store.set('brush', code); renderChips(); assignSel(code); };
      b.append(k, c, n, x); box.appendChild(b);
    });
  }
  function fillMore() {
    const s = M('more'); s.innerHTML = '';
    const d = document.createElement('option'); d.value = ''; d.textContent = '+ Add another country…'; s.appendChild(d);
    COUNTRIES.filter(c => !mine.includes(c.code)).forEach(c => {
      const o = document.createElement('option'); o.value = c.code; o.textContent = c.name + ' (' + c.code.toUpperCase() + ')'; s.appendChild(o);
    });
  }
  M('more').onchange = () => {
    const code = M('more').value; if (!code) return;
    mine.push(code); saveMine(); brush = code; store.set('brush', code);
    ensureCats(code); renderChips(); fillMore();
  };

  // The list on screen changes instantly; saving to IndexedDB happens in the background
  function setCountry(it, code) {
    if (it.country !== code) { it.country = code; it.ctype = null; qPut(it).catch(() => {}); }
    if (code) ensureCats(code);
  }
  function onCardClick(ev, it, idx) {
    if (ev.target.closest('select,button')) return;
    if (ev.shiftKey && lastIdx >= 0 && lastIdx < queue.length) {              // range
      const a = Math.min(lastIdx, idx), b = Math.max(lastIdx, idx);
      for (let i = a; i <= b; i++) sel.add(queue[i].id);
    } else if (sel.has(it.id)) sel.delete(it.id); else sel.add(it.id);        // a click adds / removes one photo
    lastIdx = idx; syncSel();
  }
  // Give a country to every selected photo (then the selection is cleared, ready for the next group)
  function assignSel(code) {
    const t = queue.filter(q => sel.has(q.id) && !isFinished(q));
    if (!t.length) { M('mMsg').textContent = 'Select photos first (click them, they turn blue), then choose a country.'; return false; }
    t.forEach(it => setCountry(it, code));
    M('mMsg').textContent = code ? `${cName(code)} given to ${pl(t.length, 'photo')}.` : `Country removed from ${pl(t.length, 'photo')}.`;
    sel.clear(); t.forEach(refreshCard); syncSel(); updateBatchInfo(); return true;
  }
  M('mSelAll').onclick = () => { queue.forEach(q => sel.add(q.id)); syncSel(); };
  M('mSelUn').onclick = () => { sel.clear(); queue.forEach(q => { if (q.status === 'pending' && !q.country) sel.add(q.id); }); syncSel(); };
  M('mSelNone').onclick = () => { sel.clear(); syncSel(); };
  async function deleteIds(ids) {
    if (!ids.length) return;
    const set = new Set(ids);
    queue = queue.filter(q => !set.has(q.id)); ids.forEach(i => sel.delete(i)); lastIdx = -1;
    renderGrid(); updateBatchInfo();
    for (const id of ids) { try { await qDel(id); } catch (e) {} }
    M('mMsg').textContent = `Removed ${pl(ids.length, 'photo')} from the list (your files are untouched).`;
  }
  const deleteSelected = () => deleteIds(queue.filter(q => sel.has(q.id)).map(q => q.id));
  M('mDel').onclick = deleteSelected;
  // ---- hover zoom: a big preview on the side opposite to the hovered photo ----
  const zoomEl = M('zoom'), zoomImg = zoomEl.querySelector('img'), zoomLbl = zoomEl.querySelector('.zl');
  let zoomTimer = null, zoomUrl = '';
  function hideZoom() { clearTimeout(zoomTimer); zoomEl.hidden = true; if (zoomUrl) { URL.revokeObjectURL(zoomUrl); zoomUrl = ''; } zoomImg.removeAttribute('src'); }
  function showZoom(it, card) {
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(() => {
      if (zoomUrl) { URL.revokeObjectURL(zoomUrl); zoomUrl = ''; }
      let src = it.thumb;
      if (it.blob && !isHeic(it)) { try { zoomUrl = URL.createObjectURL(it.blob); src = zoomUrl; } catch (e) {} }   // full resolution when the browser can show it
      if (!src) return;
      zoomImg.src = src; zoomLbl.textContent = it.name;
      const r = card.getBoundingClientRect(), left = r.left + r.width / 2 < innerWidth / 2;
      zoomEl.style.left = left ? 'auto' : '16px'; zoomEl.style.right = left ? '16px' : 'auto';
      zoomEl.hidden = false;
    }, 160);
  }
  M('grid').addEventListener('scroll', hideZoom);
  const applySize = v => { M('grid').style.setProperty('--cw', v + 'px'); };
  M('mSize').value = Math.min(560, Math.max(200, +store.get('csize', '300') || 300)); applySize(M('mSize').value);
  M('mSize').oninput = () => { applySize(M('mSize').value); store.set('csize', M('mSize').value); };

  // One card. Cards are rebuilt one at a time (refreshCard) or all together (renderGrid) -- a click never redraws the whole list.
  function buildCard(it) {
    const c = document.createElement('div');
    c.className = 'card' + (it.country ? '' : ' none') + (it.status !== 'pending' ? ' ' + it.status : '') + (sel.has(it.id) ? ' sel' : '');
    c.dataset.id = it.id; c.appendChild(thumbNode(it));
    const nm = document.createElement('div'); nm.className = 'name'; nm.textContent = it.name; nm.title = it.name; c.appendChild(nm);
    if (it.dupes) c.appendChild(h('div', { class: 'dupbadge', text: `⚠ ${it.dupes} already on the site`, title: it.plate || '' }));
    const row = document.createElement('div'); row.className = 'row';
    const bd = document.createElement('span'); bd.className = 'badge'; bd.textContent = it.country ? it.country.toUpperCase() : '?'; bd.title = it.country ? cName(it.country) : 'No country yet';
    row.appendChild(bd);
    if (it.country && catsCache[it.country] === undefined) ensureCats(it.country);
    const cats = it.country ? catsCache[it.country] : null;
    if (Array.isArray(cats) && cats.length > 1) {
      const pick = document.createElement('select'); pick.className = 'cat'; pick.title = 'Plate category';
      cats.forEach(k => { const o = document.createElement('option'); o.value = k.v; o.textContent = k.l; pick.appendChild(o); });
      pick.value = it.ctype || cats[0].v;
      pick.onchange = () => { it.ctype = pick.value === cats[0].v ? null : pick.value; qPut(it).catch(() => {}); };
      row.appendChild(pick);
    }
    c.appendChild(row);
    if (it.status !== 'pending') {
      const st = document.createElement('div'); st.className = 'st';
      st.textContent = { done: '✓ Uploaded', submitted: '✓ Sent', failed: '! Failed', opened: 'Opened in a tab' }[it.status] || it.status;
      c.appendChild(st);
      if (it.blob && (it.status === 'failed' || it.status === 'opened')) {
        const r = document.createElement('button'); r.className = 'mini rt'; r.textContent = 'Retry';
        r.onclick = ev => { ev.stopPropagation(); it.status = 'pending'; qPut(it).catch(() => {}); refreshCard(it); updateBatchInfo(); };
        c.appendChild(r);
      }
    }
    const x = document.createElement('button'); x.className = 'mini x'; x.textContent = '×'; x.title = 'Remove this photo from the list';
    x.onclick = ev => { ev.stopPropagation(); deleteIds([it.id]); };
    c.appendChild(x);
    c.onmouseenter = () => showZoom(it, c); c.onmouseleave = hideZoom;
    c.onclick = ev => onCardClick(ev, it, queue.indexOf(it));
    return c;
  }
  const cardOf = it => mroot.querySelector(`.card[data-id="${it.id}"]`);
  function refreshCard(it) {
    const old = cardOf(it); if (!old) return;
    hideZoom(); old.replaceWith(buildCard(it));
  }
  // Selection changed: only toggle the blue state
  function syncSel() {
    for (const c of M('grid').children) if (c.dataset && c.dataset.id) c.classList.toggle('sel', sel.has(c.dataset.id));
    updateStats();
  }
  function updateStats() {
    for (const id of [...sel]) if (!queue.some(q => q.id === id)) sel.delete(id);
    M('mDel').disabled = !sel.size; M('mDel').textContent = sel.size ? `Delete selected (${sel.size})` : 'Delete selected';
    const ready = readyCount(), noC = queue.filter(q => q.status === 'pending' && !q.country).length;
    M('mInfo').textContent = `${pl(queue.length, 'photo')} · ${ready} ready · ${noC} without a country (will be skipped) · ${queue.filter(isFinished).length} uploaded`;
    M('mStart').disabled = ready === 0;
    M('mStart').textContent = ready ? `Start uploading ${pl(ready, 'photo')}` : 'Start uploading';
  }
  function renderGrid() {
    hideZoom();
    const g = M('grid'), frag = document.createDocumentFragment();
    if (!queue.length) {
      const e = document.createElement('div'); e.className = 'empty';
      e.textContent = 'No photos yet. Use “Add photos” or “Add a folder”, or drop photos here.';
      frag.appendChild(e);
    }
    queue.forEach(it => frag.appendChild(buildCard(it)));
    g.replaceChildren(frag);
    updateStats();
  }

  // ---- adding photos ----
  const IMG_RE = /\.(jpe?g|png|webp|heic|heif|avif|gif|bmp|tiff?)$/i;
  const isHeic = f => /heic|heif/i.test(f.type || '') || /\.(heic|heif|hif)$/i.test(f.name || '');
  // Newer libheif (reads recent iPhone HEICs)
  async function heicViaLibheif(file) {
    if (typeof libheif === 'undefined') throw new Error('libheif not loaded');
    const lib = typeof libheif === 'function' ? libheif() : libheif;
    const imgs = new lib.HeifDecoder().decode(new Uint8Array(await file.arrayBuffer()));
    if (!imgs || !imgs.length) throw new Error('libheif: no image found');
    const im = imgs[0], w = im.get_width(), h = im.get_height();
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'), data = ctx.createImageData(w, h);
    await new Promise((res, rej) => im.display(data, r => r ? res(r) : rej(new Error('libheif: could not render the image'))));
    ctx.putImageData(data, 0, 0);
    return c;                                   // a canvas can be drawn like a bitmap
  }
  // The preview of a card: 720 px wide. Once decoded a picture takes width x height x 4 bytes in memory, and the whole grid is on screen:
  // 1400 px previews (6 MB each) made the browser run out of memory with a few hundred photos; 720 px takes four times less.
  // The photo shown while hovering is the original file, not this preview (except for HEIC).
  const THUMB_W = 720;
  async function bitmapOf(file) {
    try { return await createImageBitmap(file, { resizeWidth: THUMB_W, resizeQuality: 'high' }); } catch (e) {}   // fast path: decoded straight at preview size
    try { return await createImageBitmap(file); } catch (e) {}                                                // other formats the browser can read
    if (isHeic(file)) return heicViaLibheif(file);
    throw new Error('this browser cannot read this format');
  }
  // Smooth downscale: halve step by step, then a final high-quality pass (a single big jump looks pixelated)
  function downscale(src, tw) {
    let cur = src, w = src.width, h = src.height;
    const tw2 = Math.min(tw, w), th2 = Math.max(1, Math.round(h * tw2 / w));
    while (w / 2 >= tw2) {
      const nw = Math.max(tw2, Math.floor(w / 2)), nh = Math.max(1, Math.floor(h / 2));
      const c = document.createElement('canvas'); c.width = nw; c.height = nh;
      const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(cur, 0, 0, nw, nh);
      cur = c; w = nw; h = nh;
    }
    const out = document.createElement('canvas'); out.width = tw2; out.height = th2;
    const ox = out.getContext('2d'); ox.imageSmoothingEnabled = true; ox.imageSmoothingQuality = 'high'; ox.drawImage(cur, 0, 0, tw2, th2);
    return out;
  }
  async function makeThumb(file) {
    try {
      const bmp = await bitmapOf(file);
      const c = downscale(bmp, THUMB_W);
      if (bmp.close) bmp.close();
      return c.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      const m = e && (e.message || (typeof e === 'string' ? e : JSON.stringify(e))) || 'unknown error';
      try { file.__why = String(m).slice(0, 140); console.warn('[NextPlaate] preview failed for', file.name, e); } catch (x) {}
      return '';
    }
  }
  // Previews are made in the background (4 at a time; HEIC one at a time because it is heavy), so the photos
  // appear in the list at once. The ORIGINAL file is stored untouched and is what gets uploaded.
  const thumbBusy = new Set();
  function setCardThumb(it) {
    const c = cardOf(it); if (!c) return;
    const old = c.firstElementChild; if (old && (old.tagName === 'IMG' || old.classList.contains('noprev'))) old.remove();
    c.insertBefore(thumbNode(it), c.firstChild);
  }
  function thumbNode(it) {
    if (it.thumb) { const im = document.createElement('img'); im.decoding = 'async'; im.src = it.thumb; im.alt = ''; return im; }
    const ph = document.createElement('div'); ph.className = 'noprev';
    ph.textContent = (!it.why && it.blob && thumbBusy.has(it.id)) ? 'Loading preview…'
      : ((it.name.match(/\.(\w+)$/) || [])[1] || 'photo').toUpperCase() + ' · no preview' + (it.why ? ' — ' + it.why : '');
    ph.title = it.why || ''; return ph;
  }
  let thumbRun = false;
  async function fillThumbs() {
    if (thumbRun) return; thumbRun = true;
    try {
      const todo = queue.filter(q => !q.thumb && !q.why && q.blob);
      todo.forEach(q => thumbBusy.add(q.id));
      todo.forEach(setCardThumb);
      const light = todo.filter(q => !isHeic(q)), heavy = todo.filter(q => isHeic(q));
      const work = async list => {
        while (list.length) {
          const it = list.shift(); if (!queue.includes(it)) { thumbBusy.delete(it.id); continue; }
          it.thumb = await makeThumb(it.blob); it.why = it.blob.__why || '';
          thumbBusy.delete(it.id); setCardThumb(it); qPut(it).catch(() => {});
          M('mMsg').textContent = `Preparing previews… ${thumbBusy.size} left`;
        }
      };
      await Promise.all([work(light), work(light), work(light), work(light), work(heavy)]);
      if (todo.length) M('mMsg').textContent = 'Previews ready.';
    } finally { thumbRun = false; }
  }
  async function addFiles(list) {
    const files = [...list].filter(f => /^image\//.test(f.type) || IMG_RE.test(f.name));
    if (!files.length) { M('mMsg').textContent = 'No photos found in that selection.'; return; }
    try {
      // finished photos make room for the new batch
      for (const q of queue.filter(q => q.status === 'done')) await qDel(q.id);
      queue = queue.filter(q => q.status !== 'done');
      const known = new Set(queue.map(q => q.key));
      const fresh = files.filter(f => !known.has(f.name + '|' + f.size + '|' + f.lastModified))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      let order = queue.reduce((m, q) => Math.max(m, q.order), 0);
      const items = fresh.map(f => ({ id: uid(), key: f.name + '|' + f.size + '|' + f.lastModified, order: ++order, name: f.name,
        type: f.type || 'image/jpeg', lastModified: f.lastModified, blob: f, thumb: '', why: '', country: '', ctype: null, status: 'pending' }));
      items.forEach(i => queue.push(i));
      renderGrid(); updateBatchInfo();                                   // everything is visible immediately
      M('mMsg').textContent = `Saving ${pl(items.length, 'photo')}…`;
      for (let i = 0; i < items.length; i += 8) await Promise.all(items.slice(i, i + 8).map(qPut));   // saved 8 at a time
      M('mMsg').textContent = fresh.length ? `Added ${pl(fresh.length, 'photo')}. Click photos to select them, then give them a country.` : 'These photos are already in the list.';
      fillThumbs();
    } catch (e) {
      M('mMsg').textContent = 'Could not store the photos in this browser (private window?). Try a normal window.';
    }
    renderGrid(); updateBatchInfo();
  }
  M('mAdd').onclick = () => M('fMulti').click();
  // Recursive folder reading (every sub-folder), through the browser's folder picker when it has one
  const subDepth = () => (M('mSub') && M('mSub').checked) ? 12 : 0;   // 0 = only the folder itself
  async function walkDir(dh, out, depth = 0) {
    for await (const [name, h] of dh.entries()) {
      if (h.kind === 'file') { if (IMG_RE.test(name)) out.push(await h.getFile()); }
      else if (depth < subDepth() && !name.startsWith('.')) await walkDir(h, out, depth + 1);
    }
  }
  async function walkEntry(en, out, depth = 0) {                // drag & drop of folders
    if (!en) return;
    if (en.isFile) { const f = await new Promise(r => en.file(r, () => r(null))); if (f && (/^image\//.test(f.type) || IMG_RE.test(f.name))) out.push(f); }
    else if (en.isDirectory && depth <= subDepth()) {
      const rd = en.createReader();
      for (;;) {                                               // readEntries returns small batches
        const batch = await new Promise(r => rd.readEntries(r, () => r([])));
        if (!batch.length) break;
        for (const c of batch) await walkEntry(c, out, depth + 1);
      }
    }
  }
  M('mSub').checked = store.get('sub', '0') === '1';
  M('mSub').onchange = () => store.set('sub', M('mSub').checked ? '1' : '0');
  M('mFolder').onclick = async () => {
    const pick = (typeof unsafeWindow !== 'undefined' && unsafeWindow.showDirectoryPicker) || window.showDirectoryPicker;
    if (typeof pick === 'function') {
      try {
        const dh = await pick.call(typeof unsafeWindow !== 'undefined' ? unsafeWindow : window, { mode: 'read' });
        const out = []; M('mMsg').textContent = 'Looking for photos in all sub-folders…';
        await walkDir(dh, out);
        addFiles(out); return;
      } catch (e) { if (e && e.name === 'AbortError') return; }  // otherwise fall back to the classic picker
    }
    M('fFolder').click();
  };
  M('fMulti').onchange = e => { addFiles(e.target.files); e.target.value = ''; };
  M('fFolder').onchange = e => {
    let fs = [...e.target.files];
    if (!subDepth()) fs = fs.filter(f => (f.webkitRelativePath || '').split('/').length <= 2);  // "folder/photo.jpg" only
    addFiles(fs); e.target.value = '';
  };
  M('ov').addEventListener('dragover', e => e.preventDefault());
  M('ov').addEventListener('drop', async e => {
    e.preventDefault();
    const dt = e.dataTransfer; if (!dt) return;
    const ents = [...(dt.items || [])].map(i => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
    if (ents.length) { const out = []; M('mMsg').textContent = 'Looking for photos in the dropped items…'; for (const en of ents) await walkEntry(en, out); addFiles(out); }
    else if (dt.files.length) addFiles(dt.files);
  });
  M('mClose').onclick = closeManager;
  M('mClear').onclick = async () => {
    if (!queue.length || !(await askConfirm('Clear the list?', 'All photos leave the batch list. Your files on disk are not touched.', 'Clear'))) return;
    try { await qClear(); } catch (e) {}
    queue = []; sel.clear(); setBatch(null); renderGrid(); updateBatchInfo();
  };
  M('mStart').onclick = () => { closeManager(); startMulti(); };

  // ---- "Start uploading": one new tab per photo, spaced out so Cloudflare does not get nervous ----
  // Each tab gets its photo through the address (#pmg=ID), loads it into the editor and is then on its own.
  let multi = null;                       // { list, total, opened, timer }
  const CF_PAUSE = 15 * 60 * 1000;        // after a Cloudflare challenge, do not open anything for 15 min
  const cfRecent = () => Date.now() - (+store.get('cfhit', '0') || 0) < CF_PAUSE;
  function stopMulti(msg) {
    if (multi && multi.timer) clearTimeout(multi.timer);
    multi = null; updateBatchInfo(); if (msg) setStatus(msg);
  }
  function startMulti() {                 // runs inside the click, so the first tab is never blocked
    if (multi) return;
    if (cfRecent()) { setStatus('Cloudflare asked for a check a moment ago. Open the site normally, solve it, and wait a few minutes before starting again.'); return; }
    const list = queue.filter(q => q.status === 'pending' && q.country && q.blob);
    if (!list.length) { setStatus('Nothing ready: give each photo a country first (press <b>U</b>).'); return; }
    multi = { list, total: list.length, opened: 0, timer: null };
    updateBatchInfo();
    multiStep();
  }
  function multiStep() {
    if (!multi) return;
    if (cfRecent()) { stopMulti('Paused: Cloudflare showed a check in one of the tabs. Solve it there, wait a few minutes, then press Start again (the rest is kept).'); return; }
    const it = multi.list.shift();
    if (!it) { const n = multi.opened; stopMulti(`All <b>${n}</b> tab${n > 1 ? 's' : ''} opened. Finish each one: crop, Add, plate, send.`); return; }
    let w = null;
    const url = location.origin + '/' + it.country + '/add#pmg=' + encodeURIComponent(it.id);
    // Tampermonkey's own tab opener: never blocked as a pop-up, and opens in the background (this tab keeps running)
    try { if (typeof GM_openInTab === 'function') w = GM_openInTab(url, { active: false, insert: true, setParent: true }) || true; } catch (e) {}
    if (!w) { try { w = window.open(url, '_blank'); } catch (e) {} }
    if (!w) {
      const left = multi.list.length + 1;
      stopMulti(`Could not open a new tab. Check that the script has the <b>GM_openInTab</b> permission (reinstall it), or allow <b>pop-ups</b> for platesmania.com, then press Start again. ${left} photo${left > 1 ? 's' : ''} still waiting.`);
      return;
    }
    it.status = 'opened'; it.openedAt = Date.now(); qPut(it).catch(() => {});
    multi.opened++;
    updateBatchInfo();
    if (!multi.list.length) { multiStep(); return; }
    const sec = Math.min(120, Math.max(5, +store.get('qDelay', '10') || 10));
    const wait = Math.round(sec * 1000 * (0.85 + Math.random() * 0.5)); // slight random jitter, looks less robotic
    setStatus(`Opened <b>${multi.opened}</b> of ${multi.total}. Next tab in ~${Math.round(wait / 1000)} s… (keep this tab open)`);
    multi.timer = setTimeout(multiStep, wait);
  }

  // ---- loading a photo into this tab ----
  function openItem(it) {
    setBatch({ active: true, current: it.id, pendingSubmit: null, ts: Date.now() });
    updateBatchInfo();
    const path = '/' + it.country + '/add';
    if (location.pathname.replace(/\/$/, '') === path) loadIntoEditor(it);
    else { setStatus(`Opening the <b>${esc(cName(it.country))}</b> upload page for <b>${esc(it.name)}</b>…`); location.href = path; }
  }
  const batchResumable = () => {
    const b = getBatch();
    return !!(b && b.active && b.current && queue.some(q => q.id === b.current && (isOpenable(q) || q.status === 'failed')));
  };
  function resumeCurrent() {
    const b = getBatch(), cur = b && queue.find(q => q.id === b.current);
    if (!cur) return;
    if (cur.status === 'failed' || cur.status === 'opened') { cur.status = 'pending'; qPut(cur).catch(() => {}); }
    openItem(cur);
  }

  const waitFor = (fn, ms = 8000) => new Promise(res => {
    const t0 = Date.now();
    (function tick() { const v = fn(); if (v) return res(v); if (Date.now() - t0 > ms) return res(null); setTimeout(tick, 200); })();
  });
  function feedInput(input, file) {
    try {
      const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    } catch (e) { return false; }
  }
  // After the editor opens it may show its own "select photo" file field: give it the photo too
  function feedEditor(file, mainInput) {
    return new Promise(resolve => {
      const t0 = Date.now(), fed = new WeakSet(); let n = 0;
      const timer = setInterval(() => {
        // The editor's own field first (known from the real DOM), then any other empty file field
        const cands = [...document.querySelectorAll('.pm-photo-editor input[type="file"][data-role="file"], input[type="file"]')];
        cands.forEach(i => {
          if (i !== mainInput && !fed.has(i) && !(i.files && i.files.length)) { fed.add(i); if (feedInput(i, file)) n++; }
        });
        const ws = document.querySelector('.pm-photo-editor__workspace');
        const loaded = ws && !ws.hidden;                 // editor shows its workspace once the photo is decoded
        if ((n && loaded) || Date.now() - t0 > (n ? 15000 : 7000)) { clearInterval(timer); resolve(n); }
      }, 300);
    });
  }
  let loadingNow = false;
  async function loadIntoEditor(it) {
    if (loadingNow) return;
    loadingNow = true;
    try {
      const input = await waitFor(() => document.getElementById('filename'));
      const openBtn = await waitFor(() => document.getElementById('pm-photo-editor-open'));
      if (!input || !openBtn) { setStatus('Could not find the upload form on this page.'); return; }
      if (!it.blob) { setStatus(`The photo <b>${esc(it.name)}</b> is no longer stored. Add it again (U).`); return; }
      const file = new File([it.blob], it.name, { type: it.type, lastModified: it.lastModified });
      { // plate category chosen in the manager (default = the page's first one); fires the site's own onchange
        const sel = typeMenuEl();
        const want = it.ctype || (sel && sel.options[0] ? sel.options[0].value : '');
        if (sel && want && sel.value !== want) { sel.value = want; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      }
      setStatus(`Loading <b>${esc(it.name)}</b> into the editor…`);
      feedInput(input, file);
      openBtn.click();
      const n = await feedEditor(file, input);
      setStatus(`<b>${esc(it.name)}</b> sent to the editor (${n ? 'through its file field' : 'through the form'}). Crop and retouch, click Add, enter the plate, then send. Photo not shown? Press <b>R</b> to try again.`);
    } finally { loadingNow = false; }
  }

  // ---- is the tab of an "opened" photo still there? ----
  // Each upload tab holds a Web Lock named after its photo for as long as it is open (the browser releases it
  // when the tab closes, even a throttled background one). Any other tab can see which locks exist.
  const LOCK = id => 'pmg-tab-' + id;
  function holdLock(id) {
    try { if (navigator.locks && id) navigator.locks.request(LOCK(id), () => new Promise(() => {})); } catch (e) {}
  }
  const missed = {};
  async function reapOpened() {
    if (!navigator.locks || !navigator.locks.query) return;
    const opened = queue.filter(q => q.status === 'opened');
    if (!opened.length) return;
    let held;
    try { held = new Set(((await navigator.locks.query()).held || []).map(l => l.name)); } catch (e) { return; }
    for (const q of opened) {
      if (held.has(LOCK(q.id)) || Date.now() - (q.openedAt || 0) < 20000) { missed[q.id] = 0; continue; }   // alive, or still loading
      if (++missed[q.id] < 2) continue;                                   // gone twice in a row (not just a page change)
      try {
        const fresh = await qGet(q.id);                                   // never overwrite what another tab just saved
        if (fresh && fresh.status === 'opened') { fresh.status = 'pending'; await qPut(fresh); }
        q.status = fresh ? fresh.status : 'pending';
      } catch (e) { continue; }
      if (managerOpen) refreshCard(q);
      updateBatchInfo();
    }
  }
  setInterval(reapOpened, 5000);

  // The form was sent: remember which photo, the next page tells us how it went
  const markSubmitted = () => {
    const b = getBatch();
    if (!b || !b.active || !b.current) return;
    const it = queue.find(q => q.id === b.current);
    if (it) { it.status = 'submitted'; qPut(it).catch(() => {}); }
    setBatch({ ...b, pendingSubmit: b.current, ts: Date.now() });
  };
  document.addEventListener('submit', e => {
    if (!featureOn('upload') || e.defaultPrevented || !e.target || e.target.id !== 'frm') return;
    markSubmitted();
  });
  { // patch the PAGE's form.submit (the script runs in Tampermonkey's sandbox, so go through unsafeWindow)
    const PW = (typeof unsafeWindow !== 'undefined' && unsafeWindow) || window;
    const proto = PW.HTMLFormElement.prototype, _origSubmit = proto.submit;
    proto.submit = function () { try { if (this.id === 'frm') markSubmitted(); } catch (e) {} return _origSubmit.apply(this, arguments); };
  }

  const visible = el => !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  const pageError = () => {
    const els = [...document.querySelectorAll('.alert-danger, .alert-error, .alert-warning, .has-error')].filter(visible);
    return els.length ? els[0].textContent.replace(/\s+/g, ' ').trim().slice(0, 160) : '';
  };

  async function batchOnLoad() {
    try { queue = await qAll(); } catch (e) { queue = []; }
    // A tab opened by "Start uploading" carries its photo in the address: #pmg=ID
    const hm = location.hash.match(/^#pmg=(.+)$/);
    if (hm) {
      const hid = decodeURIComponent(hm[1]);
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      const hit = queue.find(q => q.id === hid);
      if (hit && isOpenable(hit)) setBatch({ active: true, current: hid, pendingSubmit: null, ts: Date.now() });
    }
    updateBatchInfo();
    const b = getBatch();
    if (!b || !b.active) return;
    holdLock(b.current);                                    // tells the other tabs this photo's tab is alive
    const cur = b.current && queue.find(q => q.id === b.current);

    // 1) this page is the answer to a photo we just sent
    if (b.pendingSubmit && Date.now() - (b.ts || 0) < 300000) {
      const it = queue.find(q => q.id === b.pendingSubmit);
      setBatch({ ...b, pendingSubmit: null, ts: Date.now() });
      if (it) {
        const err = document.querySelector('#filename[type="file"]') ? pageError() : '';
        if (err) {
          it.status = 'failed'; await qPut(it); updateBatchInfo();
          setStatus(`The site did not accept <b>${esc(it.name)}</b>: ${esc(err)}<br>Press <b>R</b> to try this photo again.`);
          return;
        }
        it.status = 'done'; it.blob = null; await qPut(it); updateBatchInfo();
        setStatus(`<b>${esc(it.name)}</b> sent ✓ You can close this tab.`);
        return;
      }
    }
    // 2) we are on the upload page of the current photo: put it in the editor
    const m = location.pathname.match(/^\/([a-z]{2})\/add\/?$/i);
    if (m && cur && isOpenable(cur)) {
      if (cur.country === m[1].toLowerCase()) loadIntoEditor(cur);
      else location.href = '/' + cur.country + '/add';
      return;
    }
    // 3) anywhere else: stay out of the way
    if (cur && isOpenable(cur)) setStatus(`Batch paused on <b>${esc(cur.name)}</b>. Press <b>R</b> to open it again.`);
  }

  /* =====================================================================
   *  UPLOAD TAB  (the ribbon controls of the batch upload: summary, open the manager, start, stop)
   * ===================================================================== */
  function updateBatchInfo() {
    const ready = readyCount(), noC = queue.filter(q => q.status === 'pending' && !q.country).length;
    const done = queue.filter(isFinished).length;
    const b = getBatch(), active = !!(b && b.active);
    const opened = queue.filter(q => q.status === 'opened').length;
    $('qInfo').textContent = queue.length
      ? `${queue.length} photo${queue.length > 1 ? 's' : ''} · ${ready} ready · ${noC} without country · ${done} uploaded${opened ? ' · ' + opened + ' open in tabs' : ''}`
      : 'No photos queued yet.';
    const go = $('qGo');
    go.disabled = ready === 0 || !!multi;
    go.textContent = multi ? `Opening tabs… ${multi.opened}/${multi.total}` : `Start uploading${ready ? ' (' + ready + ')' : ''}`;
    $('qStop').hidden = !multi;
  }

  registerFeature({
    id: 'upload', label: 'Batch upload',
    groups: [{
      drawer: 'upload', title: 'Batch upload',
      build: () => [
        h('div', { id: 'qInfo', class: 'qinfo', text: 'No photos queued yet.' }),
        h('button', { id: 'qOpen', class: 'btn ghost', text: 'Choose photos & countries (U)' }),
        h('button', { id: 'qGo', class: 'btn', disabled: true, text: 'Start uploading' }),
        h('button', { id: 'qStop', class: 'btn ghost', hidden: true, text: 'Stop opening tabs' }),
        h('div', { class: 'row' }, h('label', { for: 'qDelay', text: 'Delay between tabs (s)' }),
          h('input', { type: 'number', id: 'qDelay', min: 5, max: 120, step: 1 }))
      ]
    }],
    keys: {
      open: { code: 'KeyU', label: 'Open the batch manager', run: () => { openManager(); return true; }, hintOrder: 40 },            // batch upload manager
      start: { code: 'KeyN', label: 'Start uploading', run: () => { if (!queue.length) return false; startMulti(); return true; }, hintOrder: 50 }, // start uploading
      resume: { code: 'KeyR', label: 'Reload the current photo', run: () => { if (!batchResumable()) return false; resumeCurrent(); return true; }, hintOrder: 55 } // (re)load the current photo
    },
    onEscape: () => { if (!multi) return false; stopMulti('Stopped. The photos not yet opened are still waiting.'); return true; },
    escOrder: 10,
    init: () => {
      $('qDelay').value = Math.min(120, Math.max(5, +store.get('qDelay', '10') || 10));
      $('qDelay').onchange = () => { const v = Math.min(120, Math.max(5, Math.round(+$('qDelay').value) || 10)); $('qDelay').value = v; store.set('qDelay', String(v)); };
      $('qOpen').onclick = openManager;
      $('qGo').onclick = startMulti;
      $('qStop').onclick = () => stopMulti('Stopped. Photos already opened stay in their tabs; the others are still waiting.');
      updateBatchInfo();
    }
  });
  /* =====================================================================
   *  START  (once the panel exists: mount the features, then do what this page needs)
   * ===================================================================== */
  // Cloudflare check page in this tab? Tell the tab that is opening the others to stop.
  if (/just a moment|attention required|un instant|checking your browser/i.test(document.title) || document.querySelector('#challenge-form, .cf-error-details')) {
    store.set('cfhit', String(Date.now()));
  }
    // a banner in the console, once: the name and the version (replace with an ASCII art when it is chosen)
  console.log('%c NextPlaate %c v' + (typeof GM_info !== 'undefined' && GM_info.script ? GM_info.script.version : '') + ' ', 'background:' + SITE_BLUE + ';color:#fff;font:bold 14px monospace;padding:2px 6px;border-radius:0', 'color:' + SITE_BLUE + ';font:12px monospace');
mountApp();
  const describing = featureOn('description');
  if (here.edit) { if (describing && $('autoFill').checked) fillDescription(); }
  else if (!(describing && backToGallery())) { if (describing) autoEdit(); if (featureOn('likes')) resumeLikeRun(); }
  if (featureOn('upload')) batchOnLoad().catch(() => {});
})();
