  /* =====================================================================
   *  WORLD MAP, THE VIEW  (the countries of one member's data on the map of the world: shades, links, ranked list)
   *    The data and the window are in 81-worldmap.js; the frame and the list lines in src/ui/09-map-layout.js; the shapes in
   *    src/lib/worldmap.js; pan and zoom in src/lib/panzoom.js.
   * ===================================================================== */
  // 1 photo, 2-9, 10-49, 50-199, 200 and more -> 1..5; none -> 0
  const worldTier = n => (n >= 200 ? 5 : n >= 50 ? 4 : n >= 10 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0);
  const mapLegend = () => h('div', { class: 'legend' }, h('span', null, 'Photos'), [['t0', 'no photo'], ['t1', '1'], ['t2', '2–9'], ['t3', '10–49'], ['t4', '50–199'], ['t5', '200 +']].map(([c, t]) => h('span', null, h('i', { class: c }), t)));

  // The map, with its column, for one member's data. openRegions(cc): what the "Regions" button of a country does.
  function worldView(data, openRegions) {
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
    for (const [cc, d] of Object.entries(WORLD_MAP.shapes)) svg.append(link(cc, svgEl('path', { d, class: 'c t' + worldTier(stats(cc).photos), 'data-cc': cc, 'data-key': cc })));
    for (const [cc, [x, y]] of Object.entries(WORLD_MAP.dots)) svg.append(link(cc, svgEl('circle', { cx: x, cy: y, r: 5, class: 'c dot t' + worldTier(stats(cc).photos), 'data-cc': cc, 'data-key': cc })));

    const have = Object.keys(data.countries).filter(cc => data.countries[cc].photos > 0).sort((a, b) => data.countries[b].photos - data.countries[a].photos || cName(a).localeCompare(cName(b)));
    const total = have.reduce((n, cc) => n + data.countries[cc].photos, 0);
    const unmapped = have.filter(cc => !WORLD_MAP.shapes[cc] && !WORLD_MAP.dots[cc]);
    const max = have.length ? data.countries[have[0]].photos : 1;
    // Zoom and move (src/lib/panzoom.js); the dots keep the same size on screen
    const pz = panZoom(svg, { w: WORLD_MAP.w, h: WORLD_MAP.h, onChange: zoom => svg.querySelectorAll('circle').forEach(c => c.setAttribute('r', String(5 / zoom))) });
    const side = [
      h('div', { class: 'sum' }, h('b', { text: `${have.length} countr${have.length === 1 ? 'y' : 'ies'}` }), h('span', { text: `of ${Object.keys(data.countries).length} · ${total} photo${total === 1 ? '' : 's'}` })),
      have.length
        ? h('ul', { class: 'rows' }, have.map(cc => mapRow({ key: cc, label: cName(cc), href: gallery(cc), n: data.countries[cc].photos, max, go: REGION_MAPS[cc] ? () => openRegions(cc) : null })))
        : h('p', { class: 'msg', text: 'No photo yet.' }),
      unmapped.length ? h('div', { class: 'foot' }, h('p', null, 'Not on the map: ', unmapped.flatMap((cc, i) => [i ? ', ' : null, h('a', { class: 'lnk', href: gallery(cc), target: '_blank', rel: 'noopener noreferrer', text: `${cName(cc)} (${data.countries[cc].photos})` })]))) : null
    ];
    return mapLayout({ svg, tools: pz.toolbar([{ label: 'Europe', title: 'Europe close up', view: WORLD_MAP.views.europe }]), legend: mapLegend(), tip: 'Scroll to zoom · drag to move', side });
  }
