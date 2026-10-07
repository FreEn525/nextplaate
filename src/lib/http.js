  /* =====================================================================
   *  SITE REQUESTS  (every request to PlatesMania goes through here)
   *    One request at a time, with a pause between two of them (kept across the tabs: they share the pace). What you asked for goes
   *    first; the background ones (plate pictures, more notifications, the look for news: opts.low) wait their turn, six seconds apart.
   *    If the site answers with a Cloudflare check or the rate limit (error 1015), every request stops for a while (3 minutes; blocked
   *    again within the hour: 10, then 20), and the state is kept in the browser so the next page knows it too. siteResume() lifts the
   *    pause, for a button the user presses.
   * ===================================================================== */
  const SITE_GAP_MS = 3000;                 // between two requests to the site
  const SITE_LOW_GAP_MS = 6000;             // between two background requests
  const SITE_COOLDOWNS_MIN = [3, 10, 20];   // after a block: no request for this long; blocked again within the hour: the next one
  const SITE_TIMEOUT_MS = 15000;
  const siteQueue = [];
  let siteBusy = false, siteLast = 0;
  const siteSleep = ms => new Promise(r => setTimeout(r, ms));
  const siteBlockedUntil = () => {
    const at = +store.get('siteBlock', '0') || 0, n = Math.min(3, Math.max(1, +store.get('siteBlockN', '1') || 1));
    return at ? at + SITE_COOLDOWNS_MIN[n - 1] * 60000 : 0;
  };
  const siteResume = () => { store.set('siteBlock', '0'); window.dispatchEvent(new Event('pmg-site')); };   // the user decides to try now
  const SITE_SLOW_MS = 3000;                // a request or a page slower than this: the site is slow
  const siteLog = [];                       // what the last requests say about the site: { ms, kind: 'ok' | 'error' | 'timeout' | 'down' | 'blocked' }
  const siteNote = (began, kind) => { siteLog.push({ ms: Math.round(performance.now() - began), kind }); if (siteLog.length > 12) siteLog.shift(); window.dispatchEvent(new Event('pmg-site')); };
  const SITE_BLOCK_RE = /Error 1015|rate limited|just a moment|attention required|cf-challenge|checking your browser/i;

  // Resolves with the text of the page. Rejects with a clear message when the site asks to wait.
  // timeout: how long the site may take to answer (a long table, such as the regions of a country, needs more than a gallery count)
  function siteFetch(url, timeout = SITE_TIMEOUT_MS, opts = {}) {
    if (Date.now() < siteBlockedUntil()) {
      const mins = Math.ceil((siteBlockedUntil() - Date.now()) / 60000);
      return Promise.reject(new Error(`the site asked to wait: try again in about ${mins} min`));
    }
    if (opts.low && siteHealth().level === 'bad') return Promise.reject(new Error('the site is struggling: left for later'));      // a background request never adds to it
    return new Promise((resolve, reject) => { siteQueue.push({ url, timeout, low: !!opts.low, resolve, reject }); pumpSite(); });
  }

  // How the site is doing, from what we already see (no request of its own): paused (it asked us to wait), bad (the last requests failed),
  // slow (the usual answer takes more than 3 s: our last requests, or this page before there are any), ok, or unknown
  function siteHealth() {
    const until = siteBlockedUntil();
    if (Date.now() < until) return { level: 'paused', text: `Paused until ${new Date(until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: the site asked to wait.` };
    const recent = siteLog.slice(-5), failed = recent.filter(x => x.kind !== 'ok');
    if (recent.length >= 2 && (failed.length >= 3 || recent.slice(-2).every(x => x.kind !== 'ok'))) return { level: 'bad', text: `The site is not answering well (${[...new Set(failed.map(x => x.kind))].join(', ')} in the last requests).` };
    const times = siteLog.filter(x => x.kind === 'ok').slice(-8).map(x => x.ms).sort((a, b) => a - b);
    const nav = performance.getEntriesByType('navigation')[0];
    const first = nav ? Math.round(nav.responseStart - nav.requestStart) : 0;
    const ms = times.length >= 2 ? times[Math.floor(times.length / 2)] : first;
    if (!ms) return { level: 'unknown', text: 'No measure of the site yet.' };
    return { level: ms > SITE_SLOW_MS ? 'slow' : 'ok', text: `The site ${ms > SITE_SLOW_MS ? 'is slow' : 'is answering'}: about ${ms} ms (${times.length >= 2 ? 'your last requests' : 'this page'}).` };
  }

  // The number a gallery page announces in its title ("License plates found 38.723"): the site writes thousands with a dot (or a
  // comma, or a space, depending on the language of the account). Throws when the page has no such number.
  function siteCount(doc) {
    const num = doc.querySelector('.breadcrumbs h1 b');
    const t = num ? num.textContent.trim() : '';
    if (!/^\d{1,3}(?:[.,\s  ]\d{3})+$|^\d+$/.test(t)) throw new Error('no count on the page');
    return +t.replace(/\D/g, '');
  }

  async function pumpSite() {
    if (siteBusy) return;
    siteBusy = true;
    while (siteQueue.length) {
      let at = siteQueue.findIndex(j => !j.low);                                   // what the user asked for first, the background ones after
      if (at < 0) at = 0;
      const job = siteQueue.splice(at, 1)[0];
      const wait = Math.max(siteLast, +store.get('siteLastAt', '0') || 0) + (job.low ? SITE_LOW_GAP_MS : SITE_GAP_MS) - Date.now();   // the pace of the other tabs counts too
      if (wait > 0) await siteSleep(wait);
      if (job.low && siteQueue.some(j => !j.low)) { siteQueue.unshift(job); continue; }                    // something more urgent came in while waiting
      siteLast = Date.now();
      store.set('siteLastAt', String(siteLast));
      const began = performance.now();
      try {
        const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), job.timeout);
        const res = await fetch(job.url, { credentials: 'same-origin', signal: ctrl.signal });
        clearTimeout(timer);
        const text = await res.text();
        const blocked = res.status === 429 || SITE_BLOCK_RE.test(text);
        if (typeof devLog === 'function') devLog({ url: job.url, status: res.status, blocked, bytes: text.length });   // dev build only
        siteNote(began, blocked ? 'blocked' : res.status >= 500 ? 'error' : 'ok');         // a 404 is an answer: the site is there
        if (blocked) {
          const now = Date.now(), before = +store.get('siteBlock', '0') || 0;
          store.set('siteBlockN', String(now - before < 3600000 ? Math.min(3, (+store.get('siteBlockN', '1') || 1) + 1) : 1));     // blocked again within the hour: a longer pause
          store.set('siteBlock', String(now));
          window.dispatchEvent(new Event('pmg-site'));                                             // the dot turns grey at once, not at the next request
          job.reject(new Error('the site asked to wait (check or rate limit)'));
          while (siteQueue.length) siteQueue.shift().reject(new Error('the site asked to wait (check or rate limit)'));
          break;
        }
        if (!res.ok) job.reject(new Error('HTTP ' + res.status));
        else job.resolve(text);
      } catch (e) {
        siteNote(began, e.name === 'AbortError' ? 'timeout' : 'down');
        job.reject(new Error(e.name === 'AbortError' ? `the site did not answer in ${Math.round(job.timeout / 1000)} s` : e.message));
      }
    }
    siteBusy = false;
  }
