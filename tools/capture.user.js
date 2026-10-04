// ==UserScript==
// @name         NextPlaate dev: capture upload pages
// @namespace    nextplaate-dev
// @version      1.2
// @description  Development tool, not published. Saves the HTML of every /xx/add page into a folder you choose.
// @match        https://platesmania.com/*/add*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

// How it works:
//  1. "Capture all countries" opens /xx/add for each country, one after the other. "Stop" ends it at any time.
//  2. Each page is kept in the browser (IndexedDB). Countries already kept are skipped: a run can be resumed.
//  3. "Check" lists what is kept, what is missing, and what has no upload page.
//  4. "Write to folder" asks for the folder once, then writes xx.html for each country, and an index.json.
//  If a Cloudflare check appears: solve it in the tab, then click "Continue".
//  Read-only: it only loads the upload pages. It never submits a form or types a plate.

(function () {
  'use strict';

  const COUNTRIES = ['ad', 'al', 'at', 'ba', 'be', 'bg', 'by', 'ch', 'cz', 'de', 'dk', 'dz', 'ee', 'es', 'fi', 'fr',
    'gg', 'gr', 'hr', 'hu', 'ie', 'is', 'it', 'lt', 'li', 'lu', 'lv', 'ma', 'md', 'me', 'mk', 'mt', 'nl', 'no', 'pl',
    'pt', 'ro', 'rs', 'ru', 'se', 'si', 'sk', 'tj', 'tr', 'ua', 'uk', 'uz'];
  const PAUSE_MS = 4000;                                    // between two countries
  const LOAD_MS = 1500;                                     // let a page finish before saving it
  const RUN = 'nextplaate-capture';                         // the run in progress (sessionStorage)
  const CHALLENGE = /just a moment|attention required|checking your browser/i;

  // ---- storage: IndexedDB, survives the page changes ----
  const db = () => new Promise((res, rej) => {
    const r = indexedDB.open('nextplaate-dev', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const kvPut = async (k, v) => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = res; t.onerror = () => rej(t.error); }); };
  const kvAll = async () => { const d = await db(); return new Promise(res => { const out = {}; const c = d.transaction('kv').objectStore('kv').openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); }; }); };

  // ---- panel ----
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483647;background:#fff;border:2px solid #31708f;border-radius:6px;padding:10px 12px;font:13px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.2);max-width:360px';
  box.innerHTML = '<div class="msg" style="margin-bottom:8px;white-space:pre-line"></div>' +
    '<button id="cap-start">Capture all countries</button> ' +
    '<button id="cap-stop" hidden>Stop</button> ' +
    '<button id="cap-check">Check</button> ' +
    '<button id="cap-write">Write to folder</button> ' +
    '<button id="cap-go" hidden>Continue</button>';
  document.body.appendChild(box);
  const say = t => { box.querySelector('.msg').textContent = t; };
  const btn = id => box.querySelector('#' + id);
  const running = () => sessionStorage.getItem(RUN) !== null;

  // What is kept, what is missing, what has no upload page
  async function summary() {
    const all = await kvAll();
    const saved = COUNTRIES.filter(c => all['page:' + c]);
    const skipped = COUNTRIES.filter(c => all['skip:' + c]);
    const missing = COUNTRIES.filter(c => !all['page:' + c] && !all['skip:' + c]);
    return { all, saved, skipped, missing };
  }

  async function check() {
    const s = await summary();
    say(`Kept: ${s.saved.length}/${COUNTRIES.length}\n` +
      (s.missing.length ? `Missing: ${s.missing.join(' ')}\n` : 'Nothing missing.\n') +
      (s.skipped.length ? `No upload page: ${s.skipped.join(' ')}` : ''));
    return s;
  }

  // Writes the kept pages and an index into the folder you choose (one folder choice)
  async function writeToFolder() {
    const s = await summary();
    if (!s.saved.length) { say('Nothing captured yet.'); return; }
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    const failed = [];
    for (const c of s.saved) {                                     // one file at a time: an error does not stop the rest
      try {
        const file = await dir.getFileHandle(c + '.html', { create: true });
        const w = await file.createWritable();
        await w.write(s.all['page:' + c]);
        await w.close();
      } catch (e) { failed.push(c + ' (' + e.name + ')'); }
    }
    if (failed.length) { say('Not written: ' + failed.join(', ') + '. Click "Write to folder" again.'); return; }
    const index = {
      date: new Date().toISOString(),
      saved: s.saved, skipped: s.skipped, missing: s.missing,
    };
    const idx = await dir.getFileHandle('index.json', { create: true });
    const w = await idx.createWritable();
    await w.write(JSON.stringify(index, null, 2));
    await w.close();
    say(`Written ${s.saved.length} file(s) and index.json to the folder.`);
  }

  // One step: keep this page if it is the current country, then go to the next one
  async function step() {
    const left = JSON.parse(sessionStorage.getItem(RUN) || 'null');
    if (!left) { say('NextPlaate dev: capture ready.'); return; }
    if (!left.length) { sessionStorage.removeItem(RUN); await check(); return; }
    if (CHALLENGE.test(document.title)) {
      say('Cloudflare check: solve it in this tab, then click Continue.');
      btn('cap-go').hidden = false;
      return;
    }
    const code = left[0];
    const m = location.pathname.match(/^\/([a-z]{2})\/add\/?$/i);
    await new Promise(r => setTimeout(r, LOAD_MS));
    if (!running()) { say('Stopped.'); return; }
    if (m && m[1].toLowerCase() === code) {
      await kvPut('page:' + code, '<!-- ' + location.href + ' -->\n' + document.documentElement.outerHTML);
    } else {
      await kvPut('skip:' + code, location.href);                 // no upload page for this country
    }
    const rest = left.slice(1);
    sessionStorage.setItem(RUN, JSON.stringify(rest));
    btn('cap-stop').hidden = false;
    say(`${code} kept. ${rest.length} left. Next in ${PAUSE_MS / 1000} s…`);
    if (!rest.length) { sessionStorage.removeItem(RUN); await check(); return; }
    setTimeout(() => {
      if (!running()) { say('Stopped.'); return; }                // Stop was clicked during the pause
      location.href = '/' + rest[0] + '/add';
    }, PAUSE_MS);
  }

  btn('cap-start').onclick = async () => {
    const s = await summary();
    const left = COUNTRIES.filter(c => !s.all['page:' + c] && !s.all['skip:' + c]);
    if (!left.length) { say('Everything is already kept. Click "Write to folder".'); return; }
    sessionStorage.setItem(RUN, JSON.stringify(left));
    location.href = '/' + left[0] + '/add';
  };
  btn('cap-stop').onclick = () => {
    sessionStorage.removeItem(RUN);
    btn('cap-stop').hidden = true;
    say('Stopped. Click "Capture all countries" to resume, or "Check".');
  };
  btn('cap-check').onclick = () => check();
  btn('cap-write').onclick = () => writeToFolder().catch(e => say('Could not write: ' + e.message));
  btn('cap-go').onclick = () => { btn('cap-go').hidden = true; step(); };
  btn('cap-stop').hidden = !running();
  step();
})();
