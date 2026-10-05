  /* =====================================================================
   *  PLATE TEST  (dev only, read-only: nothing is uploaded, no photo is sent)
   *    On an upload page: takes the plates shown in the country's gallery, types each one into the
   *    plate fields (without touching anything else), and checks that our script reads it back
   *    the same way AND that the site finds it. "Test all countries" does it for every country in turn,
   *    keeps each result in the browser, and "Write report" saves the report into a folder you choose.
   * ===================================================================== */
  const PT_QUEUE = 'nextplaate-plates-run';        // the countries left in the run (sessionStorage)
  const PT_MODE = 'nextplaate-plates-mode';        // 'regular' (standard plates) or 'types' (every plate type)
  const PT_PAUSE_MS = 5000;                        // between two countries (the site limits fast request bursts)
  const ptNorm = s => (s || '').replace(/[\s-]+/g, '').toUpperCase();

  // Plates shown in the country's gallery: the text of their photos (the alt of the "inf" image)
  async function ptGallery(cc) {
    const doc = new DOMParser().parseFromString(await siteFetch(`/${cc}/gallery.php?gal=${cc}`), 'text/html');
    const plates = new Set();
    // the plate is the alt of the "inf" image, or the text before the comma in the alt of the main photo (ZG 2072-KA, Renault)
    doc.querySelectorAll('img[src*="/inf/"][alt], img[src*="/m/"][alt]').forEach(img => {
      const t = img.getAttribute('alt').split(',')[0].trim();
      if (t) plates.add(t);
    });
    return [...plates].slice(0, 10);
  }

  // Types one plate into the visible plate fields, in order; the form's other fields are left alone
  // first the usual split; if the plate does not fit, a second try cuts the mixed tokens (8AP -> 8 AP)
  function ptType(text) {
    return ptTypeOnce(text, false) || ptTypeOnce(text, true);
  }

  function ptTypeOnce(text, split) {
    let tokens = text.split(/[\s-]+/).filter(Boolean).flatMap(t => split ? (t.match(/\d+|[^\d]+/g) || []) : [t]);
    const fields = [...document.querySelectorAll('input, select')]
      .filter(el => isPlateField(el) && el.offsetParent !== null && !el.disabled && el.id !== 'ctype');
    // fixed fields are set by the site for a type (T, TAX, BP, P): they keep their value and no token goes in them
    const FIXED = ['trz', 'tx', 'nonr'];
    fields.forEach(el => {
      if (el.tagName !== 'INPUT') return;
      if (FIXED.includes(el.id)) { if (el.value) el.dataset.pmgFixed = el.value; if (el.dataset.pmgFixed) el.value = el.dataset.pmgFixed; return; }
      el.value = '';
    });
    const tokenFields = fields.filter(el => !FIXED.includes(el.id));
    // a token that is the value the site already set (the T of a transit plate) is not typed again
    const fixedVals = fields.filter(el => FIXED.includes(el.id) && el.value).map(el => el.value.toUpperCase());
    tokens = tokens.filter(t => !fixedVals.includes(t.toUpperCase()));
    // one single plate text field (France, Belgium...): the whole plate goes in it, dashes included;
    // the menus of the page (department, region) are set only when one of the tokens matches them
    const texts = fields.filter(el => el.tagName === 'INPUT');
    const menuTakes = fields.some(el => el.tagName === 'SELECT' && tokens.some(t => [...el.options].some(o => o.value && (o.text.trim().toUpperCase() === t.toUpperCase() || o.value.toUpperCase() === t.toUpperCase()))));
    if (texts.length === 1 && !menuTakes && /^nomer/.test(texts[0].id || texts[0].name)) {
      texts[0].value = text;
      texts[0].dispatchEvent(new Event('input', { bubbles: true }));
      for (const el of fields.filter(el => el.tagName === 'SELECT')) {
        const hit = tokens.map(t => t.toUpperCase()).find(t => [...el.options].some(o => o.value && (o.value.toUpperCase() === t || o.text.trim().toUpperCase().startsWith(t))));
        const opt = hit && [...el.options].find(o => o.value && (o.value.toUpperCase() === hit || o.text.trim().toUpperCase().startsWith(hit)));
        if (opt) { el.value = opt.value; el.dispatchEvent(new Event('change', { bubbles: true })); }
      }
      return true;
    }
    let i = 0;
    // two passes: a menu that comes before its letters in the page gets them on the second pass
    for (let pass = 0; pass < 2 && i < tokens.length; pass++) for (const el of tokenFields) {
      if (i >= tokens.length) break;
      if (el.dataset.ptUsed) continue;
      if (el.tagName === 'INPUT') {
        // on the first pass a digits field only takes a piece that has digits: letters wait for their menu
        if (pass === 0 && !/\d/.test(tokens[i]) && !/let|letter/i.test(el.id || el.name || '')) continue;
        el.value = tokens[i++];
        el.dataset.ptUsed = '1';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        const want = tokens[i].toUpperCase();
        const opt = [...el.options].find(o => o.value && (o.text.trim().toUpperCase() === want || o.value.toUpperCase() === want))
          || [...el.options].find(o => o.value && o.text.trim().toUpperCase().startsWith(want));   // exact label first: A before AM
        if (opt) { el.value = opt.value; el.dataset.ptSet = '1'; el.dataset.ptUsed = '1'; el.dispatchEvent(new Event('change', { bubbles: true })); i++; continue; }
        // "TT" over two one-letter menus: the first letter goes in this menu, the rest carries on to the next one
        const one = [...el.options].find(o => o.value && o.text.trim().toUpperCase() === want[0]);
        if (want.length > 1 && one) { el.value = one.value; el.dataset.ptSet = '1'; el.dataset.ptUsed = '1'; el.dispatchEvent(new Event('change', { bubbles: true })); tokens[i] = tokens[i].slice(1); }
      }
    }
    fields.forEach(el => { delete el.dataset.ptUsed; });
    // menus the plate did not use go back to their empty choice, so a default value is not read as a part of the plate
    for (const el of fields.filter(el => el.tagName === 'SELECT')) {
      if (el.dataset.ptSet) { delete el.dataset.ptSet; continue; }
      const empty = [...el.options].find(o => o.value === '');
      if (empty && el.value !== '') { el.value = ''; el.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    return i === tokens.length;   // false: the plate does not fit the fields of this page
  }

