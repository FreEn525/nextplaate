  // Collect only: the plates of the galleries for every category that has no confirmed plate, with no page change and
  // no typing. One request per category (the shared queue: one at a time, 3 s apart, pause after a block). The plates are
  // read by the script later, offline (tests/offline/check_db.py), on the saved upload pages: so no upload page is opened.
  // Up to PT_PER_CATEGORY plates per category: they come from the same gallery page, so more plates cost no extra request.
  const PT_PER_CATEGORY = 3;
  let ptCollectStop = false;

  async function ptCollectAll() {
    const small = await capAll('db:', 'empty:');
    const dbAll = Object.keys(small).filter(k => k.startsWith('db:')).map(k => small[k]);
    const todo = [];
    for (const cc of TEST_COUNTRIES) {
      const types = ptTypesKept(cc, await capGet('search:' + cc));   // one saved page at a time
      // a category can only be proved on a form that has a type menu, and the search page must be kept
      if (!types || !types.length || !/id="(ctype|drop_2)"/.test(await capGet('page:' + cc) || '')) continue;
      const confirmed = new Set(dbAll.filter(r => r.country === cc && (r.count > 0 || r.source === 'gallery')).map(r => r.category));
      for (const t of types) if (!confirmed.has(t.label) && !small['empty:' + cc + '|' + t.label]) todo.push({ cc, ...t });
    }
    if (!todo.length) { ptMsg('Nothing to collect: every category has a plate or an empty gallery.'); return; }
    ptCollectStop = false;
    $('ptCollectStop').hidden = false;
    let done = 0, plates = 0, empty = 0, errors = 0, paused = false;
    for (const t of todo) {
      if (ptCollectStop) break;
      ptMsg(`Collecting ${done + 1} of ${todo.length}: ${t.cc.toUpperCase()}, ${t.label}…  (${plates} plates so far)`);
      let texts;
      try { texts = await ptGalleryType(t.cc, t.code); }
      catch (e) {
        if (/asked to wait|rate limit/.test(e.message)) { paused = true; break; }   // the site asked to stop: click again later
        errors++; done++; continue;
      }
      if (!texts.length) { await capPut('empty:' + t.cc + '|' + t.label, { country: t.cc, category: t.label, date: new Date().toISOString() }); empty++; }
      for (const text of texts.slice(0, PT_PER_CATEGORY)) { dbAddPlate(t.cc, t.label, text, '', null, 'gallery'); plates++; }
      done++;
    }
    $('ptCollectStop').hidden = true;
    const left = todo.length - done;
    ptMsg((paused ? 'Paused: the site asked to wait. ' : ptCollectStop ? 'Stopped. ' : 'Finished. ') +
      `${plates} plates in ${done - empty - errors} categories, ${empty} empty galleries, ${errors} errors, ${left} left. ` +
      (left ? 'Click Collect again later: it carries on where it stopped.' : 'Now write the database to a folder (Database box).'));
  }
