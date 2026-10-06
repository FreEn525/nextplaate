  /* =====================================================================
   *  WORLD MAP  (the countries a member has photos from, on a map of the world)
   *    A window, like the batch window: the world as an SVG (src/lib/worldmap.js), each country the member has photos from filled in
   *    five shades of the panel's blue by how many photos (1, 2-9, 10-49, 50-199, 200 and more), the others left light. A country is a link
   *    to the member's photos of it (the site's gallery.php?usr=), with its figures as the hover text. The small countries the map has
   *    no shape for are dots; the ones with neither (USSR, the non-recognised states) are listed under the map, and a list of all the
   *    countries is there too, for the keyboard and for the numbers.
   *    Whose map: yours (the member logged in) or anyone's: a box takes a number or the link of a profile, and the members you saved are
   *    one click. The figures are the ones of the member's profile, one page read through the shared queue (the page itself when you are
   *    on it), kept for the visit. Open it from Browse > World map, the key M, or the button of a profile.
   * ===================================================================== */
  const worldCache = new Map();      // member number -> { id, name, countries: { cc: { photos, likes, comments } } }

  // What a profile page says: the member and, per country, the photos, likes and comments (the table of the profile)
  function worldParse(doc, id) {
    const who = memberInfo(doc, id);
    const countries = {};
    doc.querySelectorAll('table tbody tr').forEach(tr => {
      const link = tr.querySelector('a[href*="/usercountry-"]');
      const m = link && /usercountry-([a-z0-9]+)-\d+/i.exec(link.getAttribute('href'));
      const td = tr.querySelectorAll('td');
      if (!m || td.length < 4) return;
      const num = cell => +(cell.getAttribute('data-order') || String(cell.textContent).replace(/\D/g, '') || 0);
      countries[m[1].toLowerCase()] = { photos: num(td[1]), likes: num(td[2]), comments: num(td[3]) };
    });
    return { id: String(id), name: who ? who.name : 'member ' + id, countries };
  }

  async function worldData(id) {
    if (worldCache.has(id)) return worldCache.get(id);
    const here_ = here.profile && location.pathname.match(/\/user(\d+)/);
    const doc = here_ && here_[1] === id ? document : new DOMParser().parseFromString(await siteFetch('/user' + id), 'text/html');
    const data = worldParse(doc, id);
    if (!Object.keys(data.countries).length) throw new Error('no country table on that profile');
    worldCache.set(id, data);
    return data;
  }

  // 1 photo, 2-9, 10-49, 50-199, 200 and more -> 1..5; none -> 0
  const worldTier = n => (n >= 200 ? 5 : n >= 50 ? 4 : n >= 10 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0);
  const worldCss = `
    .wm{display:flex;flex-direction:column;gap:12px;padding:16px}
    .wm .who{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
    .wm .who input{flex:1 1 240px;min-width:0}
    .wm .sum{font-size:14px}
    .wm path,.wm circle{vector-effect:non-scaling-stroke}
    .wm .views{display:flex;gap:6px}
    .wm svg{display:block;width:100%;height:auto;background:var(--paper);border:1px solid var(--line)}
    .wm .rest{fill:var(--line);stroke:#fff;stroke-width:.5}
    .wm .c{fill:var(--paper);stroke:#fff;stroke-width:.6}
    .wm a:hover .c,.wm a:focus .c{stroke:var(--ink);stroke-width:1}
    .wm .t1{fill:color-mix(in srgb,var(--primary) 22%,#fff)}
    .wm .t2{fill:color-mix(in srgb,var(--primary) 42%,#fff)}
    .wm .t3{fill:color-mix(in srgb,var(--primary) 62%,#fff)}
    .wm .t4{fill:color-mix(in srgb,var(--primary) 82%,#fff)}
    .wm .t5{fill:var(--primary-h)}
    .wm .dot{stroke:#fff;stroke-width:1}
    .wm .dot.t0{fill:var(--line2)}
    .wm .none{fill:none;stroke:var(--line2);stroke-width:1}
    .wm .legend{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;font-size:12px;color:var(--mute)}
    .wm .legend span{display:inline-flex;align-items:center;gap:6px}
    .wm .legend i{display:inline-block;width:16px;height:12px;border:1px solid var(--line2)}
    .wm .legend .t1{background:color-mix(in srgb,var(--primary) 22%,#fff)}
    .wm .legend .t2{background:color-mix(in srgb,var(--primary) 42%,#fff)}
    .wm .legend .t3{background:color-mix(in srgb,var(--primary) 62%,#fff)}
    .wm .legend .t4{background:color-mix(in srgb,var(--primary) 82%,#fff)}
    .wm .legend .t5{background:var(--primary-h)}
    .wm .extra{font-size:13px}
    .wm table{width:100%;border-collapse:collapse;font-size:13px}
    .wm td,.wm th{padding:5px 8px;border-bottom:1px solid var(--line);text-align:left}
    .wm th{font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
    .wm td.n{text-align:right;font-variant-numeric:tabular-nums}
    .wm a.lnk{color:var(--primary-h);font-weight:600}
  `;

  function svgEl(tag, attrs, ...kids) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
    kids.forEach(k => el.append(k));
    return el;
  }

  // The map and everything under it, for one member's data
  function worldView(data) {
    const gallery = cc => `/${cc}/gallery.php?usr=${data.id}`;
    const stats = cc => data.countries[cc] || { photos: 0, likes: 0, comments: 0 };
    const text = cc => `${cName(cc)}: ${stats(cc).photos ? `${stats(cc).photos} photo${stats(cc).photos > 1 ? 's' : ''}, ${stats(cc).likes} like${stats(cc).likes === 1 ? '' : 's'}` : 'no photo yet'}`;
    const svg = svgEl('svg', { viewBox: `0 0 ${WORLD_MAP.w} ${WORLD_MAP.h}`, role: 'img', 'aria-label': `World map of ${data.name}` });
    svg.append(svgEl('path', { d: WORLD_MAP.rest, class: 'rest' }));
    const link = (cc, shape) => {
      const a = svgEl('a', { href: gallery(cc), target: '_blank', rel: 'noopener noreferrer' }, svgEl('title', null));
      a.firstChild.textContent = text(cc);
      a.append(shape);
      return a;
    };
    for (const [cc, d] of Object.entries(WORLD_MAP.shapes)) svg.append(link(cc, svgEl('path', { d, class: 'c t' + worldTier(stats(cc).photos), 'data-cc': cc })));
    for (const [cc, [x, y]] of Object.entries(WORLD_MAP.dots)) svg.append(link(cc, svgEl('circle', { cx: x, cy: y, r: 5, class: 'c dot t' + worldTier(stats(cc).photos), 'data-cc': cc })));

    const have = Object.keys(data.countries).filter(cc => data.countries[cc].photos > 0).sort((a, b) => data.countries[b].photos - data.countries[a].photos || cName(a).localeCompare(cName(b)));
    const total = have.reduce((n, cc) => n + data.countries[cc].photos, 0);
    const unmapped = have.filter(cc => !WORLD_MAP.shapes[cc] && !WORLD_MAP.dots[cc]);
    const legend = h('div', { class: 'legend' }, [['t1', '1'], ['t2', '2–9'], ['t3', '10–49'], ['t4', '50–199'], ['t5', '200 +']].map(([c, t]) => h('span', null, h('i', { class: c }), t + (t === '1' ? ' photo' : ' photos'))));
    // the whole world, or Europe close up (where most of the photos are): the same map, another viewBox, the dots at the same size on screen
    const full = `0 0 ${WORLD_MAP.w} ${WORLD_MAP.h}`, close = WORLD_MAP.views.europe.join(' ');
    const zoom = which => {
      svg.setAttribute('viewBox', which === 'europe' ? close : full);
      const k = which === 'europe' ? WORLD_MAP.w / WORLD_MAP.views.europe[2] : 1;
      svg.querySelectorAll('circle').forEach(c => c.setAttribute('r', String(5 / k)));
      views.forEach(([id, b]) => b.classList.toggle('on', id === which));
    };
    const views = [['world', h('button', { type: 'button', class: 'pill on', text: 'World', onclick: () => zoom('world') })], ['europe', h('button', { type: 'button', class: 'pill', text: 'Europe', onclick: () => zoom('europe') })]];
    return h('div', null,
      h('div', { class: 'sum' }, h('b', { text: `${have.length} countr${have.length === 1 ? 'y' : 'ies'}` }), ` of ${Object.keys(data.countries).length}, ${total} photo${total === 1 ? '' : 's'}`),
      h('div', { class: 'views' }, views.map(v => v[1])), svg, legend,
      unmapped.length ? h('p', { class: 'extra' }, 'Not on the map: ', unmapped.flatMap((cc, i) => [i ? ', ' : null, h('a', { class: 'lnk', href: gallery(cc), target: '_blank', rel: 'noopener noreferrer', text: `${cName(cc)} (${data.countries[cc].photos})` })])) : null,
      have.length ? h('details', { class: 'fold' }, h('summary', { text: `All the countries (${have.length})` }),
        h('table', null, h('tr', null, h('th', { text: 'Country' }), h('th', { text: 'Photos' }), h('th', { text: 'Likes' })),
          have.map(cc => h('tr', null, h('td', null, h('a', { class: 'lnk', href: gallery(cc), target: '_blank', rel: 'noopener noreferrer', text: cName(cc) })),
            h('td', { class: 'n', text: String(data.countries[cc].photos) }), h('td', { class: 'n', text: String(data.countries[cc].likes) }))))) : h('p', { class: 'hint', text: 'No photo yet.' }));
  }

  // The window. id: the member to show (default: you, or the member of the profile you are on)
  function worldMapOpen(id) {
    const me = membersMe();
    const start = id || (here.profile && (location.pathname.match(/\/user(\d+)/) || [])[1]) || (me && me.id) || '';
    const view = h('div', { class: 'wmview' });
    const input = h('input', { type: 'text', placeholder: 'Member number or the link of a profile', 'aria-label': 'Member', autocomplete: 'off' });
    const chips = h('div', { class: 'who' });
    const body = h('div', { class: 'wm' }, h('style', { text: worldCss }),
      h('div', { class: 'who' }, input, h('button', { type: 'button', class: 'btn', text: 'Show', onclick: () => go(input.value) })), chips, view);
    const modal = modalOpen({ id: 'pmg-worldmap', title: 'World map', body, actions: [{ label: 'Close', kind: 'ghost', run: () => modal.close() }] });
    const who = [...(me ? [{ id: me.id, name: 'Me (' + me.name + ')' }] : []), ...membersGet().filter(m => !me || m.id !== me.id).slice(0, 8)];
    who.forEach(m => chips.append(h('button', { type: 'button', class: 'pill', text: m.name, onclick: () => go(m.id) })));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(input.value); } });
    let run = 0;
    async function go(text) {
      const member = memberIdOf(text);
      if (!member) { view.replaceChildren(h('p', { class: 'hint', text: 'Type a member number (121559) or paste the link of a profile.' })); return; }
      const mine = ++run;
      input.value = member;
      modal.message(`member ${member}`);
      view.replaceChildren(h('p', { class: 'hint', text: 'Reading the profile…' }));
      try {
        const data = await worldData(member);
        if (mine !== run) return;
        modal.message(`${data.name} · ID ${data.id}`);
        view.replaceChildren(worldView(data));
      } catch (e) { if (mine === run) view.replaceChildren(h('p', { class: 'hint', text: 'Not read: ' + e.message + '.' })); }
    }
    if (start) go(start); else view.replaceChildren(h('p', { class: 'hint', text: 'Type a member number or paste the link of a profile.' }));
    return modal;
  }

  registerFeature({
    id: 'worldmap', label: 'World map',
    groups: [{
      drawer: 'gallery', title: 'World map', about: 'The countries a member has photos from, on a map of the world. Yours, or another member’s.',
      build: () => [h('button', { id: 'wmOpen', type: 'button', class: 'btn', text: 'Open the world map (M)' })]
    }],
    keys: {
      worldmap: { code: 'KeyM', label: 'Open the world map', run: () => { worldMapOpen(); return true; }, hintOrder: 60 }
    },
    init: () => { $('wmOpen').onclick = () => worldMapOpen(); }
  });
