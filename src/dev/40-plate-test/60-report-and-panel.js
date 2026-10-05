  // Report: a JSON with every row, and a Markdown table, written in the folder you choose
  async function ptWrite() {
    const all = await capAll();
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
    // opts.field: the whole text goes into this one field (how a user types a single-field plate), no token split
    testText: async (text, opts) => {
      let fits = true;
      if (opts && opts.field) {
        const el = document.getElementById(opts.field);
        if (el) { el.value = text; el.dispatchEvent(new Event('input', { bubbles: true })); }
        else fits = false;
      } else {
        fits = ptType(text);
      }
      await new Promise(r => setTimeout(r, opts && opts.settle != null ? opts.settle : 350));   // the real site needs its scripts to settle; the saved pages need almost nothing
      const read = plateForForm() || '';
      if (opts && opts.field) { const el = document.getElementById(opts.field); if (el) { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); } }
      else ptType('');
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
      $('ptTypesAll').onclick = () => ptStartTypes().catch(e => ptMsg('Could not start: ' + e.message));
      $('ptFillAll').onclick = () => ptStartFill().catch(e => ptMsg('Could not start: ' + e.message));
      $('ptFill').onclick = () => { if (!here.add) { ptMsg('Open an upload page first.'); return; } ptMsg('Filling…'); ptFillMissing().catch(e => ptMsg('Fill stopped: ' + e.message)); };
      $('ptAll').onclick = () => ptStart(false).catch(e => ptMsg('Could not start: ' + e.message));
      $('ptAgain').onclick = () => ptStart(true).catch(e => ptMsg('Could not start: ' + e.message));
      $('ptWrite').onclick = () => ptWrite().catch(e => ptMsg('Could not write: ' + e.message));
      ptStep();
    }
  });
