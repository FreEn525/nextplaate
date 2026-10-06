  /* =====================================================================
   *  PROFILE PARTS  (what the profile look builds in place of the site's loose figures and its 96-row table)
   *    The site's elements stay in the page, hidden or restyled; these read them and build the clean version beside them.
   *      profileTiles(root)       four tiles (plates, likes, comments, rating) from the site's figures, put before the first of them
   *      profileCountries(root)   a bar over the countries table: the title and a box to show the countries with no photo (hidden by default)
   * ===================================================================== */
  const profileText = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');

  function profileTiles(root) {
    const uploads = root.querySelector('.service-block-v3');
    if (!uploads || root.querySelector('.pm-tiles')) return null;
    const total = uploads.querySelector('.counter a'), box = root.querySelector('.tag-box-v7');
    const cells = box ? [...box.querySelectorAll('h4.counter')] : [];
    const value = h4 => profileText(h4 && h4.querySelector('b'));
    const rate = root.querySelector('a[href^="/aktivuserall"]');
    const rating = rate && rate.parentElement.querySelector('.badge');
    const delta = rating && rating.querySelector('font');
    const tile = ({ label, main, sub, href, extra, tone }) => h(href ? 'a' : 'div', { class: 'pm-tile' + (href ? ' link' : ''), href: href || undefined },
      h('span', { class: 'pm-label', text: label }),
      h('span', { class: 'pm-main' }, main, extra ? h('span', { class: 'pm-delta ' + (tone || ''), text: extra }) : null),
      h('span', { class: 'pm-sub', text: sub || '\u00a0' }));
    const plus = h4 => profileText(h4 && h4.querySelector('.badge'));
    const link = h4 => { const a = h4 && h4.querySelector('b a'); return a ? a.getAttribute('href') : ''; };
    const sign = text => (/^\(?-/.test(text) ? 'down' : 'up');
    const tiles = h('div', { class: 'pm-tiles' },
      tile({ label: 'Plates', main: profileText(total) || '-', sub: 'uploaded', href: total ? total.getAttribute('href') : '' }),
      tile({ label: 'Likes', main: value(cells[0]) || '-', sub: `received \u00b7 posted ${value(cells[1]) || '-'}` }),
      tile({ label: 'Comments', main: value(cells[2]) || '-', sub: `received \u00b7 posted ${value(cells[3]) || '-'}`, extra: plus(cells[2]), tone: 'up', href: link(cells[2]) }),
      tile({ label: 'Rating', main: rating ? '#' + profileText(rating).replace(/\s*\(.*$/, '') : '-', sub: 'place among members', extra: delta ? profileText(delta) : '', tone: delta ? sign(profileText(delta)) : '', href: rate ? rate.getAttribute('href') : '' }));
    uploads.parentNode.insertBefore(tiles, uploads);
    return tiles;
  }

  function profileCountries(root) {
    const panel = root.querySelector('.panel-blue'), table = panel && panel.querySelector('table');
    if (!table || panel.querySelector('.pm-bar')) return null;
    const rows = [...table.querySelectorAll('tbody tr')];
    const empty = rows.filter(tr => ![...tr.querySelectorAll('td')].slice(1).some(td => /\d/.test(td.textContent)));
    empty.forEach(tr => tr.classList.add('pm-empty'));
    const box = h('input', { type: 'checkbox' });
    box.onchange = () => panel.classList.toggle('pm-all', box.checked);
    const bar = h('div', { class: 'pm-bar' },
      h('span', { class: 'pm-title', text: `Countries (${rows.length - empty.length} with photos)` }),
      empty.length ? h('label', { class: 'pm-chk' }, box, `Show the ${empty.length} without`) : null);
    panel.insertBefore(bar, panel.firstChild);
    return bar;
  }
