  /* =====================================================================
   *  PLATE CHECK  (on the upload page: how many photos of this plate are already on the site)
   *    The count is the site's own gallery search, read from the page title. The same page also shows the vehicle of each photo
   *    of that plate (its brand, model and generation, as the numbers of the form's menus): the most common one is offered,
   *    in a card above the vehicle menus, to fill them with one click (nothing is filled before the click, and no request more).
   *    When an upload tab checks its plate, the result is saved on its photo in the batch queue,
   *    so the batch window shows a warning on that card before anything is sent.
   * ===================================================================== */
  const countCache = new Map();   // search address -> { count, vehicle }, for this page
  const pending = new Map();      // search address -> the request in progress (same plate = one request)

  const searchUrl = plate => `/${here.country}/gallery.php?gal=${here.country}&nomer=${encodeURIComponent(plate).replace(/%20/g, '+')}`;

  // The vehicle the photos of the page show: every photo card links its brand, model and generation to the catalogue
  // (/gallery.php?markaavto=<id>&model=<id>&modgen=<id>): the most common triple wins, the first one on a tie.
  // { path: [brand, model, generation] (as far as it is known), photos: how many agree, of: how many name a vehicle }
  function plateVehicle(doc) {
    const seen = new Map();
    let of = 0;
    const links = doc.querySelectorAll('.panel-body a[href*="markaavto="]');
    (links.length ? links : doc.querySelectorAll('a[href*="markaavto="]')).forEach(a => {
      let q;
      try { q = new URL(a.getAttribute('href'), location.origin).searchParams; } catch (e) { return; }
      const brand = q.get('markaavto');
      if (!brand || brand === '200') return;
      const path = [brand, q.get('model'), q.get('modgen')].filter(Boolean);
      const key = path.join('|');
      of++;
      seen.set(key, { path, photos: (seen.get(key) ? seen.get(key).photos : 0) + 1 });
    });
    const best = [...seen.values()].sort((a, b) => b.photos - a.photos)[0];
    return best ? { ...best, of } : null;
  }

  async function fetchPlateInfo(url) {
    const text = await siteFetch(url);
    const doc = new DOMParser().parseFromString(text, 'text/html');
    // the title reads "License plates found <b>N</b>" (the text depends on the account language)
    const num = doc.querySelector('.breadcrumbs h1 b');
    if (!num || !/^\s*\d+\s*$/.test(num.textContent)) throw new Error('no count on the page');
    log('plate count', url, '=' + num.textContent.trim());
    return { count: +num.textContent, vehicle: +num.textContent ? plateVehicle(doc) : null };
  }

  function plateInfo(plate) {
    const url = searchUrl(plate);
    if (countCache.has(url)) return Promise.resolve(countCache.get(url));
    if (pending.has(url)) return pending.get(url);
    const request = fetchPlateInfo(url)
      .then(info => { countCache.set(url, info); return info; })
      .finally(() => pending.delete(url));
    pending.set(url, request);
    return request;
  }
  const countPlate = plate => plateInfo(plate).then(info => info.count);

  // What the card says of a vehicle: its names in the page's own menus, and the path that exists there (an id the menus do not know
  // is dropped, so a fill never picks something else)
  function plateVehicleNames(v) {
    const d = vehicleData();
    const brand = d.brands.find(b => b.id === v.path[0]);
    if (!brand) return null;
    const path = [brand.id];
    const names = [brand.name];
    const model = v.path[1] && (d.models[brand.id] || []).map(String).includes(v.path[1]) ? v.path[1] : null;
    if (model) {
      path.push(model); names.push(d.modelNames[model]);
      const gen = v.path[2] && (d.gens[model] || []).map(String).includes(v.path[2]) && String(d.genNames[v.path[2]]) !== '0' ? v.path[2] : null;
      if (gen) { path.push(gen); names.push(d.genNames[gen]); }
    }
    return { path, text: names.join(' \u203a ') };
  }

  // The card above the vehicle menus: the count, and the vehicle of the photos already on the site
  function plateCard(plate, info, message) {
    const card = inlineCard({ id: 'pmg-plate-card', title: 'Plate check', before: document.querySelector('.pm-vehicle-fields-row') });
    if (!card) return;
    card.clear();
    if (!plate) { card.host.hidden = true; return; }
    card.message(message);
    const v = info && info.vehicle && plateVehicleNames(info.vehicle);
    const links = lookupLinks(plate);                                           // public lookup pages, plain links (75-lookups.js)
    const series = seriesLine(plate);                                           // your photos of the series of the plate (79-series.js)
    if (!v && !links && !series) return;
    const agree = v && info.vehicle.of > 1 ? ` (${info.vehicle.photos} of ${info.vehicle.of} photos)` : '';
    card.body.append(h('div', { class: 'cardbox' },
      v ? h('p', { class: 'hint', text: 'The photos of this plate on the site show:' }) : null,
      v ? h('div', { class: 'vehline' }, h('b', { text: v.text }), h('span', { class: 'mute', text: agree })) : null,
      v ? h('div', { class: 'cardrow' }, h('button', { type: 'button', class: 'btn', text: 'Fill the menus', onclick: () => { vehicleFill(v.path); card.message('Menus filled.'); } })) : null,
      series, links));
  }

  // The result goes to the photo this tab is loading, if the batch is running
  function saveForBatch(plate, count) {
    const b = getBatch();
    if (!b || !b.active || !b.current) return;
    qGet(b.current).then(it => {
      if (!it) return;
      it.plate = plate; it.dupes = count;
      return qPut(it).then(() => {
        const q = queue.find(x => x.id === it.id);
        if (q) { q.plate = plate; q.dupes = count; if (managerOpen) refreshCard(q); }
      });
    }).catch(() => {});
  }

  let lastPlate = null;
  function showResult(text, kind) {
    const el = $('plateResult');
    el.textContent = text;
    el.className = 'presult' + (kind ? ' ' + kind : '');
  }

  async function checkPlate(manual) {
    if (!here.add) { showResult('Open an upload page to check a plate.'); return; }
    const plate = plateForForm();
    $('plateNow').textContent = plate || '—';
    lookupRefresh(plate);
    log('plate check', { manual, plate, country: here.country });
    if (!plate) { lastPlate = null; showResult('Type the plate in the form to check it.'); plateCard('', null, ''); return; }
    if (!manual && (plate === lastPlate || store.get('autoCheck', '1') !== '1')) return;
    lastPlate = plate;
    showResult('Checking…');
    plateCard(plate, null, 'Checking\u2026');
    try {
      const info = await plateInfo(plate);
      const n = info.count;
      if (plateForForm() !== plate) return;                        // the plate changed meanwhile
      const text = n ? `${n} photo${n > 1 ? 's' : ''} of this plate already on the site.` : 'Not on the site yet.';
      showResult(text, n ? 'warn' : 'ok');
      plateCard(plate, info, text);
      saveForBatch(plate, n);
    } catch (e) {
      showResult('Could not check: ' + e.message + '.', 'warn');
      plateCard(plate, null, 'Could not check: ' + e.message + '.');
    }
  }

  // Checks when the user leaves a field, presses Enter, or changes the plate type: no polling
  let checkTimer = null;
  const later = ms => { clearTimeout(checkTimer); checkTimer = setTimeout(() => checkPlate(false), ms); };
  const plateOn = () => here.add && featureOn('plate');
  document.addEventListener('input', e => { if (plateOn() && isPlateField(e.target)) later(700); }, true);
  document.addEventListener('blur', e => { if (plateOn() && isPlateField(e.target)) later(0); }, true);
  document.addEventListener('change', e => { if (plateOn() && e.target.tagName === 'SELECT') later(0); }, true);

  registerFeature({
    id: 'plate', label: 'Plate check',
    groups: [{
      drawer: 'search', title: 'Plate check', pages: ['add'],
      build: () => [
        h('div', { class: 'row' }, h('span', { class: 'lbl', text: 'Plate' }), h('b', { id: 'plateNow', text: '—' })),
        h('p', { id: 'plateResult', class: 'presult', text: 'Type the plate in the form to check it.' }),
        h('div', { class: 'btnrow' },
          h('button', { id: 'plateCheck', class: 'btn ghost', text: 'Check now' }),
          h('button', { id: 'plateOpen', class: 'btn ghost', text: 'Open the search' })),
        h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'autoCheck' }), 'Check as I type')
      ]
    }],
    init: () => {
      $('autoCheck').checked = store.get('autoCheck', '1') === '1';
      $('autoCheck').onchange = () => store.set('autoCheck', $('autoCheck').checked ? '1' : '0');
      $('plateCheck').onclick = () => checkPlate(true);
      // Safety net: some sites change a field without firing the events above. Reading a few fields is cheap.
      // It checks when the plate has stayed the same for one whole round (so not while the user is typing)
      let seen = null;
      setInterval(() => {
        if (!here.add || store.get('autoCheck', '1') !== '1') return;
        const plate = plateForForm() || null;
        if (plate === seen && plate !== lastPlate) checkPlate(false);
        seen = plate;
      }, 500);
      $('plateOpen').onclick = () => {
        const plate = plateForForm();
        if (plate) window.open(searchUrl(plate), '_blank');
      };
      checkPlate(false);
    }
  });
