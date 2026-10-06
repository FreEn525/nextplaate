  /* =====================================================================
   *  GOOGLE LENS, ON THE GOOGLE SIDE  (the same script, opened by the Lens group of the panel)
   *    The panel saves the photo (a public address, or the photo itself for one not published yet) with GM_setValue and opens
   *    https://www.google.com/?olud&src=pm. This code runs on that Google page only: it puts the photo in the "paste an image
   *    link" box of Google's search by image and starts the search, the way the box is used by hand.
   *    It runs only on the pages the panel opened (the marker in the address) and reads nothing from Google. On any Google page the
   *    script stops here: no panel, no other feature.
   * ===================================================================== */
  // Only function declarations here: they run from core/00-open.js, before the rest of the script has set anything up
  function lensMarkedUrl() { return 'https://www.google.com/?olud&src=pm'; }

  function onLensPage() {
    try {
      const u = new URL(location.href);
      return /^www\.google\./.test(u.hostname) && u.searchParams.has('olud') && u.searchParams.get('src') === 'pm';
    } catch (e) { return false; }
  }

  // Google's own markup: the jsname values are the ones of the box and the search button today, the others are a fallback
  function lensOnGoogle() {
    if (!onLensPage()) return;
    let done = false, tries = 0;
    const first = (...sel) => sel.map(s => document.querySelector(s)).find(Boolean);
    const attempt = () => {
      if (done) return;
      const photo = GM_getValue('lens_image', '');
      const box = first('input[jsname="W7hAGe"]', 'input.cB9M7', 'input[type="text"]');
      const go = first('div[role="button"][jsname="ZtOxCb"]', 'button[type="submit"]', 'button, div[role="button"]');
      if (!photo || !box || !go) return;
      done = true;
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
