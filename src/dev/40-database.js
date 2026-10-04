  /* =====================================================================
   *  DEV DATABASE  (dev build only: never sent to the users)
   *    Keeps what the script learned, for later: the plates seen per country and category, with their
   *    count on the site, and a log of every request to the site (time, address, answer, block).
   *    Only the plate, the country, the category, the count and the date are kept: no names, no photos.
   * ===================================================================== */
  // One entry per plate per country and category; the last count seen wins
  function dbAddPlate(cc, category, shown, read, count) {
    const key = 'db:' + cc + '|' + category + '|' + ptNorm(shown);
    capPut(key, { country: cc, category, plate: shown, read, count, date: new Date().toISOString() }).catch(() => {});
  }

  // Every request to the site, kept one by one (called by the shared request queue)
  function devLog(entry) {
    capPut('log:' + Date.now() + ':' + Math.random().toString(36).slice(2, 8), { at: new Date().toISOString(), ...entry }).catch(() => {});
  }

  // Exports the database and the request log, in the folder you choose
  async function dbExport() {
    const all = await capAll();
    const plates = Object.keys(all).filter(k => k.startsWith('db:')).map(k => all[k]);
    const log = Object.keys(all).filter(k => k.startsWith('log:')).sort().map(k => all[k]);
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    for (const [name, data] of [['plates-db.json', plates], ['request-log.json', log]]) {
      const file = await dir.getFileHandle(name, { create: true });
      const w = await file.createWritable();
      await w.write(JSON.stringify(data, null, 2));
      await w.close();
    }
    return { plates: plates.length, requests: log.length };
  }
