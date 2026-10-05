  // Report: a JSON with every row, and a Markdown table, written in the folder you choose
  async function ptWrite() {
    const all = await capAll('plates:', 'plates-skip:', 'types:');
    const report = { date: new Date().toISOString(), countries: {}, skipped: [], untested: [] };
    for (const c of TEST_COUNTRIES) {
      if (all['plates:' + c]) report.countries[c] = all['plates:' + c];
      else if (all['plates-skip:' + c]) report.skipped.push(c);
      else report.untested.push(c);
    }
    report.types = {};
    for (const c of TEST_COUNTRIES) if (all['types:' + c]) report.types[c] = all['types:' + c];
    const typeLines = ['', '## Every plate type', '', '| country | type | passed | tested | other | failed (read / site) |', '|---|---|---|---|---|---|'];
    for (const [c, d] of Object.entries(report.types)) {
      for (const [label, r] of Object.entries(d.types)) {
        if (r.note) { typeLines.push(`| ${c} | ${label} | - | - | - | ${r.note} |`); continue; }
        const bad = r.rows.filter(x => x.fits && !x.ok).map(x => `${x.shown} / ${x.read} / site ${x.sitefound}`).join('; ');
        typeLines.push(`| ${c} | ${label} | ${r.passed} | ${r.tested} | ${r.rows.length - r.tested} | ${bad || '-'} |`);
      }
    }
    const lines = ['# Plate test report', '', `Date: ${report.date}`, '',
      '| country | passed | total | failed plates |', '|---|---|---|---|'];
    for (const [c, r] of Object.entries(report.countries)) {
      const failed = r.rows.filter(x => !x.ok).map(x => x.shown).join(', ');
      lines.push(`| ${c} | ${r.passed} | ${r.total} | ${failed || '-'} |`);
    }
    lines.push('', `No upload page: ${report.skipped.join(' ') || '-'}`, `Not tested: ${report.untested.join(' ') || '-'}`, ...typeLines);
    if (!Object.keys(report.countries).length && !Object.keys(report.types).length) { ptMsg('Nothing tested yet.'); return; }
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    for (const [name, text] of [['plates-report.json', JSON.stringify(report, null, 2)], ['plates-report.md', lines.join('\n')]]) {
      const file = await dir.getFileHandle(name, { create: true });
      const w = await file.createWritable();
      await w.write(text);
      await w.close();
    }
    const db = await dbExport();
    ptMsg(`Report written: ${Object.keys(report.countries).length} countries, ${db.plates} plates in the database, ${db.requests} requests logged.`);
  }

  // For the offline check of the saved pages: types a text, returns what the script reads back
  window.nextplaateDev = {
    type: (text, cc, category) => {   // types a plate and leaves the fields as they are (tools/diag_typing.py, tools/hand_check.py); tries both cuts like testText
      const h = ptHint(cc, category);
      ptApplySet(text, h.set);
      ptOrder = h.order || null; ptDrop = h.drop || null; ptPrefix = h.prefix || null; ptChars = h.chars || null; ptRight = !!h.right; ptExtra = h.extra || null; ptKeepDigits = !!h.keepDigits;
      let fits = ptChars ? ptType(text) : ptTypeOnce(text, false);
      if (!ptChars && ptNorm(plateForForm() || '') !== ptNorm(text)) { const alt = ptTypeOnce(text, true); if (ptNorm(plateForForm() || '') === ptNorm(text)) fits = alt; }
      ptOrder = ptDrop = ptPrefix = ptChars = ptExtra = null; ptRight = ptKeepDigits = false;
      return fits;
    },
    read: () => plateForForm() || '',
    // opts.country and opts.category pick the typing hints (05-hints.js): the whole text in one field, the reading order,
    // the tokens the form already has. opts.settle: how long to wait after typing.
    testText: async (text, opts) => {
      let fits = true;
      const hint = ptHint(opts && opts.country, opts && opts.category);
      const field = hint.field;
      ptOrder = hint.order || null;
      ptDrop = hint.drop || null;
      ptPrefix = hint.prefix || null;
      ptChars = hint.chars || null;
      ptRight = !!hint.right;
      ptExtra = hint.extra || null;
      ptKeepDigits = !!hint.keepDigits;
      ptApplySet(text, hint.set);
      if (field) {
        const el = document.getElementById(field);
        if (el) { el.value = text; el.dispatchEvent(new Event('input', { bubbles: true })); }
        else fits = false;
      } else {
        fits = ptType(text);
      }
      const settle = () => new Promise(r => setTimeout(r, opts && opts.settle != null ? opts.settle : 350));   // the real site needs its scripts to settle; the saved pages need almost nothing
      await settle();
      let read = plateForForm() || '';
      // the first way of cutting the plate into pieces is not always the right one: try the cut into digits and letters too
      if (!field && !ptChars && ptNorm(read) !== ptNorm(text)) {
        const alt = ptTypeOnce(text, true);
        await settle();
        const again = plateForForm() || '';
        if (ptNorm(again) === ptNorm(text)) { fits = alt; read = again; }
      }
      if (opts && opts.keep) { /* the fields stay filled (tools/hand_check.py shows them) */ }
      else if (field) { const el = document.getElementById(field); if (el) { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); } }
      else ptType('');
      ptOrder = ptDrop = ptPrefix = ptChars = ptExtra = null;
      ptRight = ptKeepDigits = false;
      return { fits, read };
    }
  };

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Plate test',
      build: () => [
        h('p', { id: 'ptMsg', class: 'presult', text: 'Types the plates of the site into the upload form of each category and checks what the script reads back. Nothing is uploaded.' }),
        h('div', { class: 'sub', text: 'This country (open its upload page)' }),
        h('div', { class: 'btnrow' },
          h('button', { id: 'ptRun', class: 'btn ghost', text: 'Test plates' }),
          h('button', { id: 'ptTypes', class: 'btn ghost', text: 'Test every type' })),
        h('button', { id: 'ptFill', class: 'btn ghost', text: 'Fill missing plates' }),
        h('div', { class: 'sub', text: 'Every country' }),
        h('button', { id: 'ptCollect', class: 'btn', text: 'Collect plates (one request per category)' }),
        h('button', { id: 'ptCollectStop', class: 'btn ghost', hidden: true, text: 'Stop collecting' }),
        h('button', { id: 'ptAll', class: 'btn ghost', text: 'Test the countries not yet passing' }),
        h('button', { id: 'ptTypesAll', class: 'btn ghost', text: 'Test the countries with failures' }),
        h('button', { id: 'ptFillAll', class: 'btn ghost', text: 'Fill missing plates' }),
        h('button', { id: 'ptAgain', class: 'btn danger', text: 'Test everything again' }),
        h('div', { class: 'sub', text: 'Results' }),
        h('button', { id: 'ptWrite', class: 'btn ghost', text: 'Write report to folder' })
      ]
    }],
    init: () => {
      $('ptRun').onclick = () => ptRun().catch(e => ptMsg('Test stopped: ' + e.message));
      $('ptTypes').onclick = async () => {
        if (!here.add) { ptMsg('Open an upload page first.'); return; }
        ptMsg('Testing every type…');
        const r = await ptByType();
        ptMsg(Object.entries(r).map(([k, v]) => (v.note ? k + ': ' + v.note : k + ': ' + v.passed + '/' + v.tested)).join(' | '));
      };
      $('ptCollect').onclick = () => ptCollectAll().catch(e => ptMsg('Collect stopped: ' + e.message));
      $('ptCollectStop').onclick = () => { ptCollectStop = true; };
      $('ptTypesAll').onclick = () => ptStartTypes().catch(e => ptMsg('Could not start: ' + e.message));
      $('ptFillAll').onclick = () => ptStartFill().catch(e => ptMsg('Could not start: ' + e.message));
      $('ptFill').onclick = () => { if (!here.add) { ptMsg('Open an upload page first.'); return; } ptMsg('Filling…'); ptFillMissing().catch(e => ptMsg('Fill stopped: ' + e.message)); };
      $('ptAll').onclick = () => ptStart(false).catch(e => ptMsg('Could not start: ' + e.message));
      $('ptAgain').onclick = () => ptStart(true).catch(e => ptMsg('Could not start: ' + e.message));
      $('ptWrite').onclick = () => ptWrite().catch(e => ptMsg('Could not write: ' + e.message));
      ptStep();
    }
  });
