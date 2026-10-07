// ==UserScript==
// @name         NextPlaate Auto-like (add-on)
// @namespace    nextplaate
// @version      1.0.1
// @author       NextEnzzo (https://platesmania.com/user121559)
// @copyright    2026, NextEnzzo
// @license      MIT
// @description  Optional add-on of NextPlaate: likes the photos of a gallery page, or of several pages in a row. It joins the NextPlaate panel (Browse); it needs NextPlaate.
// @match        https://platesmania.com/*
// @match        https://*.platesmania.com/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/FreEn525/nextplaate/main/addons/nextplaate-autolike.user.js
// @downloadURL  https://raw.githubusercontent.com/FreEn525/nextplaate/main/addons/nextplaate-autolike.user.js
// ==/UserScript==

/* =====================================================================
 *  AUTO-LIKE  (add-on of NextPlaate: docs/ADDONS.md)
 *    Each photo of a gallery has <i id="unit_ul{ID}" class="fa fa-heart-o rating" onclick="...">. Only hearts that are still empty
 *    (fa-heart-o) are clicked, each at most once: a photo you already liked can never be un-liked by mistake.
 *    "Pages to like" above 1: the run is kept in localStorage, the script likes the page, goes to the next one and resumes after each
 *    page load until the pages are done. A run is dropped if it goes stale (60 s without progress), if you leave the gallery it started
 *    on, or if you stop it (the button, L or Esc).
 *    It joins the panel of NextPlaate by its public hooks: the event "pmg-ready" on the document, the element #pmg-host (open shadow
 *    root) with its Browse section [data-drawer="gallery"], and the attribute data-pmg-busy on <html> (which keeps the page keys of
 *    NextPlaate still while a run is going). It shares nothing else with it; its own settings are kept under pmgx_autolike_*.
 * ===================================================================== */
