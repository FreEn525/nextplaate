  /* =====================================================================
   *  BATCH UPLOAD
   *  U opens a window: add photos (or a folder), click photos to select them (blue), give the selection a
   *  country. "Start uploading" then opens ONE NEW TAB PER PHOTO, spaced out by a delay (Cloudflare-friendly).
   *  Each tab opens that country's /xx/add page, puts its photo in the form and opens the site's own
   *  "Upload through editor". You still crop / retouch / press Add / type the plate / send yourself.
   *  The photos live in IndexedDB (the files themselves) so every tab can read them; the original file
   *  is what gets uploaded, the previews are only for the window.
   * ===================================================================== */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const COUNTRIES = ('al:Albania|dz:Algeria|ad:Andorra|ar:Argentina|am:Armenia|au:Australia|at:Austria|az:Azerbaijan|bs:Bahamas|bh:Bahrain|by:Belarus|be:Belgium|ba:Bosnia and Herzegovina|br:Brazil|bg:Bulgaria|kh:Cambodia|ca:Canada|cl:Chile|cn:China|hr:Croatia|cy:Cyprus|cz:Czech Republic|dk:Denmark|eg:Egypt|ee:Estonia|fi:Finland|fr:France|ge:Georgia|de:Germany|gi:Gibraltar (UK)|gr:Greece|gu:Guam (USA)|gg:Guernsey (UK)|hk:Hong Kong (CN)|hu:Hungary|is:Iceland|id:Indonesia|ir:Iran|iq:Iraq|ie:Ireland|il:Israel|it:Italy|jp:Japan|je:Jersey (UK)|kz:Kazakhstan|ke:Kenya|kw:Kuwait|kg:Kyrgyzstan|la:Laos|lv:Latvia|li:Liechtenstein|lt:Lithuania|lu:Luxembourg|my:Malaysia|mt:Malta|mx:Mexico|md:Moldova|mc:Monaco|mn:Mongolia|me:Montenegro|ma:Morocco|nl:Netherlands|nz:New Zealand|mk:North Macedonia|mp:Northern Mariana Islands (USA)|no:Norway|ps:Palestinian Authority|pl:Poland|pt:Portugal|qa:Qatar|ro:Romania|ru:Russia|sm:San Marino|sa:Saudi Arabia|rs:Serbia|sc:Seychelles|sg:Singapore|sk:Slovakia|si:Slovenia|kr:South Korea|es:Spain|se:Sweden|ch:Switzerland|tj:Tajikistan|th:Thailand|tr:Turkey|ae:UAE|us:USA|su:USSR|ua:Ukraine|uk:United Kingdom|uz:Uzbekistan|va:Vatican|vn:Vietnam|ax:Åland (FI)|xx:Non-recognized and partially recognized states')
    .split('|').map(s => { const i = s.indexOf(':'); return { code: s.slice(0, i), name: s.slice(i + 1) }; });
  const cName = code => { const c = COUNTRIES.find(x => x.code === code); return c ? c.name : String(code).toUpperCase(); };
  const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2);

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
  const catsCache = {}; // code -> undefined (unknown) | null (loading) | [{v,l}]
  async function ensureCats(code) {
    if (!code || catsCache[code] !== undefined) return;
    try { const s = localStorage.getItem('pmg_cats_' + code); if (s) { catsCache[code] = JSON.parse(s); return; } } catch (e) {}
    catsCache[code] = null;
    try {
      const html = await (await fetch('/' + code + '/add', { credentials: 'same-origin' })).text();
      const sel = new DOMParser().parseFromString(html, 'text/html').querySelector('select[name="ctype"]');
      catsCache[code] = sel ? [...sel.options].map(o => ({ v: o.value, l: o.textContent.trim() })) : [];
      store.set('cats_' + code, JSON.stringify(catsCache[code]));
    } catch (e) { catsCache[code] = []; }
    if (managerOpen) queue.filter(q => q.country === code).forEach(refreshCard);
  }

