  // Fills the database for the categories of this country that have no plate confirmed by the site yet.
  // Up to 3 plates per category, taken from the gallery of that category, typed on the form of that category,
  // counted on the site. Every step is logged with its reason, and the log is kept (fill:xx) and shown in the console.
  async function ptFillMissing() {
    const cc = here.country;
    const log = [];
    const row = (category, shown, read, status, detail) => log.push({ category, shown: shown || '', read: read || '', status, detail: detail || '' });
    const types = ptTypesKept(cc, await capAll()) || await ptSearchTypes(cc);
    const known = await dbLoad(cc);
    const confirmed = new Set(known.filter(r => r.count > 0 || r.source === 'gallery').map(r => r.category));
    const missing = types.filter(t => !confirmed.has(t.label));
    ptMsg(`${cc}: ${missing.length} categories without a confirmed plate (of ${types.length}).`);
    for (const t of missing) {
      const formValue = ptFormType(t.label, t.code);
      if (!formValue) { row(t.label, '', '', 'no-form-type', 'no matching type on the form'); continue; }
      const sel = document.getElementById('ctype');
      sel.value = formValue; sel.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 700));
      let texts;
      try { texts = await ptGalleryType(cc, t.code); }
      catch (e) {
        row(t.label, '', '', 'gallery-error', e.message);
        if (/asked to wait|rate limit/.test(e.message)) break;     // the site asked to stop: keep what is logged
        continue;
      }
      if (!texts.length) { row(t.label, '', '', 'no-plates-on-site', 'the gallery of this category is empty'); continue; }
      for (const text of texts) {
        // collected from the gallery: the site already shows the plate, so no extra request. Typed here (no request) to keep what the script reads.
        if (!ptType(text)) { row(t.label, text, '', 'does-not-fit-form', 'the form does not take this plate'); continue; }
        await new Promise(r => setTimeout(r, 350));
        const read = plateForForm() || '';
        dbAddPlate(cc, t.label, text, read, null, 'gallery');
        row(t.label, text, read, 'collected', 'from the gallery');
      }
      ptType('');
    }
    const counts = {};
    for (const r of log) counts[r.status] = (counts[r.status] || 0) + 1;
    await capPut('fill:' + cc, { date: new Date().toISOString(), counts, rows: log });
    console.log('[NextPlaate] fill ' + cc, counts);
    console.table(log);
    ptMsg(`${cc} filled: ${Object.entries(counts).map(([k, v]) => k + ' ' + v).join(', ')}. Details in the console (F12).`);
    return counts;
  }

