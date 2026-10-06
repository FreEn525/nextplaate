  /* =====================================================================
   *  GOOGLE LENS, ON THE GOOGLE SIDE  (the same script, opened by the Lens group of the panel)
   *    The panel saves the photo (a public address, or the photo itself for one not published yet) with GM_setValue and opens
   *    https://www.google.com/?olud&src=pm. This code runs on that Google page only: it puts the photo in the "paste an image
   *    link" box of Google's search by image and starts the search, the way the box is used by hand.
   *    Then, on the results page that follows (within three minutes of the panel's search), it writes down the titles of the results
   *    (links, headings, image descriptions) for the panel, which compares them with its brand and model menus. A Google page the
   *    panel did not ask for is left alone. On any Google page the script stops here: no panel, no other feature.
   * ===================================================================== */
  // Only function declarations here: they run from core/00-open.js, before the rest of the script has set anything up
  function lensMarkedUrl() { return 'https://www.google.com/?olud&src=pm'; }

  // Logs of the dev build only; a function declaration like the others here (the script has not set up its own log yet)
  function lensLog(...args) { if ('__DEBUG__' === '1') console.log('[NextPlaate] Lens (Google side)', ...args); }

  function onLensPage() {
    try {
      const u = new URL(location.href);
      return /^www\.google\./.test(u.hostname) && u.searchParams.has('olud') && u.searchParams.get('src') === 'pm';
    } catch (e) { return false; }
  }

  // Google's own markup: the jsname values are the ones of the box and the search button today, the others are a fallback
  // The results of the search the panel asked for: the titles, once the page has them (it fills in after loading)
  function lensReadResults() {
    const asked = GM_getValue('lens_pending', 0);
    const results = /^lens\.google\./.test(location.hostname) || /^\/search/.test(location.pathname);
    lensLog('results page?', { results, asked: !!asked, ageSeconds: asked ? Math.round((Date.now() - asked) / 1000) : null, done: GM_getValue('lens_done', 0) === asked, url: location.href });
    if (!results || !asked || Date.now() - asked > 180000 || GM_getValue('lens_done', 0) === asked) return;
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
      const titles = collect();
      if (titles.length < 12 && ++tries <= 40) return;      // up to about 20 s for the results to appear
      clearInterval(timer);
      lensLog('titles found', titles.length, titles.slice(0, 5));
      if (!titles.length) return;
      GM_setValue('lens_titles', JSON.stringify({ at: asked, titles }));
      GM_setValue('lens_done', asked);
    }, 500);
  }

  function lensOnGoogle() {
    lensLog('Google page', location.href, 'asked by the panel:', onLensPage());
    if (!onLensPage()) { lensReadResults(); return; }
    let done = false, tries = 0;
    const first = (...sel) => sel.map(s => document.querySelector(s)).find(Boolean);
    const attempt = () => {
      if (done) return;
      const photo = GM_getValue('lens_image', '');
      const box = first('input[jsname="W7hAGe"]', 'input.cB9M7', 'input[type="text"]');
      const go = first('div[role="button"][jsname="ZtOxCb"]', 'button[type="submit"]', 'button, div[role="button"]');
      if (tries % 20 === 0) lensLog('looking for the box', { photo: photo.length, box: !!box, button: !!go, tries });
      if (!photo || !box || !go) return;
      done = true;
      lensLog('photo put in the box, search started', { photo: photo.slice(0, 40) + '…', box: box.outerHTML.slice(0, 120) });
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
