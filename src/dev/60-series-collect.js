  /* =====================================================================
   *  SERIES COLLECTION  (dev only: what "series" means in each country, read on the real site with your session)
   *    For each country that links a table of series (SERIES_LINKS): the table page, one series page it leads to, and the site's own
   *    wildcard search of that series with your member number added (gallery.php?nomer=AA * AB&usr=<you>), which shows whether the
   *    wildcard and the member filter work together in that country. Read-only, through the shared queue (one request every 3 s,
   *    a pause after a block); about three requests per country, and it carries on where it stopped. The pages and one small
   *    record per country are kept in the browser, then written to a folder (reference/real/series/) to build the feature offline.
   * ===================================================================== */
  let seriesStop = false;
  const seriesSay = t => { const el = $('seriesMsg'); if (el) el.textContent = t; };
  const seriesDone = async () => Object.keys(await capAll('seriesrec:')).map(k => k.slice('seriesrec:'.length));

  // The count a gallery page announces and the plates it shows, as text
  function seriesRead(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const b = doc.querySelector('.breadcrumbs h1 b');
    const plates = [...new Set([...doc.querySelectorAll('img[src*="/inf/"][alt], img[src*="/m/"][alt]')].map(i => i.getAttribute('alt').split(',')[0].trim()).filter(Boolean))].slice(0, 5);
    return { count: b && /\d/.test(b.textContent) ? +b.textContent.replace(/\D/g, '') : null, plates };
  }

  async function seriesProbe(cc, me) {
    const rec = { country: cc, date: new Date().toISOString(), tables: [], page: null, wildcard: null };
    let first = null;
    for (const [i, href] of SERIES_LINKS[cc].entries()) {
      const html = await siteFetch(href);
      await capPut(`seriespage:${cc}|table${i}`, `<!-- ${href} -->\n` + html);
      rec.tables.push({ href, bytes: html.length });
      if (!i) first = { href, doc: new DOMParser().parseFromString(html, 'text/html') };
    }
    const links = [...first.doc.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
    const abs = h => new URL(h, location.origin + first.href).pathname + new URL(h, location.origin + first.href).search;
    // a page of one series (a table of numbers), when the table leads to one
    const drill = links.find(h => /\/series[^/?]*-[^/?]+/i.test(h) && !/nomer=/.test(h));
    if (drill) {
      const url = abs(drill), html = await siteFetch(url);
      await capPut(`seriespage:${cc}|series`, `<!-- ${url} -->\n` + html);
      rec.page = { href: url, bytes: html.length };
    }
    // the site's own wildcard search of one series, with your number: the count says whether the two work together
    const wild = links.find(h => /nomer=/.test(h) && /[*]|%2A/i.test(h));
    if (wild) {
      const url = abs(wild) + (me ? `&usr=${me.id}` : '');
      const html = await siteFetch(url), got = seriesRead(html);
      await capPut(`seriespage:${cc}|wildcard`, `<!-- ${url} -->\n` + html);
      rec.wildcard = { href: url, count: got.count, plates: got.plates };
    }
    return rec;
  }

  async function seriesCollect() {
    const me = membersMe();
    if (!me) { seriesSay('You are not logged in on this page: the member filter cannot be tested.'); }
    const done = new Set(await seriesDone());
    const todo = Object.keys(SERIES_LINKS).filter(cc => !done.has(cc));
    if (!todo.length) { seriesSay('Every country is collected. Click "Write to folder".'); return; }
    seriesStop = false;
    $('seriesStop').hidden = false;
    let n = 0, errors = [];
    for (const cc of todo) {
      if (seriesStop) break;
      seriesSay(`Collecting ${cc.toUpperCase()}: ${n + 1} of ${todo.length}…`);
      try { await capPut('seriesrec:' + cc, await seriesProbe(cc, me)); n++; }
      catch (e) {
        if (/asked to wait|rate limit/.test(e.message)) { seriesSay(`Paused: the site asked to wait (${n} collected). Click Collect again later.`); $('seriesStop').hidden = true; return; }
        errors.push(cc + ' (' + e.message + ')');
      }
    }
    $('seriesStop').hidden = true;
    seriesSay((seriesStop ? 'Stopped. ' : 'Finished. ') + `${n} countries collected` + (errors.length ? `, errors: ${errors.join(', ')}` : '') + '. Now "Write to folder".');
  }

  async function seriesCheck() {
    const recs = await capAll('seriesrec:');
    const rows = Object.values(recs);
    const withWild = rows.filter(r => r.wildcard && r.wildcard.count > 0).length;
    seriesSay(`${rows.length} of ${Object.keys(SERIES_LINKS).length} countries collected; ${rows.filter(r => r.page).length} with a series page, ${withWild} where the wildcard search with your number found plates.`);
  }

  async function seriesWrite() {
    const recs = await capAll('seriesrec:');
    const keys = (await capList()).filter(k => k.startsWith('seriespage:'));
    if (!keys.length) { seriesSay('Nothing collected yet.'); return; }
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    const put = async (name, text) => { const w = await (await dir.getFileHandle(name, { create: true })).createWritable(); await w.write(text); await w.close(); };
    const failed = [];
    for (const k of keys) {                                       // one page at a time: an error does not stop the rest
      try { await put('series-' + k.slice('seriespage:'.length).replace('|', '-') + '.html', await capGet(k)); } catch (e) { failed.push(k + ' (' + e.name + ')'); }
    }
    await put('series.json', JSON.stringify({ date: new Date().toISOString(), records: Object.values(recs) }, null, 2));
    seriesSay(failed.length ? 'Not written: ' + failed.join(', ') : `Written ${keys.length} page(s) and series.json to the folder.`);
  }

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Series collection',
      build: () => [
        h('p', { id: 'seriesMsg', class: 'presult', text: 'Reads the series tables of the countries that have them, one series page, and the wildcard search with your number. About three requests per country.' }),
        h('div', { class: 'btnrow' },
          h('button', { id: 'seriesGo', class: 'btn', text: 'Collect' }),
          h('button', { id: 'seriesStop', class: 'btn ghost', hidden: true, text: 'Stop' }),
          h('button', { id: 'seriesCheck', class: 'btn ghost', text: 'Check' })),
        h('button', { id: 'seriesWrite', class: 'btn ghost', text: 'Write to folder' })
      ]
    }],
    init: () => {
      $('seriesGo').onclick = () => seriesCollect().catch(e => seriesSay('Failed: ' + e.message));
      $('seriesStop').onclick = () => { seriesStop = true; };
      $('seriesCheck').onclick = () => seriesCheck();
      $('seriesWrite').onclick = () => seriesWrite().catch(e => seriesSay('Could not write: ' + e.message));
    }
  });
