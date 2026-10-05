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
  // Russian menus use the Latin look-alikes (A B E K M H O P C T Y X) while the gallery writes the Cyrillic letters: both compare equal
  const ptCanon = s => String(s || '').toUpperCase().replace(/[АВЕКМНОРСТУХ]/g, c => 'ABEKMHOPCTYX'['АВЕКМНОРСТУХ'.indexOf(c)]);
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
  let ptOrder = null;   // field ids in the order the plate is read, or null: the order of the page
  let ptDrop = null;    // tokens that the form already has (see 05-hints.js)
  let ptPrefix = null;  // text the site writes itself in front of the plate (ÅL of an Åland plate)
  function ptType(text) {
    return ptTypeOnce(text, false) || ptTypeOnce(text, true);
  }

  function ptTypeOnce(text, split) {
    if (ptPrefix && ptCanon(text).startsWith(ptCanon(ptPrefix))) text = text.slice(ptPrefix.length).trim();
    let tokens = text.split(/[\s-]+/).filter(Boolean).flatMap(t => split ? (t.match(/\d+|[^\d]+/g) || []) : [t]);
    const fields = [...document.querySelectorAll('input, select')]
      .filter(el => (isPlateField(el) || /^(nonr|trz|tx)$/.test(el.id)) && el.offsetParent !== null && !el.disabled && el.id !== 'ctype' && el.id !== 'drop_2');   // the type menus are not typed into
    // fixed fields are set by the site for a type (T, TAX, BP, P): they keep their value and no token goes in them
    const FIXED = ['trz', 'tx'];   // inputs the site fills itself (T, TAX, BP)
    fields.forEach(el => {
      if (el.tagName !== 'INPUT') return;
      if (FIXED.includes(el.id)) { if (el.value) el.dataset.pmgFixed = el.value; if (el.dataset.pmgFixed) el.value = el.dataset.pmgFixed; return; }
      el.value = '';
    });
    // a country whose page order is not the reading order of its plate can give the order of the fields (offline check)
    const tokenFields = ptOrder ? ptOrder.map(id => fields.find(el => el.id === id)).filter(Boolean) : fields.filter(el => !FIXED.includes(el.id));
    // a token that is the value the site already set (the T of a transit plate) is not typed again
    const fixedVals = [...document.querySelectorAll('#trz, #tx')].filter(el => el.value && el.offsetParent !== null).map(el => ptCanon(el.value));   // only the ones this type shows
    // the site's fixed start of a piece (the T of TAX): taken off before typing
    tokens = tokens.map(t => { const f = fixedVals.find(v => v.length === 1 && ptCanon(t).length > 1 && ptCanon(t).startsWith(v) && /^[A-Z]+$/.test(ptCanon(t)) && document.getElementById('tx')); return f ? t.slice(1) : t; });
    tokens = tokens.filter(t => !fixedVals.includes(ptCanon(t)));
    if (ptDrop) tokens = tokens.filter(t => !ptDrop.includes(ptCanon(t)));
    // a plate field that is not shown but holds a text was filled by the site for this type (the TA of a Bosnian taxi): not typed
    const filled = el => ptCanon(el.tagName === 'SELECT' ? ((el.options[el.selectedIndex] || {}).value ? el.options[el.selectedIndex].text : '') : el.value).replace(/\./g, '');   // E.A. of a Greek police plate is EA
    const siteFilled = [...document.querySelectorAll('input, select')]
      .filter(el => /^(trz|tx)$|nomer|let|digit|trl|^dig|fixed|^b\d/i.test(el.id || el.name || '') && (el.tagName === 'SELECT' ? el.disabled && el.offsetParent !== null : el.offsetParent === null || el.disabled) && el.id !== 'ctype' && el.id !== 'drop_2')   // a menu counts only when it is shown and fixed (the P of a trailer)
      .map(filled).filter(Boolean);
    // a first piece that starts with what the site wrote (the T of TB, written in a hidden field): that start is not typed
    const shownFilled = [...document.querySelectorAll('input, select')].filter(el => el.disabled && el.offsetParent !== null && el.id !== 'ctype').map(filled).filter(Boolean);
    const start = [...shownFilled].sort((a, b) => b.length - a.length).find(v => tokens[0] && ptCanon(tokens[0]).length > v.length && ptCanon(tokens[0]).startsWith(v));
    if (start) tokens[0] = tokens[0].slice(start.length);
    tokens = tokens.filter(t => !siteFilled.includes(ptCanon(t)));
    // one single plate text field (France, Belgium...): the whole plate goes in it, dashes included;
    // the menus of the page (department, region) are set only when one of the tokens matches them
    const texts = fields.filter(el => el.tagName === 'INPUT');
    const menuTakes = fields.some(el => el.tagName === 'SELECT' && tokens.some(t => [...el.options].some(o => o.value && (ptCanon(o.text.trim()) === ptCanon(t) || ptCanon(o.value) === ptCanon(t)))));
    if (texts.length === 1 && !menuTakes && (/^nomer/.test(texts[0].id || texts[0].name) || texts[0].maxLength < 0 || texts[0].maxLength >= text.length)) {
      texts[0].value = text;
      texts[0].dispatchEvent(new Event('input', { bubbles: true }));
      for (const el of fields.filter(el => el.tagName === 'SELECT')) {
        const hit = tokens.map(t => ptCanon(t)).find(t => [...el.options].some(o => o.value && (ptCanon(o.value) === t || ptCanon(o.text.trim()).startsWith(t))));
        const opt = hit && [...el.options].find(o => o.value && (ptCanon(o.value) === hit || ptCanon(o.text.trim()).startsWith(hit)));
        if (opt) { el.value = opt.value; el.dispatchEvent(new Event('change', { bubbles: true })); }
      }
      return true;
    }
    let i = 0, lastInput = null;
    // two passes: a menu that comes before its letters in the page gets them on the second pass
    for (let pass = 0; pass < 2 && i < tokens.length; pass++) for (const el of tokenFields) {
      if (i >= tokens.length) break;
      if (el.dataset.ptUsed) continue;
      if (el.tagName === 'INPUT') {
        // on the first pass a digits field only takes a piece that has digits: letters wait for their menu
        if (pass === 0 && !/\d/.test(tokens[i]) && !/let|letter/i.test(el.id || el.name || '')) continue;
        el.value = tokens[i++];
        lastInput = el;
        el.dataset.ptUsed = '1';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        const want = ptCanon(tokens[i]);
        const opt = [...el.options].find(o => o.value && (ptCanon(o.text.trim()) === want || ptCanon(o.value) === want))
          || [...el.options].find(o => o.value && ptCanon(o.text.trim()).startsWith(want));   // exact label first: A before AM
        if (opt) { el.value = opt.value; el.dataset.ptSet = '1'; el.dataset.ptUsed = '1'; el.dispatchEvent(new Event('change', { bubbles: true })); i++; continue; }
        // "TT" over two one-letter menus, "EKB" over a menu of "EK" and one of "B": this menu takes the longest of its choices
        // that starts the piece, the rest carries on to the next field
        const starts = [...el.options].filter(o => o.value && ptCanon(o.text.trim()) && want.startsWith(ptCanon(o.text.trim())) && ptCanon(o.text.trim()).length < want.length)
          .sort((a, b) => b.text.trim().length - a.text.trim().length)[0];
        if (starts) { el.value = starts.value; el.dataset.ptSet = '1'; el.dataset.ptUsed = '1'; el.dispatchEvent(new Event('change', { bubbles: true })); tokens[i] = tokens[i].slice(ptCanon(starts.text.trim()).length); continue; }
        // a later piece of the plate that is exactly one of this menu's choices (the 06 of "003 BS 06" for a region menu)
        const ahead = tokens.findIndex((t, k) => k > i && [...el.options].some(o => o.value && (ptCanon(o.text.trim()) === ptCanon(t) || ptCanon(o.value) === ptCanon(t))));
        if (ahead > i) {
          const hit = [...el.options].find(o => o.value && (ptCanon(o.text.trim()) === ptCanon(tokens[ahead]) || ptCanon(o.value) === ptCanon(tokens[ahead])));
          el.value = hit.value; el.dataset.ptSet = '1'; el.dataset.ptUsed = '1'; el.dispatchEvent(new Event('change', { bubbles: true }));
          tokens.splice(ahead, 1);
        }
      }
    }
    // pieces left over go on the last text field that was typed (a free field takes "FR-917" after the menu took "GO")
    if (i < tokens.length && lastInput) {
      const joined = [lastInput.value, ...tokens.slice(i)].join(' ');
      if (lastInput.maxLength < 0 || lastInput.maxLength >= joined.length) {
        lastInput.value = joined;
        lastInput.dispatchEvent(new Event('input', { bubbles: true }));
        i = tokens.length;
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

