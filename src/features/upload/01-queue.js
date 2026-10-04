  /* =====================================================================
   *  BATCH UPLOAD
   *  U opens a window: add photos (or a folder), click photos to select them (blue), give the selection a
   *  country. "Start uploading" then opens ONE NEW TAB PER PHOTO, spaced out by a delay (Cloudflare-friendly).
   *  Each tab opens that country's /xx/add page, puts its photo in the form and opens the site's own
   *  "Upload through editor". You still crop / retouch / press Add / type the plate / send yourself.
   *  The photos live in IndexedDB (the files themselves) so every tab can read them; the original file
   *  is what gets uploaded, the previews are only for the window.
   * ===================================================================== */

  // ---- storage of the queue (IndexedDB: holds the photo files themselves) ----
  let _db = null;
  const idbOpen = () => _db ? Promise.resolve(_db) : new Promise((res, rej) => {
    const r = indexedDB.open('pmg-batch', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('q', { keyPath: 'id' });
    r.onsuccess = () => { _db = r.result; res(_db); };
    r.onerror = () => rej(r.error);
  });
  const idbDo = async (mode, fn) => {
    const db = await idbOpen();
    return new Promise((res, rej) => {
      const t = db.transaction('q', mode), r = fn(t.objectStore('q'));
      t.oncomplete = () => res(r && r.result);
      t.onerror = t.onabort = () => rej(t.error);
    });
  };
  const qAll = () => idbDo('readonly', s => s.getAll()).then(a => (a || []).sort((x, y) => x.order - y.order));
  const qGet = id => idbDo('readonly', s => s.get(id));
  const qPut = it => idbDo('readwrite', s => s.put(it));
  const qDel = id => idbDo('readwrite', s => s.delete(id));
  const qClear = () => idbDo('readwrite', s => s.clear());

  // ---- run state of THIS tab (sessionStorage): { active, current, pendingSubmit, ts } ----
  // Every tab opened by "Start uploading" works on its own photo
  const getBatch = () => { try { return JSON.parse(sessionStorage.getItem('pmg_batch') || 'null'); } catch (e) { return null; } };
  const setBatch = b => { try { sessionStorage.setItem('pmg_batch', b ? JSON.stringify(b) : 'null'); } catch (e) {} };

  let queue = [];
  const sel = new Set();   // photos picked in the manager (shown in blue)
  let managerOpen = false, lastIdx = -1;
  const loadMine = () => { try { const a = JSON.parse(store.get('mine', 'null')); if (Array.isArray(a) && a.length) return a; } catch (e) {} return ['lu', 'de', 'fr']; };
  let mine = loadMine();
  let brush = store.get('brush', '');
  if (!brush || !mine.includes(brush)) brush = mine[0];

  const isOpenable = q => q.status === 'pending' || q.status === 'opened';           // can be (re)loaded into an upload tab
  const isFinished = q => q.status === 'done' || q.status === 'submitted';
  const pl = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const readyCount = () => queue.filter(q => q.status === 'pending' && q.country).length;

  // ---- plate categories of each country (learned from that country's own /xx/add page) ----
  // A failed or Cloudflare-blocked load is NOT remembered as "no categories": it is tried again after a cooldown.
  const catsCache = {}; // code -> undefined (unknown) | null (loading, so callers share one request) | [{v,l}]
  const catsFailedAt = {}; // code -> time of the last failed try
  async function ensureCats(code) {
    if (!code || catsCache[code] !== undefined) return;
    if (catsFailedAt[code] && Date.now() - catsFailedAt[code] < 60000) return;
    try { const s = store.get('cats_' + code, ''); if (s) { catsCache[code] = JSON.parse(s); return; } } catch (e) {}
    catsCache[code] = null;
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 10000); // never wait forever
    try {
      const res = await fetch('/' + code + '/add', { credentials: 'same-origin', signal: ctrl.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const sel = new DOMParser().parseFromString(await res.text(), 'text/html').querySelector('select[name="ctype"]');
      if (!sel) throw new Error('no category list on the page (Cloudflare check?)');
      catsCache[code] = [...sel.options].map(o => ({ v: o.value, l: o.textContent.trim() }));
      store.set('cats_' + code, JSON.stringify(catsCache[code]));
    } catch (e) {
      delete catsCache[code]; catsFailedAt[code] = Date.now();
    } finally { clearTimeout(timer); }
    if (managerOpen) queue.filter(q => q.country === code).forEach(refreshCard);
  }

