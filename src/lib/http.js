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
  const SITE_BLOCK_RE = /Error 1015|rate limited|just a moment|attention required|cf-challenge|checking your browser/i;

  // Resolves with the text of the page. Rejects with a clear message when the site asks to wait.
  function siteFetch(url) {
    if (Date.now() < siteBlockedUntil()) {
      const mins = Math.ceil((siteBlockedUntil() - Date.now()) / 60000);
      return Promise.reject(new Error(`the site asked to wait: try again in about ${mins} min`));
    }
    return new Promise((resolve, reject) => { siteQueue.push({ url, resolve, reject }); pumpSite(); });
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
      try {
        const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), SITE_TIMEOUT_MS);
        const res = await fetch(job.url, { credentials: 'same-origin', signal: ctrl.signal });
        clearTimeout(timer);
        const text = await res.text();
        const blocked = res.status === 429 || SITE_BLOCK_RE.test(text);
        if (typeof devLog === 'function') devLog({ url: job.url, status: res.status, blocked, bytes: text.length });   // dev build only
        if (blocked) {
          store.set('siteBlock', String(Date.now()));
          job.reject(new Error('the site asked to wait (check or rate limit)'));
          while (siteQueue.length) siteQueue.shift().reject(new Error('the site asked to wait (check or rate limit)'));
          break;
        }
        if (!res.ok) job.reject(new Error('HTTP ' + res.status));
        else job.resolve(text);
      } catch (e) {
        job.reject(new Error(e.name === 'AbortError' ? 'the site did not answer in time' : e.message));
      }
    }
    siteBusy = false;
  }
