  /* =====================================================================
   *  REGION MATCHING  (the regions of the site, to the shapes of a map)
   *    The site names a region by a code and a name ("01 - Ain", "AC - Aleksandrovac"), sometimes several at once ("Augsburg City,
   *    Augsburg Dist", "Munich and Rosenheim Districts (Bad Aibling)"), and a region can group several ids. The shapes have a name and,
   *    for some countries, an ISO 3166-2 code. In order, a region is placed on:
   *      1. the shapes whose normalised name equals one of its names (a shape "Aachen, Stadteregion" answers to "aachen" too);
   *      2. the shapes the country's alias table names (src/lib/regions-alias.js: "chechen" -> "chechnya");
   *      3. the shapes whose ISO code ends with its code (only where the plate codes are the ISO codes: REGION_CODE_COUNTRIES);
   *      4. the one shape whose name is a few letters away (Mangistau/Mangystau) or a prefix of it (Chuvash/Chuvashia), when it is alone;
   *      5. the same with the names inside brackets (the old seat of a district), which are never looked at before.
   *    Entries that are not an area (Mopeds, Historic vehicles, Ministry, the countries of diplomatic plates...) are set apart: they have no
   *    place on a map.
   *      regionMatch(regions, shapes, cc) -> { placed: Map(regionId -> [shape index]), missing: [region], special: [region] }
   * ===================================================================== */
  const REGION_WORDS = /\b(city|town|district|districts|dist|region|oblast|republic|krai|kray|autonomous|okrug|municipality|county|kreis|landkreis|stadt|stadtkreis|kreisfreie|of|the|and|rural|urban|prefecture|province|department|departement|canton|commune|powiat|miasto|gmina|okres|raion|rayon|former|capital|governorate|state)\b/g;
  const REGION_ARTICLES = /\b(la|las|el|los|le|les|al)\b/g;
  // not an area: the plates of a kind of vehicle or of an office
  const REGION_SPECIAL = /\b(moped|mopeds|vehicles?|plates?|trailers?|dealers?|tax.?exempt|offshore|ministry|nationwide|diplomatic|military|army|forces|police|guard|temporary|historic|tourist\w*|export|transit|special|motorcycles?|taxi|official|government|consulates?|vanity|provisional|agricultural|electric|test|administration|zones?|series|senate|assembly|council|ministers|bank|organi[sz]ation|secretariat|authority|union|programme|fund|institute|agency|commission|court|embassy|united nations|european)\b/i;
  // the countries whose plate codes are the ISO 3166-2 codes of their regions (elsewhere a code that looks alike is another place: B is Batken, not Bishkek)
  const REGION_CODE_COUNTRIES = ['us', 'ca', 'au', 'it', 'br', 'ch'];
  // the combining marks that normalize('NFKD') leaves after the letters, written without a non-ASCII character in the source
  const REGION_MARKS = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');

  // the letters that NFKD does not take apart, as plain letters (o with a stroke, ae, oe, sharp s, l with a stroke, d with a stroke, eth, thorn, dotless i)
  const REGION_LETTERS = { 0xf8: 'o', 0xe6: 'ae', 0x153: 'oe', 0xdf: 'ss', 0x142: 'l', 0x111: 'd', 0xf0: 'd', 0xfe: 'th', 0x131: 'i' };
  const regionLetters = text => text.replace(/[^\x00-\x7f]/g, c => REGION_LETTERS[c.charCodeAt(0)] || c);

  function regionNorm(text) {
    return regionLetters(String(text || '').normalize('NFKD').replace(REGION_MARKS, '').toLowerCase()).replace(REGION_WORDS, ' ').replace(/[^a-z0-9]+/g, ' ').replace(REGION_ARTICLES, ' ').replace(/\s+/g, ' ').trim();
  }

  // The names a text holds, each normalised: main = the parts outside brackets ("A, B", "A and B", "A or B"), extra = what is inside brackets
  // (often the old seat of a district: "Saale District (Querfurt)"), used only when no main name finds a shape
  function regionNames(text) {
    const t = String(text || '');
    const outer = t.replace(/\([^)]*\)/g, ' ');
    const clean = list => [...new Set(list.map(regionNorm).filter(n => n.length > 1))];
    return { main: clean([...outer.split(/[,;/]|\band\b|\bor\b/), outer]), extra: clean((t.match(/\(([^)]*)\)/g) || []).map(x => x.slice(1, -1))) };
  }

  // The edit distance between two words, or max + 1 when it is more than max
  function regionDistance(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const row = [i];
      for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = row;
    }
    return Math.min(prev[b.length], max + 1);
  }

  // The names of the countries (the site's own list): the regions of diplomatic plates are named after them, and are no area
  const regionIsCountry = text => typeof COUNTRIES !== 'undefined' && COUNTRIES.some(c => regionNorm(c.name) === regionNorm(text));

  function regionMatch(regions, shapes, cc) {
    const byName = new Map(), byCode = new Map();
    shapes.forEach((s, i) => {
      regionNames(s.name.replace(/\s+nor$/i, '')).main.forEach(n => byName.set(n, [...(byName.get(n) || []), i]));        // Norway's shapes end with "nor"
      const code = (s.iso || '').includes('-') ? s.iso.split('-').pop().toLowerCase() : '';
      if (code) byCode.set(code, [...(byCode.get(code) || []), i]);
    });
    const alias = (typeof REGION_ALIAS !== 'undefined' && REGION_ALIAS[cc]) || {};
    const known = [...byName.keys()];
    const placed = new Map(), missing = [], special = [];
    for (const r of regions) {
      const found = new Set();
      const { main, extra } = regionNames(r.name);
      const add = key => (byName.get(key) || []).forEach(i => found.add(i));
      main.forEach(add);
      main.forEach(n => alias[n] && add(alias[n]));
      if (!found.size && r.code && REGION_CODE_COUNTRIES.includes(cc)) (byCode.get(r.code.toLowerCase()) || []).forEach(i => found.add(i));
      for (const group of found.size ? [] : [main, extra]) {
        for (const n of group.filter(x => x.length >= 5)) {
          const limit = n.length <= 7 ? 1 : n.length <= 12 ? 2 : 3;
          let best = [], bestD = limit + 1;
          for (const k of known) {
            const d = (k.startsWith(n) || n.startsWith(k)) && Math.min(k.length, n.length) >= 5 ? 0 : regionDistance(n, k, limit);
            if (d < bestD) { bestD = d; best = [k]; } else if (d === bestD && d <= limit) best.push(k);
          }
          // alone, or all of the same family (a city that is several districts: Bratislava I, II, III...)
          if (best.length === 1 || (bestD === 0 && best.every(k => k.startsWith(n)))) best.forEach(add);
          if (found.size) break;
        }
        if (found.size) break;
      }
      if (found.size) placed.set(r.id, [...found]);
      else if (REGION_SPECIAL.test(r.name) || regionIsCountry(r.name)) special.push(r);
      else missing.push(r);
    }
    return { placed, missing, special };
  }
