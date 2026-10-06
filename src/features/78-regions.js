  /* =====================================================================
   *  PROFILE: REGIONS  (a member's profile page)
   *    How many regions (departments, districts, states...) of a country a member has a photo from, and which ones are missing.
   *    The site has the figures on userreg.php?gallery=<system>-<id>: one table row per region, the photo count a link when the
   *    member has some (a dash when not), and a menu listing every system of every country, so nothing is listed here: the first
   *    page asked gives the menu, the member picks a system, and each system is asked once (nothing on loading the profile).
   * ===================================================================== */
  const regionsCache = new Map();      // system -> parsed page

  // What a userreg page holds: the systems of its menu and the rows of its table (the region code is empty for the line that
  // gathers photos without a region)
  function regionsParse(doc) {
    const systems = [...doc.querySelectorAll('select[name="gallery"] option')].map(o => ({ code: o.value.replace(/-\d+$/, ''), name: o.textContent.trim(), selected: o.hasAttribute('selected') }));
    const rows = [...doc.querySelectorAll('#example tbody tr')].map(tr => {
      const td = tr.querySelectorAll('td'), link = td[4] && td[4].querySelector('a');
      return td.length >= 5 ? { code: td[2].textContent.trim(), name: td[3].textContent.trim(), count: link ? profileNumber(link.textContent) : 0, href: link ? link.getAttribute('href') : '' } : null;
    }).filter(Boolean);
    return { systems, rows };
  }

  // The figures of a table: regions with a code are the ones to collect; photos with no region count in the photos only
  function regionsFigures(rows) {
    const regions = rows.filter(r => r.code);
    const seen = regions.filter(r => r.count > 0).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const missing = regions.filter(r => !r.count);
    const photos = rows.reduce((sum, r) => sum + r.count, 0);
    return { total: regions.length, seen, missing, photos, percent: regions.length ? Math.round(seen.length * 100 / regions.length) : 0 };
  }

  async function regionsAsk(system, id) {
    if (regionsCache.has(system)) return regionsCache.get(system);
    const page = regionsParse(new DOMParser().parseFromString(await siteFetch(`/userreg.php?gallery=${system}-${id}`), 'text/html'));
    if (!page.rows.length && !page.systems.length) throw new Error('no region table on the page');
    regionsCache.set(system, page);
    return page;
  }

  function regionsCard() {
    const id = (location.pathname.match(/\/user(\d+)/) || [])[1];
    const anchor = document.getElementById('pmg-profile-card') || document.querySelector('.service-block-v3');
    const card = id && anchor && inlineCard({ id: 'pmg-regions-card', title: 'Regions', after: anchor, closable: false });
    if (!card) return;
    const globe = document.querySelector('a[href^="/userreg.php?gallery="]');       // the site's own link: the system it starts from
    const first = (globe && (globe.getAttribute('href').match(/gallery=([a-z0-9]+)-/) || [])[1]) || '';
    let menu = null, run = 0;

    const start = h('button', { type: 'button', class: 'btn ghost sm', text: 'Show the regions of a country', onclick: () => { start.disabled = true; show(first || 'fr1'); } });
    card.body.append(h('div', { class: 'cardbox' }, h('p', { class: 'hint', text: 'Which regions of a country you have photos from, and which are missing.' }), h('div', { class: 'cardrow' }, start)));

    async function show(system) {
      const mine = ++run;
      card.message('Reading the regions…');
      let page;
      try { page = await regionsAsk(system, id); } catch (e) { if (mine === run) { card.message('Not read: ' + e.message); start.disabled = false; } return; }
      if (mine !== run) return;
      card.message('');
      if (!menu && page.systems.length) {
        menu = h('select', { 'aria-label': 'Country' }, page.systems.map(s => h('option', { value: s.code, text: s.name })));
        menu.onchange = () => show(menu.value);
      }
      if (menu) menu.value = system;
      const f = regionsFigures(page.rows);
      card.clear();
      card.body.append(h('div', { class: 'cardbox' },
        menu ? h('div', { class: 'cardrow' }, menu) : null,
        f.total ? h('div', null,
          h('div', { class: 'stats' },
            h('div', { class: 'stat' }, h('b', { text: `${f.seen.length} / ${f.total}` }), h('span', { class: 'mute', text: `regions (${f.percent}%)` })),
            h('div', { class: 'stat' }, h('b', { text: String(f.photos) }), h('span', { class: 'mute', text: 'photos' }))),
          h('div', { class: 'track', role: 'img', 'aria-label': `${f.percent}% of the regions` }, h('div', { class: 'fill', style: `width:${f.percent}%` })))
          : h('p', { class: 'hint', text: 'This country has no regions to collect.' }),
        f.seen.length ? h('div', { class: 'pills' }, f.seen.map(r => h('a', { class: 'pill', href: r.href, target: '_blank', rel: 'noopener noreferrer', text: `${r.code ? r.code + ' ' : ''}${r.name} · ${r.count}`, title: 'Opens your photos of this region in a new tab' }))) : null,
        f.missing.length && f.seen.length ? h('details', { class: 'missing' }, h('summary', { text: `${f.missing.length} missing` }), h('p', { class: 'hint', text: f.missing.map(r => `${r.code ? r.code + ' ' : ''}${r.name}`).join(' · ') })) : null));
    }
  }

  registerFeature({
    id: 'regions', label: 'Profile: regions',
    init: () => { if (here.profile) regionsCard(); }
  });
