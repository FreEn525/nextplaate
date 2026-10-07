  /* =====================================================================
   *  SITE REQUESTS  (every request to PlatesMania goes through here)
   *    One request at a time, with a pause between two of them. If the site answers with a Cloudflare
   *    check or the rate limit (error 1015), every request stops for a while, and the state is kept
   *    in the browser so the next page knows it too.
   * ===================================================================== */
  const SITE_GAP_MS = 3000;                 // between two requests to the site
  const SITE_COOLDOWN_MS = 15 * 60 * 1000;  // after a block: no request for this long
  const SITE_TIMEOUT_MS = 15000;
  const siteQueue = [];
  let siteBusy = false, siteLast = 0;
  const siteSleep = ms => new Promise(r => setTimeout(r, ms));
  const siteBlockedUntil = () => (+store.get('siteBlock', '0') || 0) + SITE_COOLDOWN_MS;
  const SITE_SLOW_MS = 3000;                // a request or a page slower than this: the site is slow
  const siteLog = [];                       // what the last requests say about the site: { ms, kind: 'ok' | 'error' | 'timeout' | 'down' | 'blocked' }
  const siteNote = (began, kind) => { siteLog.push({ ms: Math.round(performance.now() - began), kind }); if (siteLog.length > 12) siteLog.shift(); window.dispatchEvent(new Event('pmg-site')); };
  const SITE_BLOCK_RE = /Error 1015|rate limited|just a moment|attention required|cf-challenge|checking your browser/i;

  // Resolves with the text of the page. Rejects with a clear message when the site asks to wait.
  // timeout: how long the site may take to answer (a long table, such as the regions of a country, needs more than a gallery count)
  function siteFetch(url, timeout = SITE_TIMEOUT_MS) {
    if (Date.now() < siteBlockedUntil()) {
      const mins = Math.ceil((siteBlockedUntil() - Date.now()) / 60000);
      return Promise.reject(new Error(`the site asked to wait: try again in about ${mins} min`));
    }
    return new Promise((resolve, reject) => { siteQueue.push({ url, timeout, resolve, reject }); pumpSite(); });
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
      const job = siteQueue.shift();
      const wait = siteLast + SITE_GAP_MS - Date.now();
      if (wait > 0) await siteSleep(wait);
      siteLast = Date.now();
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
          store.set('siteBlock', String(Date.now()));
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
