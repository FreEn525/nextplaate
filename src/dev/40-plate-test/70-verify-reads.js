  // Verify the reads: the offline check says the script reads the same characters as the gallery text, but sometimes with other spaces
  // (EL 557CP for EL5 57CP). The site's search keeps the spaces, so only the site can say whether the read is found. This asks it, one
  // request per plate (the shared queue: one at a time, 3 s apart, pause after a block), from data/verify/reads.json:
  //   [{ country, category, plate (the gallery text), read (what the script reads) }]
  // When the read is not found, the gallery text is searched too: if that one is found, the read is wrong (to fix); if it is not
  // found either, the gallery text is not what the site stores. Results are kept (verify:...) and written by the Database box.
  let ptVerifyStop = false;

  async function ptSearchCount(cc, plate) {
    const text = await siteFetch(`/${cc}/gallery.php?gal=${cc}&nomer=${encodeURIComponent(plate).replace(/%20/g, '+')}`);
    return siteCount(new DOMParser().parseFromString(text, 'text/html'));
  }

  async function ptVerifyReads(rows) {
    const say = t => { const el = $('vrMsg'); if (el) el.textContent = t; };
    const done = await capAll('verify:');
    const todo = rows.filter(r => !done['verify:' + r.country + '|' + r.category + '|' + r.plate]);
    if (!todo.length) { say(`Nothing to check: the ${rows.length} reads are already checked. Write the database to a folder.`); return; }
    ptVerifyStop = false;
    $('vrStop').hidden = false;
    let n = 0, found = 0, missing = 0, errors = 0, paused = false;
    for (const r of todo) {
      if (ptVerifyStop) break;
      say(`Checking ${n + 1} of ${todo.length}: ${r.country.toUpperCase()} ${r.plate} (read ${r.read})…  found ${found}, not found ${missing}`);
      try {
        const count = await ptSearchCount(r.country, r.read);
        const row = { ...r, count, date: new Date().toISOString() };
        if (count === 0) row.plateCount = await ptSearchCount(r.country, r.plate);   // is the gallery text itself found?
        await capPut('verify:' + r.country + '|' + r.category + '|' + r.plate, row);
        count > 0 ? found++ : missing++;
      } catch (e) {
        if (/asked to wait|rate limit/.test(e.message)) { paused = true; break; }
        errors++;
      }
      n++;
    }
    $('vrStop').hidden = true;
    const left = todo.length - n;
    say((paused ? 'Paused: the site asked to wait. ' : ptVerifyStop ? 'Stopped. ' : 'Finished. ') +
      `${found} reads found, ${missing} not found, ${errors} errors, ${left} left. ` + (left ? 'Click again later: it carries on.' : 'Now write the database to a folder (Database box).'));
  }

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Verify the reads',
      build: () => [
        h('p', { id: 'vrMsg', class: 'presult', text: 'Asks the site whether its search finds each plate as the script reads it (only the plates whose read has other spaces than the gallery text).' }),
        h('button', { id: 'vrRun', class: 'btn', text: 'Load reads.json and check on the site' }),
        h('input', { id: 'vrFile', type: 'file', accept: '.json', hidden: true }),
        h('button', { id: 'vrStop', class: 'btn ghost', hidden: true, text: 'Stop' })
      ]
    }],
    init: () => {
      $('vrRun').onclick = () => $('vrFile').click();
      $('vrStop').onclick = () => { ptVerifyStop = true; };
      $('vrFile').onchange = async () => {
        const file = $('vrFile').files[0];
        $('vrFile').value = '';
        if (!file) return;
        try { await ptVerifyReads(JSON.parse(await file.text())); }
        catch (e) { const el = $('vrMsg'); if (el) el.textContent = 'Could not check: ' + e.message; }
      };
    }
  });
