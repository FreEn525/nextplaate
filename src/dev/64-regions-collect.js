  /* =====================================================================
   *  REGIONS COLLECTION  (dev only: the region table of every country, to match its regions with the shapes of a map offline)
   *    The site lists, for each country (a "system": fr1, de, ru, rs...), its regions on userreg.php?gallery=<system>-<your number>: a code
   *    and a name per region (departments, districts, states...). The first page gives the menu of all the systems; then one request per
   *    system, through the shared queue (one every 3 s, a pause after a block), and it carries on where it stopped. The pages are kept in
   *    the browser and written to a folder (reference/real/regions/), where the matching with the boundaries of each country is worked out
   *    and its coverage measured.
   * ===================================================================== */
  let rcStop = false;
  const rcSay = t => { const el = $('rcMsg'); if (el) el.textContent = t; };

  async function rcCollect() {
    const me = membersMe();
    if (!me) { rcSay('You are not logged in on this page.'); return; }
    rcStop = false;
    $('rcStop').hidden = false;
    rcSay('Reading the menu of countries…');
    let systems;
    try { systems = regionsParse(new DOMParser().parseFromString(await siteFetch(`/userreg.php?gallery=fr1-${me.id}`), 'text/html')).systems; }
    catch (e) { rcSay('Could not read the menu: ' + e.message); $('rcStop').hidden = true; return; }
    await capPut('regionsmenu', systems);
    const have = new Set((await capList()).filter(k => k.startsWith('regionspage:')).map(k => k.slice('regionspage:'.length)));
    const todo = systems.filter(s => !have.has(s.code));
    let n = 0, errors = [];
    for (const s of todo) {
      if (rcStop) break;
      rcSay(`Collecting ${s.name}: ${n + 1} of ${todo.length}…`);
      try {
        const html = await siteFetch(`/userreg.php?gallery=${s.code}-${me.id}`);
        await capPut('regionspage:' + s.code, `<!-- ${s.code} | ${s.name} -->\n` + html);
        n++;
      } catch (e) {
        if (/asked to wait|rate limit/.test(e.message)) { rcSay(`Paused: the site asked to wait (${n} collected). Click Collect again later.`); $('rcStop').hidden = true; return; }
        errors.push(s.code + ' (' + e.message + ')');
      }
    }
    $('rcStop').hidden = true;
    rcSay((rcStop ? 'Stopped. ' : 'Finished. ') + `${n} systems collected of ${todo.length} missing (${systems.length} in the menu)` + (errors.length ? `, errors: ${errors.join(', ')}` : '') + '. Now "Write to folder".');
  }

  async function rcCheck() {
    const menu = (await capGet('regionsmenu')) || [];
    const have = new Set((await capList()).filter(k => k.startsWith('regionspage:')).map(k => k.slice('regionspage:'.length)));
    rcSay(`${have.size} of ${menu.length} systems collected` + (menu.length - have.size ? `; missing: ${menu.filter(s => !have.has(s.code)).map(s => s.code).join(' ')}` : '') + '.');
  }

  async function rcWrite() {
    const keys = (await capList()).filter(k => k.startsWith('regionspage:'));
    if (!keys.length) { rcSay('Nothing collected yet.'); return; }
    const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
    const put = async (name, text) => { const w = await (await dir.getFileHandle(name, { create: true })).createWritable(); await w.write(text); await w.close(); };
    const failed = [];
    for (const k of keys) {
      try { await put('regions-' + k.slice('regionspage:'.length) + '.html', await capGet(k)); } catch (e) { failed.push(k + ' (' + e.name + ')'); }
    }
    await put('regions.json', JSON.stringify({ date: new Date().toISOString(), systems: (await capGet('regionsmenu')) || [] }, null, 2));
    rcSay(failed.length ? 'Not written: ' + failed.join(', ') : `Written ${keys.length} page(s) and regions.json to the folder.`);
  }

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Regions collection',
      build: () => [
        h('p', { id: 'rcMsg', class: 'presult', text: 'Reads the region table of every country (one request each, about 90) to match the regions with the shapes of a map.' }),
        h('div', { class: 'btnrow' },
          h('button', { id: 'rcGo', class: 'btn', text: 'Collect' }),
          h('button', { id: 'rcStop', class: 'btn ghost', hidden: true, text: 'Stop' }),
          h('button', { id: 'rcCheck', class: 'btn ghost', text: 'Check' })),
        h('button', { id: 'rcWrite', class: 'btn ghost', text: 'Write to folder' })
      ]
    }],
    init: () => {
      $('rcGo').onclick = () => rcCollect().catch(e => rcSay('Failed: ' + e.message));
      $('rcStop').onclick = () => { rcStop = true; };
      $('rcCheck').onclick = () => rcCheck();
      $('rcWrite').onclick = () => rcWrite().catch(e => rcSay('Could not write: ' + e.message));
    }
  });
