  /* =====================================================================
   *  GOOGLE LENS, ON THE GOOGLE SIDE  (the same script, opened by the Lens group of the panel; the job 'lens' of lib/bridge.js)
   *    Two steps, on the two pages Google shows:
   *      1. the page the panel opened (the marker in the address): the photo of the request goes into the "paste an image link" box
   *         of Google's search by image, and the search starts, the way the box is used by hand;
   *      2. the results page that follows (within three minutes of the request): the answer is { similar, titles }. similar = what
   *         Google itself calls the vehicle (the "similar searches" chips: links with a thumbnail whose address carries the query and a
   *         knowledge-graph id), titles = the titles of the results (links, headings, image descriptions). The panel compares both
   *         with its menus, and gives more weight to what Google names.
   *    A Google page the panel did not ask for is left alone. On any Google page the script stops here: no panel, no other feature.
   *    Only function declarations: this runs from core/00-open.js, before the rest of the script is set up.
   * ===================================================================== */
  function lensMarkedUrl() { return 'https://www.google.com/?olud&src=pm'; }

  // Logs of the dev build only
  function lensLog(...args) { if ('__DEBUG__' === '1') console.log('[NextPlaate] Lens (Google side)', ...args); }

  function onLensPage() {
    try {
      const u = new URL(location.href);
      return /^www\.google\./.test(u.hostname) && u.searchParams.has('olud') && u.searchParams.get('src') === 'pm';
    } catch (e) { return false; }
  }

  // What Google names: the text of the query of each similar-search chip (Lens links them with a knowledge-graph id or a Lens surface
  // and a thumbnail). Works in any language: it reads the address, not the words of the page.
  function lensSimilar() {
    const out = [];
    document.querySelectorAll('a[href*="q="]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (!/[?&](kgmid|lns_surface)=/.test(href) || !a.querySelector('img')) return;
      let q = '';
      try { q = (new URL(href, location.href).searchParams.get('q') || '').replace(/\+/g, ' ').trim(); } catch (e) { return; }
      if (q && !out.some(x => x.toLowerCase() === q.toLowerCase()) && out.length < 8) out.push(q);
    });
    return out;
  }

  // Step 2: the answer, once the page has the results (it fills in after loading)
  function lensReadResults() {
    const request = bridgePending('lens', 180);
    const results = /^lens\.google\./.test(location.hostname) || /^\/search/.test(location.pathname);
    lensLog('results page?', { results, asked: !!request, url: location.href });
    if (!results || !request) return;
    const collect = () => {
      const out = [];
      document.querySelectorAll('a[href], [role="heading"], h1, h2, h3, img[alt]').forEach(el => {
        const t = (el.getAttribute('aria-label') || el.getAttribute('alt') || el.textContent || '').replace(/\s+/g, ' ').trim();
        if (t.length >= 8 && t.length <= 200 && !out.includes(t) && out.length < 150) out.push(t);
      });
      return out;
    };
    let tries = 0;
    const timer = setInterval(() => {
      const titles = collect(), similar = lensSimilar();
      tries++;
      // the results are there (titles); Google's own naming comes with them or a little later (about 6 s more), else it is left out
      const ready = titles.length >= 12 && (similar.length || tries >= 12);
      if (!ready && tries <= 40) return;                    // up to about 20 s for the results to appear
      clearInterval(timer);
      lensLog('found', { titles: titles.length, similar }, titles.slice(0, 5));
      if (titles.length || similar.length) bridgeAnswer('lens', request, { similar, titles });
    }, 500);
  }

  // Step 1 (and the entry for both): Google's own markup. The jsname values are the ones of the box and the search button today,
  // the other selectors are a fallback.
  function lensOnGoogle() {
    lensLog('Google page', location.href, 'asked by the panel:', onLensPage());
    if (!onLensPage()) { lensReadResults(); return; }
    let done = false, tries = 0;
    const first = (...sel) => sel.map(s => document.querySelector(s)).find(Boolean);
    const attempt = () => {
      if (done) return;
      const request = bridgePending('lens', 180);
      const photo = request ? request.payload.photo : '';
      const box = first('input[jsname="W7hAGe"]', 'input.cB9M7', 'input[type="text"]');
      const go = first('div[role="button"][jsname="ZtOxCb"]', 'button[type="submit"]', 'button, div[role="button"]');
      if (tries % 20 === 0) lensLog('looking for the box', { photo: photo.length, box: !!box, button: !!go, tries });
      if (!photo || !box || !go) return;
      done = true;
      lensLog('photo put in the box, search started', { box: box.outerHTML.slice(0, 120) });
      box.focus();
      box.value = photo;
      box.dispatchEvent(new Event('input', { bubbles: true }));
      box.dispatchEvent(new Event('change', { bubbles: true }));
      go.click();
      // when the click did nothing, Enter in the box does the same
      setTimeout(() => box.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', which: 13, keyCode: 13 })), 400);
    };
    const timer = setInterval(() => { if (done || tries++ > 120) clearInterval(timer); else attempt(); }, 150);   // about 18 s
    attempt();
  }
