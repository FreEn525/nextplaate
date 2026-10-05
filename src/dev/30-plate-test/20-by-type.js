  // Every plate type of this country, tested on the form of that type (no upload, read-only)
  // What the database already knows, so the run does not search again what it has:
  //   plates of a category (any age) replace the gallery search when there are at least 3;
  //   a count from the last 24 hours is reused instead of asking the site again
  const DB_FRESH_MS = 24 * 60 * 60 * 1000;
  async function dbLoad(cc) {
    const all = await capAll();
    return Object.keys(all).filter(k => k.startsWith('db:')).map(k => all[k]).filter(r => r.country === cc);
  }
  function dbCount(rows, read) {
    const hit = rows.find(r => ptNorm(r.read) === ptNorm(read) && Date.now() - new Date(r.date).getTime() < DB_FRESH_MS);
    return hit ? hit.count : null;
  }

  async function ptByType() {
    const cc = here.country, types = await ptSearchTypes(cc), out = {};
    const known = await dbLoad(cc);
    for (const t of types) {
      const formValue = ptFormType(t.label, t.code);
      if (!formValue) { out[t.label] = { note: 'no matching type on the form' }; continue; }
      const sel = document.getElementById('ctype');
      sel.value = formValue; sel.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 700));                   // the form shows the fields of this type
      // what this form shows for this type: the plate fields, their value and the label chosen (for the rules)
      const fields = [...document.querySelectorAll('input, select')].filter(el => isPlateField(el) && el.offsetParent !== null && !el.disabled)
        .map(el => ({ id: el.id || el.name, tag: el.tagName, value: el.value, label: el.tagName === 'SELECT' ? (el.options[el.selectedIndex] || {}).text : undefined }));
      const rows = [];
      const mine = known.filter(r => r.category === t.label);
      const texts = mine.length >= 3 ? [...new Set(mine.map(r => r.plate))].slice(0, 3) : await ptGalleryType(cc, t.code);
      for (const text of texts) {
        const fits = ptType(text);
        if (!fits) { rows.push({ shown: text, fits: false }); continue; }
        await new Promise(r => setTimeout(r, 350));
        const read = plateForForm() || '';
        let found = dbCount(known, read);
        if (found === null) { try { found = await countPlate(read); } catch (e) { found = 'error'; } }
        rows.push({ shown: text, read, fits: true, sitefound: found, ok: ptNorm(read) === ptNorm(text) && typeof found === 'number' && found > 0 });
        if (typeof found === 'number') dbAddPlate(cc, t.label, text, read, found);
      }
      ptType('');
      out[t.label] = { code: t.code, formValue, fields, passed: rows.filter(r => r.ok).length, tested: rows.filter(r => r.fits).length, rows };
    }
    console.log('[NextPlaate] plate types ' + cc, out);
    return out;
  }

  async function ptRun() {
    if (!here.add) { ptMsg('Open an upload page of the country first.'); return; }
    ptMsg('Testing…');
    const rows = await ptCollect();
    const passed = rows.filter(r => r.ok).length, tested = rows.filter(r => r.fits).length;
    console.log('[NextPlaate] plate test ' + here.country, rows);
    ptMsg(`${here.country}: ${passed}/${tested} plates pass (${rows.length - tested} of another type, not tested). Details in the console (F12).` +
      (rows.some(r => r.fits && !r.ok) ? '\nFailed: ' + rows.filter(r => r.fits && !r.ok).map(r => r.shown).join(', ') : ''));
  }

