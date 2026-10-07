  /* =====================================================================
   *  PROFILE PARTS  (what the profile look builds in place of the site's loose figures and its 96-row table)
   *    The site's elements stay in the page, hidden or restyled; these read them and build the clean version beside them.
   *      profileTiles(root)       four tiles (plates, likes, comments, rating) from the site's figures, put before the first of them
   *      profileCountries(root)   a bar over the countries table: the title and a box to show the countries with no photo (hidden by default),
   *                               and each country's flag before its name
   *      profileLast(root)        the last photos as cards: the plate's picture over the photo, the country's flag before its name
   * ===================================================================== */
  // The flag of a country, as the site draws its own: in a 3:2 box, contained, with an edge (a white and red flag stays a flag, not a bar)
  const PM_FLAG_CSS = '.pm-flag{display:inline-block;flex:none;width:22px;height:15px;margin-right:8px;border:1px solid color-mix(in srgb,var(--pm-ink) 45%,#fff);background:#fff;object-fit:contain;vertical-align:-3px}';
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
    rows.forEach(tr => {                                                             // the flag of each country, from the link of its name
      const name = tr.querySelector('td:first-child b'), code = (tr.innerHTML.match(/usercountry-([a-z]{2})-/) || [])[1];
      if (name && code) name.before(profileFlag(code));
    });
    const bar = h('div', { class: 'pm-bar' },
      h('span', { class: 'pm-title', text: `Countries (${rows.length - empty.length} with photos)` }),
      empty.length ? h('label', { class: 'pm-chk' }, box, `Show the ${empty.length} without`) : null);
    panel.insertBefore(bar, panel.firstChild);
    return bar;
  }

  // A country's flag, the site's own picture; a country it has none for shows nothing
  function profileFlag(code) {
    const img = h('img', { class: 'pm-flag', src: flagUrl(code), alt: '', width: 22, height: 15, loading: 'lazy' });
    img.addEventListener('error', () => img.remove());
    return img;
  }

  // "26-10-03" (yy-mm-dd, as the site writes the day of a photo) as a date in the reader's language
  function lastDate(text) {
    const m = /^(\d\d)-(\d\d)-(\d\d)$/.exec(String(text).trim());
    return m ? new Date(2000 + +m[1], +m[2] - 1, +m[3]).toLocaleDateString([], { dateStyle: 'medium' }) : String(text).trim();
  }

  // Each last photo becomes a card of its own: the photo whole (the country's flag on its corner), under it the plate (its picture as soon
  // as it is known, its text until then), then the country and the day. Nothing is written over the photo: every line is on white.
  function profileLast(root) {
    const items = [...root.querySelectorAll('.portfolio-box-v1 > li')];
    items.forEach(li => {
      const photo = li.querySelector(':scope > img'), box = li.querySelector('.portfolio-box-v1-in');
      const go = box && box.querySelector('a[href*="/nomer"]');
      if (!photo || !go || li.dataset.pmDone) return;
      li.dataset.pmDone = '1';
      const href = go.getAttribute('href'), code = (href.match(/^\/([a-z]{2})\//) || [])[1];
      const plate = profileText(box.querySelector('h3')), meta = box.querySelector('p');
      const country = meta ? profileText(meta.firstChild).replace(/,$/, '') : '', day = meta ? lastDate(profileText(meta.querySelector('small'))) : '';
      const well = h('span', { class: 'pm-plate-well' }, h('span', { class: 'pm-plate-text', text: plate }));
      const shot = h('span', { class: 'pm-photo' }, photo, code ? h('span', { class: 'pm-badge' }, profileFlag(code)) : null);
      li.classList.add('pm-card-li');
      li.append(h('a', { class: 'pm-card', href, title: `${plate}${country ? ' - ' + country : ''}` }, shot, well,
        h('span', { class: 'pm-meta' }, h('b', { text: country }), h('span', { text: day }))));
      plateWatch(li, go, src => well.replaceChildren(h('img', { src, alt: plate })));
    });
    return items.length;
  }
