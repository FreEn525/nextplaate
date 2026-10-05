  /* =====================================================================
   *  DEV STATUS  (dev build only: first box of the Developer drawer, what the tools have collected so far)
   *    Reads what is kept in the browser (nextplaate-dev) and the state of the request queue.
   * ===================================================================== */
  async function devStatus() {
    const all = await capAll();
    const keys = Object.keys(all);
    const count = prefix => keys.filter(k => k.startsWith(prefix)).length;
    const total = SITE_CODES.length;
    const blocked = siteBlockedUntil() > Date.now();
    return [
      ['Upload pages kept', `${count('page:')} / ${total}` + (count('skip:') ? `  (${count('skip:')} without a page)` : '')],
      ['Search pages kept', `${count('search:')} / ${total}` + (count('skipsearch:') ? `  (${count('skipsearch:')} without a page)` : '')],
      ['Plates in the database', String(count('db:'))],
      ['Requests logged', String(count('log:'))],
      ['Site', blocked ? 'paused until ' + new Date(siteBlockedUntil()).toLocaleTimeString() : 'no pause']
    ];
  }

  async function devStatusShow() {
    const out = $('devStatus');
    if (!out) return;
    try {
      out.textContent = '';
      for (const [label, value] of await devStatus()) out.append(h('div', { class: 'kv' }, h('span', { class: 'mute', text: label }), h('b', { text: value })));
    } catch (e) { out.textContent = 'Could not read the dev store: ' + e.message; }
  }

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Status',
      build: () => [
        h('div', { id: 'devStatus', class: 'presult' }),
        h('button', { id: 'devRefresh', class: 'btn ghost', text: 'Refresh' })
      ]
    }],
    init: () => {
      $('devRefresh').onclick = devStatusShow;
      devStatusShow();
    }
  });
