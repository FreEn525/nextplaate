  /* =====================================================================
   *  SELECT A COUNTRY  (the page /add, before a country is chosen)
   *    The site's own box is a drop-down list of about 90 countries and a button. Here it becomes a card with the flags in large
   *    tiles, a box to find a country by name or code (Enter opens the first one), and the countries you opened last at the top.
   *    The list is the site's own (the options of its menu, so a country the site has no page for is never offered); the flags are the
   *    site's images. The site's box is hidden, not removed. Only on /add: the other upload pages keep the side bar of flags.
   * ===================================================================== */
  const RECENT_COUNTRIES = 6;

  function countryPageCard() {
    const form = document.getElementById('sky-form'), menu = document.getElementById('mySelect');
    if (!form || !menu) return false;
    const countries = [...menu.options].map(o => {
      const m = /^\/([a-z]{2})\/add$/i.exec(o.value);
      return m ? { code: m[1].toLowerCase(), name: o.textContent.trim(), href: o.value } : null;
    }).filter(Boolean);
    if (!countries.length) return false;
    const card = inlineCard({ id: 'pmg-country-card', title: 'Select a country', before: form, closable: false });
    if (!card) return false;
    form.hidden = true;
    form.style.display = 'none';

    const recent = () => { try { return JSON.parse(store.get('recent_countries', '[]')); } catch (e) { return []; } };
    const remember = code => store.set('recent_countries', JSON.stringify([code, ...recent().filter(c => c !== code)].slice(0, RECENT_COUNTRIES)));
    const tile = c => {
      const img = h('img', { src: flagUrl(c.code), alt: '', width: 40, height: 27, loading: 'lazy' });
      img.addEventListener('error', () => img.replaceWith(h('span', { class: 'flagcode', text: c.code.toUpperCase() })));
      return h('a', { class: 'ctile', href: c.href, 'data-find': (c.name + ' ' + c.code).toLowerCase(), onclick: () => remember(c.code) }, img, h('span', { class: 'cname', text: c.name }));
    };

    const find = h('input', { type: 'text', placeholder: 'Find a country by name or code…', 'aria-label': 'Find a country', autocomplete: 'off' });
    const last = recent().map(code => countries.find(c => c.code === code)).filter(Boolean);
    const recentRow = last.length ? h('div', { class: 'cgroup' }, h('div', { class: 'cat', text: 'Opened last' }), h('div', { class: 'cgrid' }, last.map(tile))) : null;
    const tiles = countries.map(tile);
    const none = h('p', { class: 'hint', text: 'No country matches.', hidden: true });
    const count = h('span', { class: 'mute' });
    const grid = h('div', { class: 'cgrid' }, tiles);

    const refresh = () => {
      const q = find.value.trim().toLowerCase();
      let shown = 0;
      tiles.forEach(t => { const on = !q || t.dataset.find.includes(q); t.hidden = !on; t.classList.remove('first'); if (on) shown++; });
      const first = tiles.find(t => !t.hidden);
      if (q && first) first.classList.add('first');                          // the one Enter opens
      none.hidden = shown > 0;
      if (recentRow) recentRow.hidden = !!q;                                 // searching: the full list only
      count.textContent = q ? `${shown} of ${countries.length}` : `${countries.length} countries`;
    };
    find.addEventListener('input', refresh);
    find.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const first = tiles.find(t => !t.hidden);
      if (!first) return;
      e.preventDefault();
      first.click();                                                         // remembers it, then the link opens the page
    });

    card.body.append(h('div', { class: 'cardbox' }, h('div', { class: 'csearch' }, find, count), recentRow, h('div', { class: 'cgroup' }, recentRow ? h('div', { class: 'cat', text: 'All countries' }) : null, grid, none)));
    refresh();
    return true;
  }
