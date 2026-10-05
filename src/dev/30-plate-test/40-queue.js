  // Fills the missing plates of every country, one after the other (same pauses and resume as the other runs)
  // The categories of a country from the search page kept by the capture (no request to the site); null if not kept
  function ptTypesKept(cc, all) {
    const html = all['search:' + cc];
    if (!html) return null;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const sel = doc.querySelector('select[name="ctype"]');
    if (!sel) return null;
    return [...sel.options].filter(o => o.value).map(o => ({ code: o.value, label: o.textContent.trim() }));
  }

  // Only the countries that still have a category without a confirmed plate go in the run.
  // The check reads the search page of each country (one request each), so the upload pages are not opened for nothing.
  async function ptStartFill() {
    const all = await capAll();
    const dbAll = Object.keys(all).filter(k => k.startsWith('db:')).map(k => all[k]);
    const todo = [];
    for (const cc of CAPTURE_COUNTRIES) {
      if (all['plates-skip:' + cc]) continue;                    // no upload page for this country
      const types = ptTypesKept(cc, all);
      if (!types) { todo.push(cc); continue; }                   // no saved search page: it stays in the run
      const confirmed = new Set(dbAll.filter(r => r.country === cc && (r.count > 0 || r.source === 'gallery')).map(r => r.category));
      if (types.some(t => !confirmed.has(t.label))) todo.push(cc);
    }
    ptMsg(`${todo.length} countries have a category without a confirmed plate (of ${CAPTURE_COUNTRIES.length}).`);
    if (!todo.length) { ptMsg('Every category of every country has a confirmed plate. Nothing to fill.'); return; }
    sessionStorage.setItem(PT_MODE, 'fill');
    sessionStorage.setItem(PT_QUEUE, JSON.stringify(todo));
    location.href = '/' + todo[0] + '/add';
  }

  // Runs the countries that still need a test. "onlyMissing": keep the countries that fully passed.
  // "all": start again from zero (use it after a change that affects every country).
  // Every plate type of every country: same loop, one country after the other, saved as types:xx
  // Every country again: the earlier results are replaced, and the database saves the searches already made
  // Only the countries that still have a failure in the last saved run (or were never tested)
  async function ptStartTypes() {
    const kept = await capAll();
    const failing = c => {
      const t = kept['types:' + c];
      if (!t) return true;
      return Object.values(t.types || {}).some(x => x.error || (x.rows || []).some(r => r.fits && !r.ok));
    };
    const left = CAPTURE_COUNTRIES.filter(c => failing(c) && !kept['plates-skip:' + c]);
    if (!left.length) { ptMsg('No country has a failure in the last run. Nothing to test.'); return; }
    sessionStorage.setItem(PT_MODE, 'types');
    sessionStorage.setItem(PT_QUEUE, JSON.stringify(left));
    location.href = '/' + left[0] + '/add';
  }

  async function ptStart(all) {
    sessionStorage.setItem(PT_MODE, 'regular');
    const kept = await capAll();
    const d = await capDb();
    const drop = Object.keys(kept).filter(k => k.startsWith('plates:') || k.startsWith('plates-skip:'))
      .filter(k => all || !(k.startsWith('plates:') && kept[k].passed === kept[k].total && kept[k].total > 0));
    await new Promise(res => {
      const t = d.transaction('kv', 'readwrite'), store = t.objectStore('kv');
      drop.forEach(k => store.delete(k));
      t.oncomplete = res;
    });
    const done = new Set(Object.keys(kept).filter(k => k.startsWith('plates:') && !drop.includes(k)).map(k => k.slice(7)));
    const left = CAPTURE_COUNTRIES.filter(c => !done.has(c) && !(kept['plates-skip:' + c] && !all));
    if (!left.length) { ptMsg('Every country already passes. Click "Write report to folder".'); return; }
    sessionStorage.setItem(PT_QUEUE, JSON.stringify(left));
    location.href = '/' + left[0] + '/add';
  }

