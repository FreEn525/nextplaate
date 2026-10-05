  /* =====================================================================
   *  DEV DATABASE  (dev build only: never sent to the users)
   *    Keeps what the script learned, for later: the plates seen per country and category, with their
   *    count on the site, and a log of every request to the site (time, address, answer, block).
   *    Only the plate, the country, the category, the count and the date are kept: no names, no photos.
   * ===================================================================== */
  // One entry per plate per country and category; the last count seen wins
  function dbAddPlate(cc, category, shown, read, count, source) {
    const key = 'db:' + cc + '|' + category + '|' + ptNorm(shown);
    capPut(key, { country: cc, category, plate: shown, read, count, source: source || 'search', date: new Date().toISOString() }).catch(() => {});
  }

  // Every request to the site, kept one by one (called by the shared request queue)
  function devLog(entry) {
    capPut('log:' + Date.now() + ':' + Math.random().toString(36).slice(2, 8), { at: new Date().toISOString(), ...entry }).catch(() => {});
  }

  // Exports the database and the request log, in the folder you choose
  async function dbExport() {
    const all = await capAll('db:', 'log:', 'empty:', 'verify:', 'unreadable:');
    const plates = Object.keys(all).filter(k => k.startsWith('db:')).map(k => all[k]);
    const log = Object.keys(all).filter(k => k.startsWith('log:')).sort().map(k => all[k]);
    const empty = Object.keys(all).filter(k => k.startsWith('empty:')).sort().map(k => all[k]);   // categories whose gallery has no plate
    const unreadable = Object.keys(all).filter(k => k.startsWith('unreadable:')).sort().map(k => all[k]);   // plates exist but their text is not in the list
    const verify = Object.keys(all).filter(k => k.startsWith('verify:')).sort().map(k => all[k]);   // what the site said about each read (Verify the reads)
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    for (const [name, data] of [['plates-db.json', plates], ['request-log.json', log], ['empty-categories.json', empty], ['verify-results.json', verify], ['unreadable-categories.json', unreadable]]) {
      const file = await dir.getFileHandle(name, { create: true });
      const w = await file.createWritable();
      await w.write(JSON.stringify(data, null, 2));
      await w.close();
    }
    return { plates: plates.length, requests: log.length, empty: empty.length, verify: verify.length, unreadable: unreadable.length };
  }

  // Loads plates-db.json (and empty-categories.json) back into this browser, for a browser whose database is empty or
  // behind the files. An entry already here is kept (it may be newer): only the missing ones are added.
  async function dbImport(files) {
    const known = new Set(await capList());
    let added = 0, kept = 0;
    for (const file of files) {
      const rows = JSON.parse(await file.text());
      if (!Array.isArray(rows)) throw new Error(file.name + ' is not a list');
      for (const r of rows) {
        const key = r.plate !== undefined
          ? 'db:' + r.country + '|' + r.category + '|' + ptNorm(r.plate)
          : 'empty:' + r.country + '|' + r.category;
        if (known.has(key)) { kept++; continue; }
        await capPut(key, r);
        known.add(key);
        added++;
      }
    }
    return { added, kept };
  }

  async function dbCounts() {
    const keys = await capList();
    return `${keys.filter(k => k.startsWith('db:')).length} plates, ${keys.filter(k => k.startsWith('empty:')).length} empty categories`;
  }

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Database',
      build: () => [
        h('p', { id: 'dbMsg', class: 'presult', text: 'Plates the tools have seen, kept in this browser.' }),
        h('button', { id: 'dbImport', class: 'btn ghost', text: 'Load plates-db.json into this browser' }),
        h('input', { id: 'dbFile', type: 'file', accept: '.json', multiple: true, hidden: true }),
        h('button', { id: 'dbExport', class: 'btn ghost', text: 'Write the database to a folder' })
      ]
    }],
    init: () => {
      const say = t => { $('dbMsg').textContent = t; };
      const show = (before = '') => dbCounts().then(t => say(before + 'In this browser: ' + t + '.'), () => {});
      $('dbImport').onclick = () => $('dbFile').click();
      $('dbFile').onchange = () => {
        const files = [...$('dbFile').files];
        $('dbFile').value = '';
        if (!files.length) return;
        dbImport(files).then(r => show(`Loaded: ${r.added} added, ${r.kept} already here. `), e => say('Could not load: ' + e.message));
      };
      $('dbExport').onclick = () => dbExport().then(r => say(`Written: ${r.plates} plates, ${r.empty} empty categories, ${r.unreadable} unreadable, ${r.verify} checked reads, ${r.requests} requests.`), e => say('Could not write: ' + e.message));
      show();
    }
  });
