// ==UserScript==
// @name         NextPlaate dev: capture upload pages
// @namespace    nextplaate-dev
// @version      1.1
// @description  Development tool, not published. Saves the HTML of every /xx/add page into a folder you choose.
// @match        https://platesmania.com/*/add*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

// How it works:
//  1. Click "Capture all countries". The script opens /xx/add for each country, one after the other.
//  2. Each page is kept in the browser (IndexedDB). Countries already kept are skipped, so a run can be resumed.
//  3. When every country is done (or when you click "Write to folder"), choose the folder once:
//     the files are written there in one go: xx.html for each country.
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

  // ---- storage: IndexedDB (pages and folder), survives the page changes ----
  const db = () => new Promise((res, rej) => {
    const r = indexedDB.open('nextplaate-dev', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const kvPut = async (k, v) => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = res; t.onerror = () => rej(t.error); }); };
  const kvGet = async k => { const d = await db(); return new Promise(res => { const r = d.transaction('kv').objectStore('kv').get(k); r.onsuccess = () => res(r.result); }); };
  const kvAll = async () => { const d = await db(); return new Promise(res => { const out = {}; const c = d.transaction('kv').objectStore('kv').openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); }; }); };

  // ---- panel ----
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483647;background:#fff;border:2px solid #31708f;border-radius:6px;padding:10px 12px;font:13px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.2);max-width:340px';
  box.innerHTML = '<div class="msg" style="margin-bottom:8px"></div>' +
    '<button id="cap-start">Capture all countries</button> ' +
    '<button id="cap-write">Write to folder</button> ' +
    '<button id="cap-go" hidden>Continue</button>';
  document.body.appendChild(box);
  const say = t => { box.querySelector('.msg').textContent = t; };
  const btn = id => box.querySelector('#' + id);

  // Write everything kept so far into the folder (one click, one folder choice)
  async function writeToFolder() {
    const pages = Object.entries(await kvAll()).filter(([k]) => k.startsWith('page:'));
    if (!pages.length) { say('Nothing captured yet.'); return; }
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    for (const [k, html] of pages) {
      const file = await dir.getFileHandle(k.slice(5) + '.html', { create: true });
      const w = await file.createWritable();
      await w.write(html);
      await w.close();
    }
    say(`Written ${pages.length} file(s) to the folder.`);
  }

  async function captured() {
    return Object.keys(await kvAll()).filter(k => k.startsWith('page:')).map(k => k.slice(5));
  }

  // One step: save this page if it is the current country, then go to the next one
  async function step() {
    const left = JSON.parse(sessionStorage.getItem(RUN) || 'null');
    if (!left) { say('NextPlaate dev: capture ready.'); return; }
    if (!left.length) {
      sessionStorage.removeItem(RUN);
      say('All countries captured. Click "Write to folder".');
      return;
    }
    if (CHALLENGE.test(document.title)) {
      say('Cloudflare check: solve it in this tab, then click Continue.');
      btn('cap-go').hidden = false;
      return;
    }
    const code = left[0];
    const m = location.pathname.match(/^\/([a-z]{2})\/add\/?$/i);
    await new Promise(r => setTimeout(r, LOAD_MS));
    if (m && m[1].toLowerCase() === code) {
      await kvPut('page:' + code, '<!-- ' + location.href + ' -->\n' + document.documentElement.outerHTML);
    } else {
      await kvPut('skip:' + code, location.href);                 // no upload page for this country
    }
    const rest = left.slice(1);
    sessionStorage.setItem(RUN, JSON.stringify(rest));
    say(`${code} done. ${rest.length} left. Next in ${PAUSE_MS / 1000} s…`);
    if (!rest.length) { sessionStorage.removeItem(RUN); say('All countries captured. Click "Write to folder".'); return; }
    setTimeout(() => { location.href = '/' + rest[0] + '/add'; }, PAUSE_MS);
  }

  btn('cap-start').onclick = async () => {
    const done = await captured();
    const left = COUNTRIES.filter(c => !done.includes(c));    // skip what is already kept
    if (!left.length) { say('Everything is already captured. Click "Write to folder".'); return; }
    sessionStorage.setItem(RUN, JSON.stringify(left));
    location.href = '/' + left[0] + '/add';
  };
  btn('cap-write').onclick = () => writeToFolder().catch(e => say('Could not write: ' + e.message));
  btn('cap-go').onclick = () => { btn('cap-go').hidden = true; step(); };
  step();
})();