(function () {
  'use strict';
  if (window.__nextplaateAutolike) return;
  window.__nextplaateAutolike = true;

  const MAX_PAGES = 50;
  const HEART = 'i.rating.fa-heart-o[id^="unit_ul"]', ANY_HEART = 'i.rating[id^="unit_ul"]';
  const gallery = /\/gallery(\.php)?$/i.test(location.pathname) || /\/user\d+\/?$/i.test(location.pathname);
  const get = (k, d) => { try { const v = localStorage.getItem('pmgx_autolike_' + k); return v === null ? d : v; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem('pmgx_autolike_' + k, v); } catch (e) { /* no storage: the run does not survive a page */ } };
  const getRun = () => { try { return JSON.parse(get('run', 'null')); } catch (e) { return null; } };
  const setRun = r => put('run', r ? JSON.stringify(r) : 'null');
  const busy = on => (on ? document.documentElement.setAttribute('data-pmg-busy', 'Auto-like') : document.documentElement.removeAttribute('data-pmg-busy'));

  const clicked = new Set();
  let liking = false, stopping = false, ui = null;

  const h = (tag, props, ...kids) => {
    const el = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => { if (k === 'text') el.textContent = v; else if (k === 'class') el.className = v; else if (k === 'for') el.htmlFor = v; else if (/^on[a-z]+$/.test(k)) el.addEventListener(k.slice(2), v); else el[k] = v; });
    kids.flat().forEach(c => { if (c) el.append(c); });
    return el;
  };
  // Same gallery = same address without the page number
  const galleryKey = () => { const p = new URLSearchParams(location.search); p.delete('start'); return location.pathname + '?' + [...p.entries()].map(([k, v]) => k + '=' + v).sort().join('&'); };
  const hearts = () => [...document.querySelectorAll(HEART)].filter(el => !clicked.has(el.id));
  const pages = () => Math.min(MAX_PAGES, Math.max(1, parseInt(ui ? ui.pages.value : get('pages', '1'), 10) || 1));
  const delay = () => Math.max(100, parseInt(ui ? ui.delay.value : get('delay', '200'), 10) || 200);
  const say = text => { if (ui) { ui.status.textContent = text; ui.status.hidden = !text; } };          // no empty box when there is nothing to say

  // Address of the next page of the gallery (the active <li> of the pagination, then the one after it), or null on the last page
  function nextHref() {
    const ul = document.querySelector('ul.pagination');
    if (!ul) return null;
    const items = [...ul.children].filter(li => li.tagName === 'LI');
    const i = items.findIndex(li => li.classList.contains('active'));
    const a = i < 0 ? null : items[i + 1] && items[i + 1].querySelector('a');
    const href = a && a.getAttribute('href');
    if (!a || !href || href === '#' || /^javascript:/i.test(href) || a.href.split('#')[0] === location.href.split('#')[0]) return null;
    return a.href;
  }

  function button() {
    if (!ui) return;
    const b = ui.button, r = getRun();
    if (liking) return;
    if (r) { b.disabled = false; b.textContent = `Stop auto-like (page ${r.done + 1}/${r.total}) (L)`; return; }
    const n = hearts().length, many = pages();
    if (!gallery) { b.disabled = true; b.textContent = 'Like this page'; return; }
    if (many > 1) { b.disabled = !document.querySelector(ANY_HEART); b.textContent = `Like ${many} pages from this one (L)`; return; }
    b.disabled = n === 0;
    b.textContent = n ? `Like ${n} photo${n > 1 ? 's' : ''} on this page (L)` : 'No photos to like on this page';
  }

  // Likes every empty heart of the page; returns how many were clicked
  async function likePage(label) {
    const list = hearts();
    let done = 0;
    for (const el of list) {
      if (stopping) break;
      if (ui) ui.button.textContent = `Stop (${label}${done + 1}/${list.length})`;
      clicked.add(el.id);
      el.click();
      done++;
      await new Promise(r => setTimeout(r, delay()));
    }
    return done;
  }

  function cancel(message) {
    setRun(null);
    if (liking) stopping = true; else busy(false);
    button();
    if (message) say(message);
  }

  // One step of a run over several pages: like this page, then go to the next one (or finish)
  async function step() {
    const r = getRun();
    if (!r) return;
    liking = true; stopping = false; busy(true);
    const done = await likePage(`page ${r.done + 1}/${r.total} · `);
    const stopped = stopping;
    liking = false; stopping = false;
    if (stopped || !getRun()) { setRun(null); busy(false); button(); say(`Stopped on page ${r.done + 1}. ${r.liked + done} photo${r.liked + done > 1 ? 's' : ''} liked.`); return; }
    r.done += 1; r.liked += done; r.ts = Date.now();
    const href = nextHref();
    if (r.done >= r.total || !href) {
      setRun(null); busy(false); button();
      say(r.done >= r.total ? `Done: ${r.liked} photo${r.liked > 1 ? 's' : ''} liked over ${r.done} page${r.done > 1 ? 's' : ''}.` : `Reached the last page after ${r.done} page${r.done > 1 ? 's' : ''}: ${r.liked} liked.`);
      return;
    }
    setRun(r);
    button();
    say(`Page ${r.done}/${r.total} done (${r.liked} liked). Next page...`);
    setTimeout(() => { if (getRun()) location.href = href; }, 700);          // let the last like request finish before leaving the page
  }

  async function start() {
    if (!gallery) return;
    if (liking || getRun()) { cancel('Auto-like stopped.'); return; }       // a second click is a stop
    if (pages() > 1) { setRun({ total: pages(), done: 0, liked: 0, key: galleryKey(), ts: Date.now() }); step(); return; }
    if (!hearts().length) { say('Nothing left to like on this page.'); return; }
    liking = true; stopping = false; busy(true);
    const done = await likePage('');
    const stopped = stopping;
    liking = false; stopping = false; busy(false);
    button();
    say(stopped ? `Stopped after ${done} like${done > 1 ? 's' : ''}.` : `Liked ${done} photo${done > 1 ? 's' : ''}.`);
  }

  // A run over several pages resumes by itself after each page load
  function resume() {
    const r = getRun();
    if (!r) return;
    if (Date.now() - (r.ts || 0) >= 60000 || r.key !== galleryKey() || !document.querySelector(ANY_HEART)) { setRun(null); busy(false); button(); return; }
    busy(true);
    say(`Auto-like: page ${r.done + 1}/${r.total}...`);
    setTimeout(() => { if (getRun()) step(); }, 600);                        // a short pause so the page is fully loaded
  }

  // The box in the Browse drawer of the NextPlaate panel, in its own look (the panel's styles reach it: it is inside the panel)
  function join() {
    const host = document.getElementById('pmg-host'), section = host && host.shadowRoot && host.shadowRoot.querySelector('section[data-drawer="gallery"]');
    if (!section || section.querySelector('#alBox')) return !!section;
    ui = {
      button: h('button', { type: 'button', class: 'btn ghost', disabled: true, text: 'Like this page', onclick: start }),
      pages: h('input', { type: 'number', id: 'alPages', min: 1, max: MAX_PAGES, step: 1, value: get('pages', '1') }),
      delay: h('input', { type: 'number', id: 'alDelay', min: 100, step: 50, value: get('delay', '200') }),
      status: h('p', { class: 'presult', text: '', hidden: true })
    };
    ui.pages.addEventListener('input', () => { put('pages', ui.pages.value); button(); });
    ui.delay.addEventListener('input', () => put('delay', ui.delay.value));
    section.append(h('div', { class: 'group', id: 'alBox' },
      h('div', { class: 'gbody' },
        h('p', { class: 'gabout', text: 'Like this page, or several pages in a row, with a pause between likes. An add-on of NextPlaate.' }),
        gallery ? null : h('p', { class: 'pnote', text: 'Works on a gallery page.' }),
        ui.button,
        h('div', { class: 'row' }, h('label', { for: 'alPages', text: 'Pages to like' }), ui.pages),
        h('div', { class: 'row' }, h('label', { for: 'alDelay', text: 'Delay between likes (ms)' }), ui.delay),
        ui.status),
      h('div', { class: 'gtitle', text: 'Auto-like' })));
    host.addEventListener('mouseenter', button);                              // pages can load photos lazily
    button();
    return true;
  }

  // L likes (or stops), Esc stops: never while typing, and never with a modifier
  document.addEventListener('keydown', e => {
    const t = e.composedPath ? e.composedPath()[0] : e.target;                // inside the panel's shadow root the target seen from here is its host
    const typing = t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
    if (e.code === 'Escape' && (liking || getRun())) { cancel('Auto-like stopped.'); return; }
    if (e.code !== 'KeyL' || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || typing || !gallery) return;
    if (liking || getRun() || hearts().length || (pages() > 1 && document.querySelector(ANY_HEART))) { e.preventDefault(); start(); }
    else if (document.querySelector(ANY_HEART)) { e.preventDefault(); say('Nothing left to like on this page.'); }
  }, true);

  // Join the panel when it stands (the event), or now if it already does; a run of several pages resumes either way
  if (!join()) {
    document.addEventListener('pmg-ready', join, { once: true });
    let tries = 0;
    const wait = setInterval(() => { if (join() || ++tries > 40) clearInterval(wait); }, 250);   // the event may have come before this script
  }
  resume();
})();
