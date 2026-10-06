  /* =====================================================================
   *  REGION SHAPES  (the boundaries of the regions of a country, from geoBoundaries, loaded when a map asks for them)
   *    geoBoundaries (CC-BY 4.0, an open public API) gives, for a country (ISO 3166 alpha-3) and a level (ADM1 regions, ADM2
   *    departments or districts, ADM3...), the shapes as GeoJSON. Nothing is shipped in the script: the API names the file of the
   *    simplified shapes, the file is fetched once per visit, then drawn: equirectangular projection corrected for the latitude of
   *    the country, 1000 units wide, points closer than a tolerance dropped (the files hold far more points than a screen shows).
   *      const geo = await regionShapes('FRA', 'ADM2');   // { w, h, shapes: [{ name, iso, d }] }
   * ===================================================================== */
  const REGION_API = 'https://www.geoboundaries.org/api/current/gbOpen/';
  const regionGeoCache = new Map();

  async function regionFetchJson(url) {
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 60000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error('geoBoundaries answered ' + res.status);
      return await res.json();
    } finally { clearTimeout(timer); }
  }

  // The rings of a feature, as [[lon, lat], ...] lists
  const regionRings = geometry => (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates).flat();

  // A path in map units for the rings, keeping a point only when it is farther than `tol` from the last one kept
  function regionPath(rings, project, tol) {
    let d = '';
    for (const ring of rings) {
      let last = null, pts = [];
      for (const [lon, lat] of ring) {
        const p = project(lon, lat);
        if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < tol) continue;
        pts.push(p[0].toFixed(1) + ' ' + p[1].toFixed(1));
        last = p;
      }
      if (pts.length > 2) d += 'M' + pts.join('L') + 'Z';          // a ring that shrinks to a point or a line is dropped
    }
    return d;
  }

  async function regionShapes(iso3, level) {
    const key = iso3 + level;
    if (regionGeoCache.has(key)) return regionGeoCache.get(key);
    const meta = await regionFetchJson(`${REGION_API}${iso3}/${level}/`);
    const geo = await regionFetchJson(meta.simplifiedGeometryGeoJSON);
    let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
    for (const f of geo.features) for (const ring of regionRings(f.geometry)) for (const [lon, lat] of ring) { x0 = Math.min(x0, lon); x1 = Math.max(x1, lon); y0 = Math.min(y0, lat); y1 = Math.max(y1, lat); }
    const k = 1000 / ((x1 - x0) * Math.cos((y0 + y1) / 2 * Math.PI / 180));
    const project = (lon, lat) => [(lon - x0) * Math.cos((y0 + y1) / 2 * Math.PI / 180) * k, (y1 - lat) * k];
    const h_ = Math.ceil((y1 - y0) * k) + 2;
    const shapes = geo.features.map(f => ({ name: f.properties.shapeName || '', iso: f.properties.shapeISO || '', d: regionPath(regionRings(f.geometry), project, 0.6) })).filter(s => s.d);
    const result = { w: 1000, h: h_, shapes, license: meta.boundaryLicense || '', year: meta.boundaryYearRepresented || '' };
    regionGeoCache.set(key, result);
    return result;
  }
