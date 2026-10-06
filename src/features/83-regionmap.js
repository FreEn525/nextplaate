  /* =====================================================================
   *  REGION MAP  (the regions of one country, in the window of the world map: departments, districts, states...)
   *    Three things are put together: the list of the regions of the country (the site's search page, /<cc>/search: id, code, name), the
   *    member's photos per region (the site's region statistics, the page of the "system" of the country, one row per region id) and the
   *    shapes (geoBoundaries, src/lib/regions-geo.js), matched by name or code (src/lib/regions-match.js). Only the countries of
   *    REGION_MAPS (src/lib/regions-levels.js) have a map; the regions that find no shape are listed under it, with their photos.
   * ===================================================================== */
  // The regions of a country with the member's photos, from the site's region statistics: the page of each system of the country (fr1 and
  // fr2 for France...). A row is { id, code, name, count, href }; an id can hold several ("10077_10097"), the sum of their photos is the count.
  async function regionRows(cc, memberId) {
    const menu = (await regionsAsk('fr1', memberId)).systems.filter(s => s.code.replace(/\d$/, '') === cc);
    const rows = [];
    for (const s of menu.length ? menu : [{ code: cc }]) {
      try { (await regionsAsk(s.code, memberId)).rows.filter(r => r.region).forEach(r => rows.push(r)); } catch (e) { /* a system the site does not answer for */ }
    }
    return rows;
  }

  async function regionMapView(cc, data) {
    const [iso, level] = REGION_MAPS[cc];
    const [regions, geo] = await Promise.all([regionRows(cc, data.id), regionShapes(iso, level)]);
    const { placed, missing } = regionMatch(regions, geo.shapes, cc);
    const count = r => r.count;
    const link = r => r.href || `/${cc}/gallery.php?usr=${data.id}`;
    const svg = svgEl('svg', { viewBox: `0 0 ${geo.w} ${geo.h}`, role: 'img', 'aria-label': `${cName(cc)}: the regions of ${data.name}` });
    const tierOf = new Array(geo.shapes.length).fill(null);                      // the region each shape belongs to
    regions.forEach(r => (placed.get(r.id) || []).forEach(i => { if (!tierOf[i] || count(r) > count(tierOf[i])) tierOf[i] = r; }));
    geo.shapes.forEach((s, i) => {
      const r = tierOf[i], n = r ? count(r) : 0;
      const shape = svgEl('path', { d: s.d, class: 'c t' + worldTier(n), 'data-key': r ? r.id : '' });
      const title = svgEl('title', null);
      title.textContent = r ? `${r.code ? r.code + ' ' : ''}${r.name}: ${n ? n + ' photo' + (n > 1 ? 's' : '') : 'no photo yet'}` : s.name;
      svg.append(r && n ? svgEl('a', { href: link(r), target: '_blank', rel: 'noopener noreferrer' }, title, shape) : svgEl('g', null, title, shape));
    });
    const pz = panZoom(svg, { w: geo.w, h: geo.h, home: 'Whole country' });
    const seen = regions.filter(r => count(r) > 0).sort((a, b) => count(b) - count(a));
    const lost = missing.filter(r => count(r) > 0);
    const total = seen.reduce((n, r) => n + count(r), 0);
    const side = [
      h('div', { class: 'sum' }, h('b', { text: `${seen.length} of ${regions.length} regions` }), h('span', { text: `${cName(cc)} · ${total} photo${total === 1 ? '' : 's'}` })),
      seen.length ? h('ul', { class: 'rows' }, seen.map(r => mapRow({ key: r.id, label: `${r.code ? r.code + ' ' : ''}${r.name}`, href: link(r), n: count(r), max: count(seen[0]) }))) : h('p', { class: 'msg', text: 'No photo in a region yet.' }),
      h('div', { class: 'foot' },
        lost.length ? h('p', null, 'Not on the map: ', lost.flatMap((r, i) => [i ? ', ' : null, h('a', { class: 'lnk', href: link(r), target: '_blank', rel: 'noopener noreferrer', text: `${r.name} (${count(r)})` })])) : null,
        h('p', { text: `${placed.size} of ${regions.length} regions are on the map. Shapes: geoBoundaries (${geo.license}, ${geo.year}).` }))
    ];
    return mapLayout({ svg, tools: pz.toolbar(), legend: mapLegend(), tip: 'Scroll to zoom · drag to move', side });
  }
