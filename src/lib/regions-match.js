  /* =====================================================================
   *  REGION MATCHING  (the regions of the site, to the shapes of a map)
   *    The site names a region by a code and a name ("01 - Ain", "AC - Aleksandrovac"), sometimes several at once ("Augsburg City,
   *    Augsburg Dist"), and a region can group several ids (Moscow: 10077_10097_10099...). The shapes have a name and, for some countries,
   *    an ISO 3166-2 code. A region is placed on the shapes whose normalised name equals one of its names, or whose ISO code ends with
   *    its code. What cannot be placed is listed beside the map, never dropped.
   *      regionMatch(regions, shapes) -> { placed: Map(regionId -> [shape index]), missing: [region] }
   * ===================================================================== */
  const REGION_WORDS = /\b(city|town|district|dist|region|oblast|republic|krai|kray|autonomous|okrug|municipality|county|kreis|landkreis|stadt|of|the|and|rural|urban|prefecture|province|department|departement|canton|commune)\b/g;

  function regionNorm(text) {
    return String(text || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(REGION_WORDS, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function regionMatch(regions, shapes) {
    const byName = new Map(), byCode = new Map();
    shapes.forEach((s, i) => {
      const n = regionNorm(s.name);
      if (n) byName.set(n, [...(byName.get(n) || []), i]);
      const code = s.iso.includes('-') ? s.iso.split('-').pop().toLowerCase() : '';
      if (code) byCode.set(code, [...(byCode.get(code) || []), i]);
    });
    const placed = new Map(), missing = [];
    for (const r of regions) {
      const found = new Set();
      String(r.name).split(/[,;/]|\bor\b/).concat([r.name]).map(regionNorm).filter(Boolean).forEach(n => (byName.get(n) || []).forEach(i => found.add(i)));
      if (!found.size && r.code) (byCode.get(r.code.toLowerCase()) || []).forEach(i => found.add(i));
      if (found.size) placed.set(r.id, [...found]); else missing.push(r);
    }
    return { placed, missing };
  }
