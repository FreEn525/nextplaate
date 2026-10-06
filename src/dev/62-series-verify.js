  /* =====================================================================
   *  SERIES CHECK  (dev only: does the series search find the plate again, country by country?)
   *    For up to two real plates per country (SERIES_SAMPLES), builds the series search the feature would use (seriesQuery: the longest
   *    run of digits becomes the wildcard), asks the site for it (gallery.php?nomer=...), and records whether the plate comes back.
   *    A country whose plates all come back is safe to switch on in SERIES_COUNTRIES (src/features/79-series.js). Read-only, through
   *    the shared queue (one request every 3 s, a pause after a block), and it carries on where it stopped.
   * ===================================================================== */
  let seriesCheckStop = false;
  const sckSay = t => { const el = $('sckMsg'); if (el) el.textContent = t; };
  const sckNorm = t => String(t).toUpperCase().replace(/[\s-]+/g, '');

  async function sckRun() {
    const done = new Set(Object.keys(await capAll('seriescheck:')));
    const todo = [];
    for (const [cc, plates] of Object.entries(SERIES_SAMPLES)) plates.forEach((plate, i) => { if (!done.has(`seriescheck:${cc}|${i}`)) todo.push({ cc, plate, i }); });
    if (!todo.length) { sckSay('Every sample is checked. Click "Check" or "Write to folder".'); return; }
    seriesCheckStop = false;
    $('sckStop').hidden = false;
    let n = 0;
    for (const t of todo) {
      if (seriesCheckStop) break;
      const query = seriesQuery(t.plate);
      sckSay(`Checking ${t.cc.toUpperCase()} ${t.plate}: ${n + 1} of ${todo.length}…`);
      const rec = { country: t.cc, plate: t.plate, query, count: null, plates: [], found: false, ok: false, date: new Date().toISOString() };
      if (query) {
        try {
          const got = seriesRead(await siteFetch(`/${t.cc}/gallery.php?nomer=${encodeURIComponent(query)}`));
          rec.count = got.count; rec.plates = got.plates;
          rec.found = got.plates.some(p => sckNorm(p) === sckNorm(t.plate));
          rec.ok = got.count > 0 && (rec.found || got.count > got.plates.length);       // the plate is on the page, or the page is only one of several
        } catch (e) {
          if (/asked to wait|rate limit/.test(e.message)) { sckSay(`Paused: the site asked to wait (${n} checked). Click again later.`); $('sckStop').hidden = true; return; }
          rec.error = e.message;
        }
      }
      if (!rec.error) await capPut(`seriescheck:${t.cc}|${t.i}`, rec);
      n++;
    }
    $('sckStop').hidden = true;
    sckSay((seriesCheckStop ? 'Stopped. ' : 'Finished. ') + `${n} plates checked. Now "Check" and "Write to folder".`);
  }

  // Per country: every sample ok -> safe; none -> not; a mix -> to look at
  async function sckSummary() {
    const recs = Object.values(await capAll('seriescheck:'));
    const by = {};
    recs.forEach(r => { (by[r.country] = by[r.country] || []).push(r); });
    const safe = [], mixed = [], no = [];
    for (const [cc, rs] of Object.entries(by)) (rs.every(r => r.ok) ? safe : rs.some(r => r.ok) ? mixed : no).push(cc);
    return { recs, safe, mixed, no };
  }

  async function sckCheck() {
    const s = await sckSummary();
    sckSay(`${s.recs.length} plates checked. Safe: ${s.safe.length} (${s.safe.join(' ')}). Mixed: ${s.mixed.join(' ') || '-'}. Not found: ${s.no.join(' ') || '-'}.`);
  }

  async function sckWrite() {
    const s = await sckSummary();
    if (!s.recs.length) { sckSay('Nothing checked yet.'); return; }
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    const w = await (await dir.getFileHandle('series-check.json', { create: true })).createWritable();
    await w.write(JSON.stringify({ date: new Date().toISOString(), safe: s.safe, mixed: s.mixed, no: s.no, records: s.recs }, null, 2));
    await w.close();
    sckSay('Written series-check.json to the folder.');
  }

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Series check',
      build: () => [
        h('p', { id: 'sckMsg', class: 'presult', text: 'For two real plates per country: does the series search find the plate again? About one request per plate.' }),
        h('div', { class: 'btnrow' },
          h('button', { id: 'sckGo', class: 'btn', text: 'Verify series' }),
          h('button', { id: 'sckStop', class: 'btn ghost', hidden: true, text: 'Stop' }),
          h('button', { id: 'sckCheck', class: 'btn ghost', text: 'Check' })),
        h('button', { id: 'sckWrite', class: 'btn ghost', text: 'Write to folder' })
      ]
    }],
    init: () => {
      $('sckGo').onclick = () => sckRun().catch(e => sckSay('Failed: ' + e.message));
      $('sckStop').onclick = () => { seriesCheckStop = true; };
      $('sckCheck').onclick = () => sckCheck();
      $('sckWrite').onclick = () => sckWrite().catch(e => sckSay('Could not write: ' + e.message));
    }
  });
