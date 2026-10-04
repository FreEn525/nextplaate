// ==UserScript==
// @name         NextPlaate dev: capture upload pages
// @namespace    nextplaate-dev
// @version      1.0
// @description  Development tool, not published. Saves the HTML of every /xx/add page into a folder you choose.
// @match        https://platesmania.com/*/add*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

// How it works:
//  1. Click "Capture all countries" once, and choose the folder (reference/real/countries).
//  2. The script opens /xx/add for each country in the list, one after the other, with a pause between them.
//  3. On each page it saves the HTML as xx.html in the folder, then goes to the next country.
//  4. It stops by itself on a Cloudflare check: solve it, then click "Continue".
//  Read-only: it only loads the upload pages. It never submits a form or types a plate.

(function () {
  'use strict';

  const COUNTRIES = ['ad', 'al', 'at', 'ba', 'be', 'bg', 'by', 'ch', 'cz', 'de', 'dk', 'dz', 'ee', 'es', 'fi', 'fr',
    'gg', 'gr', 'hr', 'hu', 'ie', 'is', 'it', 'lt', 'li', 'lu', 'lv', 'ma', 'md', 'me', 'mk', 'mt', 'nl', 'no', 'pl',
    'pt', 'ro', 'rs', 'ru', 'se', 'si', 'sk', 'tj', 'tr', 'ua', 'uk', 'uz'];
  const PAUSE_MS = 8000;
  const KEY = 'nextplaate-capture';                     // queue of countries left, in sessionStorage
  const CHALLENGE = /just a moment|attention required|checking your browser/i;

  // ---- folder handle, kept in IndexedDB between pages ----
  const idb = () => new Promise((res, rej) => {
    const r = indexedDB.open('nextplaate-dev', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const kvSet = async (k, v) => { const db = await idb(); return new Promise(res => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = res; }); };
  const kvGet = async k => { const db = await idb(); return new Promise(res => { const r = db.transaction('kv').objectStore('kv').get(k); r.onsuccess = () => res(r.result); }); };

  const queue = () => JSON.parse(sessionStorage.getItem(KEY) || 'null');
  const setQueue = q => (q ? sessionStorage.setItem(KEY, JSON.stringify(q)) : sessionStorage.removeItem(KEY));

  // ---- panel ----
  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483647;background:#fff;border:2px solid #31708f;border-radius:6px;padding:10px 12px;font:13px system-ui;box-shadow:0 4px 16px rgba(0,0,0,.2);max-width:320px';
  document.body.appendChild(box);
  const say = t => { box.querySelector('.msg').textContent = t; };
  box.innerHTML = '<div class="msg" style="margin-bottom:8px"></div><button id="cap-start">Capture all countries</button> <button id="cap-go" hidden>Continue</button>';
  box.querySelector('#cap-start').onclick = async () => {
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    await kvSet('dir', dir);
    setQueue(COUNTRIES.slice());
    location.href = '/' + COUNTRIES[0] + '/add';
  };
  box.querySelector('#cap-go').onclick = () => run(true);

  // ---- one page ----
  async function save(dir, code) {
    const html = '<!-- ' + location.href + ' -->\n' + document.documentElement.outerHTML;
    const file = await dir.getFileHandle(code + '.html', { create: true });
    const w = await file.createWritable();
    await w.write(html);
    await w.close();
  }

  async function run(userClick) {
    const q = queue();
    if (!q || !q.length) { say('Done. Files are in the folder you chose.'); setQueue(null); return; }
    const dir = await kvGet('dir');
    if (!dir) { say('No folder chosen yet. Click "Capture all countries".'); setQueue(null); return; }
    if (!userClick && (await dir.requestPermission({ mode: 'readwrite' })) !== 'granted') {
      say('Click "Continue" to allow writing in the folder.');
      box.querySelector('#cap-go').hidden = false;
      return;
    }
    if (CHALLENGE.test(document.title)) {
      say('Cloudflare check: solve it in this tab, then click Continue.');
      box.querySelector('#cap-go').hidden = false;
      return;
    }
    const code = q[0];
    const here = location.pathname.match(/^\/([a-z]{2})\/add\/?$/i);
    await new Promise(r => setTimeout(r, 2500));                     // let the page finish loading
    const rest = q.slice(1);
    if (!here || here[1].toLowerCase() !== code) {                   // no upload page for this country: skip it, never loop
      say(`No upload page for ${code}, skipped.`);
    } else {
      await save(dir, code);
      say(`Saved ${code}.html (${COUNTRIES.length - rest.length}/${COUNTRIES.length}). Next in 8 s…`);
    }
    setQueue(rest.length ? rest : null);
    if (!rest.length) { say('Done. All pages saved.'); return; }
    setTimeout(() => { location.href = '/' + rest[0] + '/add'; }, PAUSE_MS);
  }

  if (queue()) run(false);
  else say('NextPlaate dev: capture ready.');
})();
