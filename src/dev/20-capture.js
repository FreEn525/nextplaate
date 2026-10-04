  /* =====================================================================
   *  CAPTURE  (dev only: keeps the upload page of every country, then writes them to a folder)
   *    Opens /xx/add for each country, one after the other, keeps each page in the browser
   *    (IndexedDB), and writes them to a folder you choose. Read-only: no form, no plate typed.
   * ===================================================================== */
  const CAPTURE_COUNTRIES = ['ad', 'al', 'at', 'ba', 'be', 'bg', 'by', 'ch', 'cz', 'de', 'dk', 'dz', 'ee', 'es', 'fi', 'fr',
    'gg', 'gr', 'hr', 'hu', 'ie', 'is', 'it', 'lt', 'li', 'lu', 'lv', 'ma', 'md', 'me', 'mk', 'mt', 'nl', 'no', 'pl',
    'pt', 'ro', 'rs', 'ru', 'se', 'si', 'sk', 'tj', 'tr', 'ua', 'uk', 'uz'];
  const CAPTURE_PAUSE_MS = 4000;     // between two countries
  const CAPTURE_LOAD_MS = 1500;      // let a page finish before keeping it
  const CAPTURE_RUN = 'nextplaate-capture';   // the run in progress (sessionStorage)
  const CHALLENGE = /just a moment|attention required|checking your browser/i;

  // Same database name as the earlier capture script: the pages already kept stay available
  const capDb = () => new Promise((res, rej) => {
    const r = indexedDB.open('nextplaate-dev', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const capPut = async (k, v) => { const d = await capDb(); return new Promise((res, rej) => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = res; t.onerror = () => rej(t.error); }); };
  const capAll = async () => { const d = await capDb(); return new Promise(res => { const out = {}; const c = d.transaction('kv').objectStore('kv').openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); }; }); };
  const capRunning = () => sessionStorage.getItem(CAPTURE_RUN) !== null;
  const capSay = t => { const el = $('capMsg'); if (el) el.textContent = t; };

  // What is kept, what is missing, what has no upload page
  async function capSummary() {
    const all = await capAll();
    return {
      all,
      saved: CAPTURE_COUNTRIES.filter(c => all['page:' + c]),
      skipped: CAPTURE_COUNTRIES.filter(c => all['skip:' + c]),
      missing: CAPTURE_COUNTRIES.filter(c => !all['page:' + c] && !all['skip:' + c])
    };
  }

  async function capCheck() {
    const s = await capSummary();
    capSay(`Kept: ${s.saved.length}/${CAPTURE_COUNTRIES.length}\n` +
      (s.missing.length ? `Missing: ${s.missing.join(' ')}\n` : 'Nothing missing.\n') +
      (s.skipped.length ? `No upload page: ${s.skipped.join(' ')}` : ''));
    return s;
  }

  // Writes the kept pages and an index into the folder you choose (one choice, one click)
  async function capWrite() {
    const s = await capSummary();
    if (!s.saved.length) { capSay('Nothing captured yet.'); return; }
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    const failed = [];
    for (const c of s.saved) {                                    // one file at a time: an error does not stop the rest
      try {
        const file = await dir.getFileHandle(c + '.html', { create: true });
        const w = await file.createWritable();
        await w.write(s.all['page:' + c]);
        await w.close();
      } catch (e) { failed.push(c + ' (' + e.name + ')'); }
    }
    if (failed.length) { capSay('Not written: ' + failed.join(', ') + '. Click "Write to folder" again.'); return; }
    const idx = await dir.getFileHandle('index.json', { create: true });
    const w = await idx.createWritable();
    await w.write(JSON.stringify({ date: new Date().toISOString(), saved: s.saved, skipped: s.skipped, missing: s.missing }, null, 2));
    await w.close();
    capSay(`Written ${s.saved.length} file(s) and index.json to the folder.`);
  }

  // One step: keep this page if it is the current country, then go to the next one
  async function capStep() {
    const left = JSON.parse(sessionStorage.getItem(CAPTURE_RUN) || 'null');
    if (!left) return;
    if (!left.length) { sessionStorage.removeItem(CAPTURE_RUN); await capCheck(); return; }
    if (CHALLENGE.test(document.title)) {
      capSay('Cloudflare check: solve it in this tab, then click Continue.');
      $('capGo').hidden = false;
      return;
    }
    const code = left[0];
    const m = location.pathname.match(/^\/([a-z]{2})\/add\/?$/i);
    await new Promise(r => setTimeout(r, CAPTURE_LOAD_MS));
    if (!capRunning()) { capSay('Stopped.'); return; }
    if (m && m[1].toLowerCase() === code) {
      await capPut('page:' + code, '<!-- ' + location.href + ' -->\n' + document.documentElement.outerHTML);
    } else {
      await capPut('skip:' + code, location.href);               // no upload page for this country
    }
    const rest = left.slice(1);
    sessionStorage.setItem(CAPTURE_RUN, JSON.stringify(rest));
    $('capStop').hidden = false;
    capSay(`${code} kept. ${rest.length} left. Next in ${CAPTURE_PAUSE_MS / 1000} s…`);
    if (!rest.length) { sessionStorage.removeItem(CAPTURE_RUN); await capCheck(); return; }
    setTimeout(() => {
      if (!capRunning()) { capSay('Stopped.'); return; }          // Stop was clicked during the pause
      location.href = '/' + rest[0] + '/add';
    }, CAPTURE_PAUSE_MS);
  }

  async function capStart() {
    const s = await capSummary();
    const left = CAPTURE_COUNTRIES.filter(c => !s.all['page:' + c] && !s.all['skip:' + c]);
    if (!left.length) { capSay('Everything is already kept. Click "Write to folder".'); return; }
    sessionStorage.setItem(CAPTURE_RUN, JSON.stringify(left));
    location.href = '/' + left[0] + '/add';
  }

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Capture',
      build: () => [
        h('p', { id: 'capMsg', class: 'presult', text: 'Keeps the upload page of every country.' }),
        h('button', { id: 'capStart', class: 'btn ghost', text: 'Capture all countries' }),
        h('div', { class: 'btnrow' },
          h('button', { id: 'capStop', class: 'btn ghost', hidden: true, text: 'Stop' }),
          h('button', { id: 'capCheck', class: 'btn ghost', text: 'Check' })),
        h('button', { id: 'capWrite', class: 'btn ghost', text: 'Write to folder' }),
        h('button', { id: 'capGo', class: 'btn ghost', hidden: true, text: 'Continue' })
      ]
    }],
    init: () => {
      $('capStart').onclick = capStart;
      $('capStop').onclick = () => { sessionStorage.removeItem(CAPTURE_RUN); $('capStop').hidden = true; capSay('Stopped. Click "Capture all countries" to resume, or "Check".'); };
      $('capCheck').onclick = () => capCheck();
      $('capWrite').onclick = () => capWrite().catch(e => capSay('Could not write: ' + e.message));
      $('capGo').onclick = () => { $('capGo').hidden = true; capStep(); };
      $('capStop').hidden = !capRunning();
      capStep();
    }
  });
