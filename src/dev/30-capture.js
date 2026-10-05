  /* =====================================================================
   *  CAPTURE  (dev only: keeps the upload and search pages of every country, then writes them to a folder)
   *    Opens /xx/add (or /xx/search) for each country, one after the other, keeps each page in the browser
   *    (IndexedDB), and writes them to a folder you choose. Read-only: no form, no plate typed.
   * ===================================================================== */
  // Countries with a captured upload page: the plate tests run on these. Add a code here once its page is kept.
  const TEST_COUNTRIES = ['ad', 'al', 'at', 'ba', 'be', 'bg', 'by', 'ch', 'cz', 'de', 'dk', 'dz', 'ee', 'es', 'fi', 'fr',
    'gg', 'gr', 'hr', 'hu', 'ie', 'is', 'it', 'lt', 'li', 'lu', 'lv', 'ma', 'md', 'me', 'mk', 'mt', 'nl', 'no', 'pl',
    'pt', 'ro', 'rs', 'ru', 'se', 'si', 'sk', 'tj', 'tr', 'ua', 'uk', 'uz'];
  // Every country of the site: the capture tries each one and records the ones that have no such page (skip:xx)
  const SITE_CODES = COUNTRIES.map(c => c.code);
  const CAPTURE_PAUSE_MS = 4000;     // between two countries
  const CAPTURE_LOAD_MS = 1500;      // let a page finish before keeping it
  const CAPTURE_RUN = 'nextplaate-capture';        // the countries left in the run (sessionStorage)
  const CAPTURE_KIND = 'nextplaate-capture-kind';  // 'add' (upload pages) or 'search' (search pages)
  const CHALLENGE = /just a moment|attention required|checking your browser/i;

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
      saved: SITE_CODES.filter(c => all[k.page(c)]),
      skipped: SITE_CODES.filter(c => all[k.skip(c)]),
      missing: SITE_CODES.filter(c => !all[k.page(c)] && !all[k.skip(c)])
    };
  }

  async function capCheck() {
    const up = await capSummary('add'), se = await capSummary('search');
    capSay(`Upload pages kept: ${up.saved.length}/${SITE_CODES.length}` +
      (up.missing.length ? `  (missing: ${up.missing.join(' ')})` : '') +
      (up.skipped.length ? `\nNo upload page: ${up.skipped.join(' ')}` : '') +
      `\nSearch pages kept: ${se.saved.length}/${SITE_CODES.length}` +
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
      upload: { saved: up.saved, skipped: up.skipped, missing: up.missing, why: Object.fromEntries(up.skipped.map(c => [c, up.all['skip:' + c]])) },
      search: { saved: se.saved, skipped: se.skipped, missing: se.missing, why: Object.fromEntries(se.skipped.map(c => [c, se.all['skipsearch:' + c]])) }
    };
    const idx = await dir.getFileHandle('index.json', { create: true });
    const w = await idx.createWritable();
    await w.write(JSON.stringify(index, null, 2));
    await w.close();
    capSay(`Written ${files.length} file(s) and index.json to the folder.`);
  }

  // End of a run: the next kind if "Capture everything" asked for it, else the summary
  async function capFinish() {
    sessionStorage.removeItem(CAPTURE_RUN);
    const then = sessionStorage.getItem(CAPTURE_THEN);
    sessionStorage.removeItem(CAPTURE_THEN);
    if (then) { await capStart(then); return; }
    await capCheck();
  }

  // One step: keep this page if it is the current country, then go to the next one
  async function capStep() {
    const left = JSON.parse(sessionStorage.getItem(CAPTURE_RUN) || 'null');
    if (!left) return;
    if (!left.length) { await capFinish(); return; }
    if (CHALLENGE.test(document.title)) {
      capSay('Cloudflare check: solve it in this tab, then click Continue.');
      $('capGo').hidden = false;
      return;
    }
    const kind = capKind(), code = left[0], k = capKeys(kind);
    const m = location.pathname.match(kind === 'search' ? /^\/([a-z]{2})\/search\/?$/i : /^\/([a-z]{2})\/add\/?$/i);
    await new Promise(r => setTimeout(r, CAPTURE_LOAD_MS));
    if (!capRunning()) { capSay('Stopped.'); return; }
    // A server error or a rate limit is not "no such page": keep the country in the run and wait for the user
    const status = (performance.getEntriesByType('navigation')[0] || {}).responseStatus || 0;
    if (status === 429 || status >= 500 || /error 1015|rate limit|temporarily unavailable|service unavailable/i.test(document.title)) {
      capSay(`The site answered with an error (${status || document.title}). Wait a little, then click Continue: ${code} is tried again.`);
      $('capGo').hidden = false;
      return;
    }
    // a real page has the plate type menu (#ctype) or, for an upload page, the upload form (#frm: the Netherlands has no type menu)
    if (m && m[1].toLowerCase() === code && (document.getElementById('ctype') || (kind === 'add' && document.getElementById('frm')))) {
      await capPut(k.page(code), '<!-- ' + location.href + ' -->\n' + document.documentElement.outerHTML);
    } else {
      await capPut(k.skip(code), location.href + ' | ' + status + ' | ' + document.title);   // no such page for this country
    }
    const rest = left.slice(1);
    sessionStorage.setItem(CAPTURE_RUN, JSON.stringify(rest));
    $('capStop').hidden = false;
    capSay(`${kind} ${code} kept. ${rest.length} left. Next in ${CAPTURE_PAUSE_MS / 1000} s…`);
    if (!rest.length) { await capFinish(); return; }
    setTimeout(() => {
      if (!capRunning()) { capSay('Stopped.'); return; }          // Stop was clicked during the pause
      location.href = capPath(kind, rest[0]);
    }, CAPTURE_PAUSE_MS);
  }

  const CAPTURE_THEN = 'nextplaate-capture-then';   // 'search': once the upload pages are kept, go on with the search pages

  async function capStart(kind, then) {
    const s = await capSummary(kind), k = capKeys(kind);
    const left = SITE_CODES.filter(c => !s.all[k.page(c)] && !s.all[k.skip(c)]);
    if (!left.length) {
      if (then) return capStart(then);                              // nothing left of this kind: the next kind
      capSay(`Every ${kind} page is already kept. Click "Write to folder".`); return;
    }
    if (then) sessionStorage.setItem(CAPTURE_THEN, then); else sessionStorage.removeItem(CAPTURE_THEN);
    sessionStorage.setItem(CAPTURE_KIND, kind);
    sessionStorage.setItem(CAPTURE_RUN, JSON.stringify(left));
    location.href = capPath(kind, left[0]);
  }

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Capture',
      build: () => [
        h('p', { id: 'capMsg', class: 'presult', text: 'Keeps the upload and search pages of every country of the site (one request every few seconds). Then write them to a folder.' }),
        h('button', { id: 'capAll', class: 'btn', text: 'Capture everything missing' }),
        h('div', { class: 'btnrow' },
          h('button', { id: 'capStart', class: 'btn ghost', text: 'Upload pages' }),
          h('button', { id: 'capStartSearch', class: 'btn ghost', text: 'Search pages' })),
        h('div', { class: 'btnrow' },
          h('button', { id: 'capStop', class: 'btn ghost', hidden: true, text: 'Stop' }),
          h('button', { id: 'capCheck', class: 'btn ghost', text: 'Check' })),
        h('button', { id: 'capWrite', class: 'btn ghost', text: 'Write to folder' }),
        h('button', { id: 'capRetry', class: 'btn ghost', text: 'Forget the "no page" marks and capture again' }),
        h('button', { id: 'capGo', class: 'btn ghost', hidden: true, text: 'Continue' })
      ]
    }],
    init: () => {
      $('capAll').onclick = () => capStart('add', 'search');
      $('capStart').onclick = () => capStart('add');
      $('capStartSearch').onclick = () => capStart('search');
      $('capStop').onclick = () => { sessionStorage.removeItem(CAPTURE_RUN); $('capStop').hidden = true; capSay('Stopped. Start again to resume, or "Check".'); };
      $('capCheck').onclick = () => capCheck();
      $('capRetry').onclick = async () => {
        const keys = Object.keys(await capAll()).filter(k => k.startsWith('skip:') || k.startsWith('skipsearch:'));
        for (const k of keys) await capDel(k);
        capStart('add', 'search');
      };
      $('capWrite').onclick = () => capWrite().catch(e => capSay('Could not write: ' + e.message));
      $('capGo').onclick = () => { $('capGo').hidden = true; capStep(); };
      $('capStop').hidden = !capRunning();
      capStep();
    }
  });
