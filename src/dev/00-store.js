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
  const capAll = async () => { const d = await capDb(); return new Promise(res => { const out = {}; const c = d.transaction('kv').objectStore('kv').openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); }; }); };
  const capDel = async k => { const d = await capDb(); return new Promise((res, rej) => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').delete(k); t.oncomplete = res; t.onerror = () => rej(t.error); }); };
