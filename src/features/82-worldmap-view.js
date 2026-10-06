  /* =====================================================================
   *  WORLD MAP, THE VIEW  (the countries of one member's data on the map of the world: shades, links, list)
   *    The data and the window are in 81-worldmap.js; the shapes in src/lib/worldmap.js; pan and zoom in src/lib/panzoom.js.
   * ===================================================================== */
  // 1 photo, 2-9, 10-49, 50-199, 200 and more -> 1..5; none -> 0
  const worldTier = n => (n >= 200 ? 5 : n >= 50 ? 4 : n >= 10 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0);
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
    const legend = h('div', { class: 'legend' }, [['t0', 'none'], ['t1', '1'], ['t2', '2–9'], ['t3', '10–49'], ['t4', '50–199'], ['t5', '200 +']].map(([c, t]) => h('span', null, h('i', { class: c }), t === 'none' ? 'no photo' : t + (t === '1' ? ' photo' : ' photos'))));
    // Zoom and move (src/lib/panzoom.js); the dots keep the same size on screen
    const pz = panZoom(svg, { w: WORLD_MAP.w, h: WORLD_MAP.h, onChange: zoom => svg.querySelectorAll('circle').forEach(c => c.setAttribute('r', String(5 / zoom))) });
    const views = pz.toolbar([{ label: 'Europe', title: 'Europe close up', view: WORLD_MAP.views.europe }]);
    return h('div', null,
      h('div', { class: 'sum' }, h('b', { text: `${have.length} countr${have.length === 1 ? 'y' : 'ies'}` }), ` of ${Object.keys(data.countries).length}, ${total} photo${total === 1 ? '' : 's'}`),
      views, svg, legend,
      unmapped.length ? h('p', { class: 'extra' }, 'Not on the map: ', unmapped.flatMap((cc, i) => [i ? ', ' : null, h('a', { class: 'lnk', href: gallery(cc), target: '_blank', rel: 'noopener noreferrer', text: `${cName(cc)} (${data.countries[cc].photos})` })])) : null,
      have.length ? h('details', { class: 'fold' }, h('summary', { text: `All the countries (${have.length})` }),
        h('table', null, h('tr', null, h('th', { text: 'Country' }), h('th', { text: 'Photos' }), h('th', { text: 'Likes' })),
          have.map(cc => h('tr', null, h('td', null, h('a', { class: 'lnk', href: gallery(cc), target: '_blank', rel: 'noopener noreferrer', text: cName(cc) })),
            h('td', { class: 'n', text: String(data.countries[cc].photos) }), h('td', { class: 'n', text: String(data.countries[cc].likes) }))))) : h('p', { class: 'hint', text: 'No photo yet.' }));
  }
