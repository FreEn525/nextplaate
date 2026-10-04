  /* =====================================================================
   *  PLATE CHECK  (on the upload page: how many photos of this plate are already on the site)
   *    The count is the site's own gallery search, read from the page title.
   *    When an upload tab checks its plate, the result is saved on its photo in the batch queue,
   *    so the batch window shows a warning on that card before anything is sent.
   * ===================================================================== */
  const countCache = new Map();   // search address -> number of photos, for this page
  const pending = new Map();      // search address -> the request in progress (same plate = one request)
  let rateLimited = false;        // the site answered "rate limited" (error 1015): a reload clears it

  const searchUrl = plate => `/${here.country}/gallery.php?gal=${here.country}&nomer=${encodeURIComponent(plate).replace(/%20/g, '+')}`;

  async function fetchCount(url) {
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(url, { credentials: 'same-origin', signal: ctrl.signal });
      const text = await res.text();
      if (res.status === 429 || /Error 1015|rate limited/i.test(text)) {
        rateLimited = true;
        throw new Error('the site limits the requests (error 1015): reload the page');
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      // the title reads "License plates found <b>N</b>" (the text depends on the account language)
      const num = new DOMParser().parseFromString(text, 'text/html').querySelector('.breadcrumbs h1 b');
      if (!num || !/^\s*\d+\s*$/.test(num.textContent)) throw new Error('no count on the page (Cloudflare check?)');
      log('plate count', url, '=' + num.textContent.trim());
      return +num.textContent;
    } finally { clearTimeout(timer); }
  }

  function countPlate(plate) {
    if (rateLimited) return Promise.reject(new Error('the site limits the requests (error 1015): reload the page'));
    const url = searchUrl(plate);
    if (countCache.has(url)) return Promise.resolve(countCache.get(url));
    if (pending.has(url)) return pending.get(url);
    const request = fetchCount(url)
      .then(n => { countCache.set(url, n); return n; })
      .finally(() => pending.delete(url));
    pending.set(url, request);
    return request;
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
    log('plate check', { manual, plate, country: here.country });
    if (!plate) { lastPlate = null; showResult('Type the plate in the form to check it.'); return; }
    if (!manual && (plate === lastPlate || store.get('autoCheck', '1') !== '1')) return;
    lastPlate = plate;
    showResult('Checking…');
    try {
      const n = await countPlate(plate);
      if (plateForForm() !== plate) return;                        // the plate changed meanwhile
      showResult(n ? `${n} photo${n > 1 ? 's' : ''} of this plate already on the site.` : 'Not on the site yet.', n ? 'warn' : 'ok');
      saveForBatch(plate, n);
    } catch (e) {
      showResult('Could not check: ' + e.message + '.', 'warn');
    }
  }

  // Checks when the user leaves a field, presses Enter, or changes the plate type: no polling
  let checkTimer = null;
  const later = ms => { clearTimeout(checkTimer); checkTimer = setTimeout(() => checkPlate(false), ms); };
  document.addEventListener('input', e => { if (here.add && isPlateField(e.target)) later(700); }, true);
  document.addEventListener('blur', e => { if (here.add && isPlateField(e.target)) later(0); }, true);
  document.addEventListener('change', e => { if (here.add && e.target.tagName === 'SELECT') later(0); }, true);

  registerFeature({
    groups: [{
      drawer: 'plate', title: 'Plate check', pages: ['add'],
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
      $('plateOpen').onclick = () => {
        const plate = plateForForm();
        if (plate) window.open(searchUrl(plate), '_blank');
      };
      checkPlate(false);
    }
  });
