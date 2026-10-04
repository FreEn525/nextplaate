  /* =====================================================================
   *  PLATE TEST  (dev only, read-only: nothing is uploaded, no photo is sent)
   *    On an upload page: takes the plates shown in the country's gallery, types each one into the
   *    plate fields (without touching anything else), and checks that our script reads it back
   *    the same way AND that the site finds it. The results are logged in the console.
   * ===================================================================== */
  const ptNorm = s => (s || '').replace(/[\s-]+/g, '').toUpperCase();

  // Plates shown in the country's gallery: the text of their photos (the alt of the "inf" image)
  async function ptGallery(cc) {
    const res = await fetch(`/${cc}/gallery.php?gal=${cc}`, { credentials: 'same-origin' });
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const plates = new Set();
    doc.querySelectorAll('img[src*="/inf/"][alt]').forEach(img => {
      const t = img.getAttribute('alt').trim();
      if (t) plates.add(t);
    });
    return [...plates].slice(0, 12);
  }

  // Types one plate into the visible plate fields, in order; the form's other fields are left alone
  function ptType(text) {
    const tokens = text.split(/[\s-]+/).filter(Boolean);
    const fields = [...document.querySelectorAll('input, select')]
      .filter(el => isPlateField(el) && el.offsetParent !== null && !el.disabled && el.id !== 'ctype');
    fields.forEach(el => { if (el.tagName === 'INPUT') el.value = ''; });
    let i = 0;
    for (const el of fields) {
      if (i >= tokens.length) break;
      if (el.tagName === 'INPUT') {
        el.value = tokens[i++];
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        const want = tokens[i].toUpperCase();
        const opt = [...el.options].find(o => o.value && (o.text.trim().toUpperCase().startsWith(want) || o.value.toUpperCase() === want));
        if (opt) { el.value = opt.value; el.dispatchEvent(new Event('change', { bubbles: true })); i++; }
      }
    }
    return i === tokens.length;   // false: the plate does not fit the fields of this page
  }

  async function ptRun() {
    const out = $('ptMsg');
    if (!here.add) { out.textContent = 'Open an upload page of the country first.'; return; }
    out.textContent = 'Testing…';
    const plates = await ptGallery(here.country);
    const rows = [];
    for (const text of plates) {
      const fits = ptType(text);
      await new Promise(r => setTimeout(r, 500));                  // let the script read the fields
      const read = plateForForm() || '';
      let found = null;
      try { found = await countPlate(read); } catch (e) { found = 'error'; }
      const ok = fits && ptNorm(read) === ptNorm(text) && typeof found === 'number' && found > 0;
      rows.push({ shown: text, read, fits, sitefound: found, ok });
    }
    ptType('');                                                    // clear the fields again
    const passed = rows.filter(r => r.ok).length;
    console.log('[NextPlaate] plate test ' + here.country, rows);
    out.textContent = `${here.country}: ${passed}/${rows.length} plates pass. Details in the console (F12).` +
      (rows.some(r => !r.ok) ? '\nFailed: ' + rows.filter(r => !r.ok).map(r => r.shown).join(', ') : '');
  }

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Plate test',
      build: () => [
        h('p', { id: 'ptMsg', class: 'presult', text: 'Tests this country\'s plates on the upload page, without uploading anything.' }),
        h('button', { id: 'ptRun', class: 'btn ghost', text: 'Test this country' })
      ]
    }],
    init: () => { $('ptRun').onclick = () => ptRun().catch(e => { $('ptMsg').textContent = 'Test stopped: ' + e.message; }); }
  });
