  // The test itself: returns one row per plate
  async function ptCollect() {
    const plates = await ptGallery(here.country);
    if (!plates.length) throw new Error('no plate in the gallery (Cloudflare check, or none listed)');
    const rows = [];
    for (const text of plates) {
      const fits = ptType(text);
      if (!fits) { rows.push({ shown: text, fits: false, ok: null }); continue; }   // another plate type (personal, military...): not this form
      await new Promise(r => setTimeout(r, 350));                  // let the script read the fields
      const read = plateForForm() || '';
      let found = null;
      try { found = await countPlate(read); } catch (e) { found = 'error'; }
      const ok = fits && ptNorm(read) === ptNorm(text) && typeof found === 'number' && found > 0;
      rows.push({ shown: text, read, fits, sitefound: found, ok });
    }
    ptType('');                                                    // clear the fields again
    return rows;
  }

  const ptMsg = t => { const el = $('ptMsg'); if (el) el.textContent = t; };

  // Plate types of the country: the search page lists them with the codes of the galleries (ctype=5 ...)
  async function ptSearchTypes(cc) {
    const doc = new DOMParser().parseFromString(await siteFetch(`/${cc}/search`), 'text/html');
    const sel = doc.querySelector('select[name="ctype"]');
    if (!sel) return [];
    return [...sel.options].filter(o => o.value).map(o => ({ code: o.value, label: o.textContent.trim() }));
  }

  // Plates of one type, from the gallery of that type
  async function ptGalleryType(cc, code) {
    const doc = new DOMParser().parseFromString(await siteFetch(`/${cc}/gallery.php?ctype=${code}&few=0&gal=${cc}`), 'text/html');
    const plates = new Set();
    doc.querySelectorAll('img[src*="/inf/"][alt], img[src*="/m/"][alt]').forEach(img => {
      const t = img.getAttribute('alt').split(',')[0].trim();
      if (t) plates.add(t);
    });
    return [...plates].slice(0, 3);
  }

  // The form's option for a search type: the same label (case-insensitive), else the same code
  function ptFormType(label, code) {
    const sel = document.getElementById('ctype');
    if (!sel) return null;
    const want = label.toLowerCase();
    // exact label first; then the form label with its pattern: "2001 year system (AA11AAA)" for "2001 year system"
    const opt = [...sel.options].find(o => o.value && o.text.trim().toLowerCase() === want)
      || [...sel.options].find(o => o.value && o.text.trim().toLowerCase().startsWith(want + ' ('))
      || [...sel.options].find(o => o.value && o.value === code);
    return opt ? opt.value : null;
  }

