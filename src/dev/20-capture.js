  /* =====================================================================
   *  CAPTURE  (dev only: keeps the upload and search pages of every country, then writes them to a folder)
   *    Opens /xx/add (or /xx/search) for each country, one after the other, keeps each page in the browser
   *    (IndexedDB), and writes them to a folder you choose. Read-only: no form, no plate typed.
   * ===================================================================== */
  const CAPTURE_COUNTRIES = ['ad', 'al', 'at', 'ba', 'be', 'bg', 'by', 'ch', 'cz', 'de', 'dk', 'dz', 'ee', 'es', 'fi', 'fr',
    'gg', 'gr', 'hr', 'hu', 'ie', 'is', 'it', 'lt', 'li', 'lu', 'lv', 'ma', 'md', 'me', 'mk', 'mt', 'nl', 'no', 'pl',
    'pt', 'ro', 'rs', 'ru', 'se', 'si', 'sk', 'tj', 'tr', 'ua', 'uk', 'uz'];
  const CAPTURE_PAUSE_MS = 4000;     // between two countries
  const CAPTURE_LOAD_MS = 1500;      // let a page finish before keeping it
  const CAPTURE_RUN = 'nextplaate-capture';        // the countries left in the run (sessionStorage)
  const CAPTURE_KIND = 'nextplaate-capture-kind';  // 'add' (upload pages) or 'search' (search pages)
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
  const capKind = () => (sessionStorage.getItem(CAPTURE_KIND) === 'search' ? 'search' : 'add');
  const capSay = t => { const el = $('capMsg'); if (el) el.textContent = t; };

  // Keys in the database: page:xx (upload) and search:xx (search); skip:xx / skipsearch:xx when there is no such page
  const capKeys = kind => kind === 'search'
    ? { page: c => 'search:' + c, skip: c => 'skipsearch:' + c }
    : { page: c => 'page:' + c, skip: c => 'skip:' + c };
  const capPath = (kind, code) => '/' + code + (kind === 'search' ? '/search' : '/add');

  // What is kept, what is missing, what has no such page, for one kind
  async function capSummary(kind) {
    const all = await capAll();
    const k = capKeys(kind);
    return {
      all,
      saved: CAPTURE_COUNTRIES.filter(c => all[k.page(c)]),
      skipped: CAPTURE_COUNTRIES.filter(c => all[k.skip(c)]),
      missing: CAPTURE_COUNTRIES.filter(c => !all[k.page(c)] && !all[k.skip(c)])
    };
  }

  async function capCheck() {
    const up = await capSummary('add'), se = await capSummary('search');
    capSay(`Upload pages kept: ${up.saved.length}/${CAPTURE_COUNTRIES.length}` +
      (up.missing.length ? `  (missing: ${up.missing.join(' ')})` : '') +
      (up.skipped.length ? `\nNo upload page: ${up.skipped.join(' ')}` : '') +
      `\nSearch pages kept: ${se.saved.length}/${CAPTURE_COUNTRIES.length}` +
      (se.missing.length ? `  (missing: ${se.missing.join(' ')})` : '') +
      (se.skipped.length ? `\nNo search page: ${se.skipped.join(' ')}` : ''));
  }

  // Writes every kept page and an index into the folder you choose (one choice, one click)
  async function capWrite() {
    const up = await capSummary('add'), se = await capSummary('search');
    const files = [
      ...up.saved.map(c => ({ name: c + '.html', html: up.all['page:' + c] })),
      ...se.saved.map(c => ({ name: 'search-' + c + '.html', html: se.all['search:' + c] }))
    ];
    if (!files.length) { capSay('Nothing captured yet.'); return; }
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    const failed = [];
    for (const f of files) {                                      // one file at a time: an error does not stop the rest
      try {
        const file = await dir.getFileHandle(f.name, { create: true });
        const w = await file.createWritable();
        await w.write(f.html);
        await w.close();
      } catch (e) { failed.push(f.name + ' (' + e.name + ')'); }
    }
    if (failed.length) { capSay('Not written: ' + failed.join(', ') + '. Click "Write to folder" again.'); return; }
    const index = {
      date: new Date().toISOString(),
      upload: { saved: up.saved, skipped: up.skipped, missing: up.missing },
      search: { saved: se.saved, skipped: se.skipped, missing: se.missing }
    };
    const idx = await dir.getFileHandle('index.json', { create: true });
    const w = await idx.createWritable();
    await w.write(JSON.stringify(index, null, 2));
    await w.close();
    capSay(`Written ${files.length} file(s) and index.json to the folder.`);
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
    const kind = capKind(), code = left[0], k = capKeys(kind);
    const m = location.pathname.match(kind === 'search' ? /^\/([a-z]{2})\/search\/?$/i : /^\/([a-z]{2})\/add\/?$/i);
    await new Promise(r => setTimeout(r, CAPTURE_LOAD_MS));
    if (!capRunning()) { capSay('Stopped.'); return; }
    if (m && m[1].toLowerCase() === code) {
      await capPut(k.page(code), '<!-- ' + location.href + ' -->\n' + document.documentElement.outerHTML);
    } else {
      await capPut(k.skip(code), location.href);                  // no such page for this country
    }
    const rest = left.slice(1);
    sessionStorage.setItem(CAPTURE_RUN, JSON.stringify(rest));
    $('capStop').hidden = false;
    capSay(`${kind} ${code} kept. ${rest.length} left. Next in ${CAPTURE_PAUSE_MS / 1000} s…`);
    if (!rest.length) { sessionStorage.removeItem(CAPTURE_RUN); await capCheck(); return; }
    setTimeout(() => {
      if (!capRunning()) { capSay('Stopped.'); return; }          // Stop was clicked during the pause
      location.href = capPath(kind, rest[0]);
    }, CAPTURE_PAUSE_MS);
  }

  async function capStart(kind) {
    const s = await capSummary(kind), k = capKeys(kind);
    const left = CAPTURE_COUNTRIES.filter(c => !s.all[k.page(c)] && !s.all[k.skip(c)]);
    if (!left.length) { capSay(`Every ${kind} page is already kept. Click "Write to folder".`); return; }
    sessionStorage.setItem(CAPTURE_KIND, kind);
    sessionStorage.setItem(CAPTURE_RUN, JSON.stringify(left));
    location.href = capPath(kind, left[0]);
  }

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Capture',
      build: () => [
        h('p', { id: 'capMsg', class: 'presult', text: 'Keeps the upload and search pages of every country.' }),
        h('button', { id: 'capStart', class: 'btn ghost', text: 'Capture upload pages' }),
        h('button', { id: 'capStartSearch', class: 'btn ghost', text: 'Capture search pages' }),
        h('div', { class: 'btnrow' },
          h('button', { id: 'capStop', class: 'btn ghost', hidden: true, text: 'Stop' }),
          h('button', { id: 'capCheck', class: 'btn ghost', text: 'Check' })),
        h('button', { id: 'capWrite', class: 'btn ghost', text: 'Write to folder' }),
        h('button', { id: 'capGo', class: 'btn ghost', hidden: true, text: 'Continue' })
      ]
    }],
    init: () => {
      $('capStart').onclick = () => capStart('add');
      $('capStartSearch').onclick = () => capStart('search');
      $('capStop').onclick = () => { sessionStorage.removeItem(CAPTURE_RUN); $('capStop').hidden = true; capSay('Stopped. Start again to resume, or "Check".'); };
      $('capCheck').onclick = () => capCheck();
      $('capWrite').onclick = () => capWrite().catch(e => capSay('Could not write: ' + e.message));
      $('capGo').onclick = () => { $('capGo').hidden = true; capStep(); };
      $('capStop').hidden = !capRunning();
      capStep();
    }
  });
