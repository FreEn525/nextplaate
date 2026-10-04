  /* =====================================================================
   *  PLATE CHECK  (on the upload page: how many photos of this plate are already on the site)
   *    The count comes from the site's own gallery search (the same one the duplicate scripts use).
   *    When an upload tab checks its plate, the result is saved on its photo in the batch queue,
   *    so the batch window shows a warning on that card before anything is sent.
   * ===================================================================== */
  const countCache = {};        // plate -> count, for this page
  // The plate field: #nomer on most upload pages, #nomer1 or #nomerpl on some others
  const PLATE_FIELDS = ['nomer', 'nomer1', 'nomerpl'];
  const plateInput = () => PLATE_FIELDS.map(id => document.getElementById(id))
    .find(el => el && el.offsetParent !== null) || null;

  async function countPlate(plate) {
    if (countCache[plate] !== undefined) return countCache[plate];
    const cc = here.country;
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const res = await fetch(`/${cc}/gallery.php?gal=${cc}&nomer=${encodeURIComponent(plate)}`, { credentials: 'same-origin', signal: ctrl.signal });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const m = (await res.text()).match(/Nombre total de plaques d.immatriculation trouvées\s*<b>(\d+)<\/b>/i);
      if (!m) throw new Error('no count on the page (Cloudflare check?)');
      countCache[plate] = +m[1];
      return countCache[plate];
    } finally { clearTimeout(timer); }
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

  async function checkPlate(manual) {
    const field = plateInput();
    const plate = field ? field.value.trim().toUpperCase() : '';
    $('plateNow').textContent = plate || '—';
    log('plate check', { manual, page: here.add ? 'upload' : 'other', field: field && field.id, plate });
    if (!here.add) { $('plateResult').textContent = 'Open an upload page to check a plate.'; return; }
    if (!field) { $('plateResult').textContent = 'No plate field found on this page (looked for ' + PLATE_FIELDS.map(i => '#' + i).join(', ') + ').'; return; }
    if (!plate) { $('plateResult').textContent = 'Type the plate in the form to check it.'; return; }
    if (!manual && store.get('autoCheck', '1') !== '1') return;
    $('plateResult').textContent = 'Checking…';
    try {
      const n = await countPlate(plate);
      if (!field || field.value.trim().toUpperCase() !== plate) return;   // the plate changed meanwhile
      $('plateResult').textContent = n ? `${n} photo${n > 1 ? 's' : ''} of this plate already on the site.` : 'Not on the site yet.';
      $('plateResult').classList.toggle('warn', n > 0);
      saveForBatch(plate, n);
    } catch (e) {
      $('plateResult').textContent = 'Could not check: ' + e.message + '.';
    }
  }

  let plateTimer = null;
  document.addEventListener('input', e => {
    if (e.target.id !== 'nomer' && e.target.id !== 'nomerpl') return;
    clearTimeout(plateTimer);
    plateTimer = setTimeout(() => checkPlate(false), 700);   // wait until the user stops typing
  }, true);

  registerFeature({
    groups: [{
      drawer: 'plate', title: 'Plate check', pages: ['add'],
      build: () => [
        h('div', { class: 'row' }, h('span', { class: 'lbl', text: 'Plate' }), h('b', { id: 'plateNow', text: '—' })),
        h('p', { id: 'plateResult', class: 'presult', text: 'Type the plate in the form to check it.' }),
        h('button', { id: 'plateCheck', class: 'btn ghost', text: 'Check now' }),
        h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'autoCheck' }), 'Check as I type')
      ]
    }],
    init: () => {
      $('autoCheck').checked = store.get('autoCheck', '1') === '1';
      $('autoCheck').onchange = () => store.set('autoCheck', $('autoCheck').checked ? '1' : '0');
      $('plateCheck').onclick = () => checkPlate(true);
      checkPlate(false);
    }
  });
