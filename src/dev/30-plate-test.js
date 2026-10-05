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
  function ptType(text) {
    const tokens = text.split(/[\s-]+/).filter(Boolean);
    const fields = [...document.querySelectorAll('input, select')]
      .filter(el => isPlateField(el) && el.offsetParent !== null && !el.disabled && el.id !== 'ctype');
    fields.forEach(el => { if (el.tagName === 'INPUT') el.value = ''; });
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
    for (let pass = 0; pass < 2 && i < tokens.length; pass++) for (const el of fields) {
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

  // "Test all countries": one page after the other, each result kept in the browser
  // Waits for the site (block or Cloudflare) to be over, then goes back to the same country, by itself.
  // The queue is kept, so nothing is lost: the country that was running is tested again from its start.
  function ptPause(left, reason) {
    const until = siteBlockedUntil();
    const wait = Math.max(0, until - Date.now()) + 5000;
    const when = new Date(Date.now() + wait).toLocaleTimeString();
    ptMsg(`Paused (${reason}). It resumes by itself at ${when}, on ${left[0]}. Keep this tab open.`);
    setTimeout(() => {
      if (sessionStorage.getItem(PT_QUEUE) === null) { ptMsg('Stopped.'); return; }
      location.href = '/' + left[0] + '/add';
    }, wait);
  }

  async function ptStep() {
    const left = JSON.parse(sessionStorage.getItem(PT_QUEUE) || 'null');
    if (!left) return;
    if (!left.length) { sessionStorage.removeItem(PT_QUEUE); ptMsg('All countries tested. Click "Write report to folder".'); return; }
    const cc = left[0];
    if (Date.now() < siteBlockedUntil()) { ptPause(left, 'the site asked to wait'); return; }
    if (CHALLENGE.test(document.title)) { ptMsg('Cloudflare check: solve it in this tab. The run resumes on ' + cc + ' by itself after that.'); return; }
    const m = location.pathname.match(/^\/([a-z]{2})\/add\/?$/i);
    // not on the upload page of this country yet: go there first (once; a second miss means no upload page)
    if (!(m && m[1].toLowerCase() === cc)) {
      if (sessionStorage.getItem('nextplaate-plates-try') !== cc) {
        sessionStorage.setItem('nextplaate-plates-try', cc);
        location.href = '/' + cc + '/add';
        return;
      }
      await capPut('plates-skip:' + cc, location.href);           // no upload page for this country
    } else {
      await new Promise(r => setTimeout(r, 1000));
      sessionStorage.removeItem('nextplaate-plates-try');
      try {
        if (sessionStorage.getItem(PT_MODE) === 'types') {
          const types = await ptByType();
          await capPut('types:' + cc, { date: new Date().toISOString(), types });
          console.log('[NextPlaate] all types ' + cc, types);
        } else {
          const rows = await ptCollect();
          await capPut('plates:' + cc, { date: new Date().toISOString(), passed: rows.filter(r => r.ok).length, total: rows.filter(r => r.fits).length, other: rows.filter(r => !r.fits).length, rows });
        }
      } catch (e) {
        if (/asked to wait|check or rate limit/.test(e.message)) { ptPause(left, e.message); return; }   // the queue is kept: it resumes by itself
        // a slow or failed answer is not a block: try the same country again after a minute, 3 times at most
        const tries = +(sessionStorage.getItem('nextplaate-plates-retry') || '0') + 1;
        if (tries <= 3) {
          sessionStorage.setItem('nextplaate-plates-retry', String(tries));
          ptMsg(`${cc}: ${e.message}. Try ${tries}/3 in 60 s…`);
          setTimeout(() => { location.href = '/' + cc + '/add'; }, 60000);
          return;
        }
        sessionStorage.removeItem('nextplaate-plates-retry');
        await capPut('failed:' + cc, { date: new Date().toISOString(), error: e.message });   // not a missing page: it is tested again next time
        ptMsg(`${cc} not saved after 3 tries (${e.message}). Going on with the next country.`);
        // falls through: the country is left out and the run goes on
      }
    }
    const rest = left.slice(1);
    sessionStorage.setItem(PT_QUEUE, JSON.stringify(rest));
    sessionStorage.removeItem('nextplaate-plates-try');
    sessionStorage.removeItem('nextplaate-plates-retry');
    ptMsg(`${cc} tested. ${rest.length} left. Next in ${PT_PAUSE_MS / 1000} s…`);
    if (!rest.length) { sessionStorage.removeItem(PT_QUEUE); ptMsg('All countries tested. Click "Write report to folder".'); return; }
    setTimeout(() => {
      if (sessionStorage.getItem(PT_QUEUE) === null) { ptMsg('Stopped.'); return; }
      location.href = '/' + rest[0] + '/add';
    }, PT_PAUSE_MS);
  }

  // Runs the countries that still need a test. "onlyMissing": keep the countries that fully passed.
  // "all": start again from zero (use it after a change that affects every country).
  // Every plate type of every country: same loop, one country after the other, saved as types:xx
  // Every country again: the earlier results are replaced, and the database saves the searches already made
  async function ptStartTypes() {
    const left = CAPTURE_COUNTRIES.slice();
    sessionStorage.setItem(PT_MODE, 'types');
    sessionStorage.setItem(PT_QUEUE, JSON.stringify(left));
    location.href = '/' + left[0] + '/add';
  }

  async function ptStart(all) {
    sessionStorage.setItem(PT_MODE, 'regular');
    const kept = await capAll();
    const d = await capDb();
    const drop = Object.keys(kept).filter(k => k.startsWith('plates:') || k.startsWith('plates-skip:'))
      .filter(k => all || !(k.startsWith('plates:') && kept[k].passed === kept[k].total && kept[k].total > 0));
    await new Promise(res => {
      const t = d.transaction('kv', 'readwrite'), store = t.objectStore('kv');
      drop.forEach(k => store.delete(k));
      t.oncomplete = res;
    });
    const done = new Set(Object.keys(kept).filter(k => k.startsWith('plates:') && !drop.includes(k)).map(k => k.slice(7)));
    const left = CAPTURE_COUNTRIES.filter(c => !done.has(c) && !(kept['plates-skip:' + c] && !all));
    if (!left.length) { ptMsg('Every country already passes. Click "Write report to folder".'); return; }
    sessionStorage.setItem(PT_QUEUE, JSON.stringify(left));
    location.href = '/' + left[0] + '/add';
  }

  // Report: a JSON with every row, and a Markdown table, written in the folder you choose
  async function ptWrite() {
    const all = await capAll();
    const report = { date: new Date().toISOString(), countries: {}, skipped: [], untested: [] };
    for (const c of CAPTURE_COUNTRIES) {
      if (all['plates:' + c]) report.countries[c] = all['plates:' + c];
      else if (all['plates-skip:' + c]) report.skipped.push(c);
      else report.untested.push(c);
    }
    report.types = {};
    for (const c of CAPTURE_COUNTRIES) if (all['types:' + c]) report.types[c] = all['types:' + c];
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
      await new Promise(r => setTimeout(r, 350));
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
        h('p', { id: 'ptMsg', class: 'presult', text: 'Tests the plates of a country on its upload page, without uploading anything.' }),
        h('button', { id: 'ptRun', class: 'btn ghost', text: 'Test this country' }),
        h('button', { id: 'ptTypes', class: 'btn ghost', text: 'Test every plate type (this country)' }),
        h('button', { id: 'ptTypesAll', class: 'btn ghost', text: 'Test every type of every country' }),
        h('button', { id: 'ptAll', class: 'btn ghost', text: 'Test the countries not yet passing' }),
        h('button', { id: 'ptAgain', class: 'btn ghost', text: 'Test everything again' }),
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
      $('ptAll').onclick = () => ptStart(false).catch(e => ptMsg('Could not start: ' + e.message));
      $('ptAgain').onclick = () => ptStart(true).catch(e => ptMsg('Could not start: ' + e.message));
      $('ptWrite').onclick = () => ptWrite().catch(e => ptMsg('Could not write: ' + e.message));
      ptStep();
    }
  });
