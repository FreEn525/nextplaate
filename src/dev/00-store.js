  /* =====================================================================
   *  DEV STORE  (dev build only: what the dev tools keep in the browser, in IndexedDB 'nextplaate-dev')
   *    keys: page:xx search:xx (captured pages), skip:xx skipsearch:xx (no such page), plates:xx types:xx (test
   *    results), db:... (plates seen), log:... (requests to the site), fill:xx (fill log)
   * ===================================================================== */
  // Same database name as the earlier capture script: the pages already kept stay available
  const capDb = () => new Promise((res, rej) => {
    const r = indexedDB.open('nextplaate-dev', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const capPut = async (k, v) => { const d = await capDb(); return new Promise((res, rej) => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = res; t.onerror = () => rej(t.error); }); };
  // The saved pages are 3 MB each (96 upload + 96 search pages): reading all the values at once fills the browser's memory
  // ("Out of Memory"). So: capList() gives the keys only, capGet(key) one value, capAll(...prefixes) only the entries whose key
  // starts with one of the prefixes (the small ones: 'db:', 'plates:', 'types:', 'empty:', 'plates-skip:'). Never capAll() alone.
  const capList = async () => { const d = await capDb(); return new Promise((res, rej) => { const r = d.transaction('kv').objectStore('kv').getAllKeys(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); };
  const capGet = async k => { const d = await capDb(); return new Promise((res, rej) => { const r = d.transaction('kv').objectStore('kv').get(k); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); };
  const capAll = async (...prefixes) => {
    if (!prefixes.length) throw new Error('capAll needs prefixes: it must not read the saved pages');
    const d = await capDb();
    const out = {};
    for (const prefix of prefixes) {
      await new Promise((res, rej) => {
        const c = d.transaction('kv').objectStore('kv').openCursor(IDBKeyRange.bound(prefix, prefix + '\uffff'));
        c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(); };
        c.onerror = () => rej(c.error);
      });
    }
    return out;
  };
  const capDel = async k => { const d = await capDb(); return new Promise((res, rej) => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').delete(k); t.oncomplete = res; t.onerror = () => rej(t.error); }); };
