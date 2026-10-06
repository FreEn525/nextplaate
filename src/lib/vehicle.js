  /* =====================================================================
   *  VEHICLE  (what PlatesMania knows about brands, models and generations, and how to use it)
   *    The upload page carries the whole catalogue: the brand menu (markaavto) and four tables of its script (bmObject: brand ->
   *    models, modelObject: model -> name, bmgObject: model -> generations, modgenObject: generation -> name and years).
   *      vehicleData()                      the catalogue of the page
   *      vehicleGuess(texts, data)          the likely brand, model and generation named in some texts (titles, captions...)
   *      vehicleFill(path)                  chooses brand, model, generation in the menus of the page
   *      vehicleCurrent()                   the values the menus have now
   *    A guess is [{ category, level, candidates: [{ id, path, name }] }]: level 0 brand, 1 model, 2 generation; path = the menu
   *    values from the brand down to the candidate, which is what vehicleFill takes.
   * ===================================================================== */
  const vehicleMenus = () => [document.querySelector('select[name="markaavto"]'), document.getElementById('model'), document.getElementById('modgen')];
  const vehicleCurrent = () => vehicleMenus().map(el => (el ? el.value : ''));
  const vehiclePage = () => (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);

  function vehicleData() {
    const w = vehiclePage();
    const brands = [...document.querySelectorAll('select[name="markaavto"] option')].filter(o => +o.value > 0 && +o.value !== 200).map(o => ({ id: o.value, name: o.textContent.trim() }));
    return { brands, models: w.bmObject || {}, modelNames: w.modelObject || {}, gens: w.bmgObject || {}, genNames: w.modgenObject || {} };
  }

  // Fills the menus the way the page fills them: a change event runs the page's own onchange (changeBrand, changeModel), which
  // fills the next menu. path: [brandId, modelId, generationId], as far as it goes.
  function vehicleFill(path) {
    const menus = vehicleMenus();
    path.forEach((id, i) => {
      const el = menus[i];
      if (!el || id === undefined || el.value === String(id)) return;
      el.value = String(id);
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  const vehicleNorm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  // A text near the top of a list counts more than one far down
  const vehicleWeight = i => 1 / (1 + i / 10);

  // names: [[id, name]] -> [[id, score]] best first. loose: a name written without spaces also counts inside a longer word (RS6 in
  // RS6Avant); brands are whole words only ("ogle" is in "Google"). A candidate far behind the first one is page noise, not a second
  // guess: it needs a quarter of the best score.
  function vehicleScore(texts, names, minLength, loose) {
    const padded = texts.map(t => ' ' + vehicleNorm(t) + ' ');
    const compact = padded.map(t => t.replace(/ /g, ''));
    const found = new Map();
    for (const [id, name] of names) {
      const n = vehicleNorm(name), c = n.replace(/ /g, '');
      if (!n || c.length < minLength || /^\d+$/.test(c)) continue;
      let score = 0;
      padded.forEach((t, i) => { if (t.includes(' ' + n + ' ') || (loose && c.length >= 3 && compact[i].includes(c))) score += vehicleWeight(i); });
      if (score) found.set(id, score);
    }
    const sorted = [...found].sort((a, b) => b[1] - a[1]);
    return sorted.filter(f => f[1] >= sorted[0][1] / 4);
  }

  // The year range of a generation name: "4th gen (C8/4K5), 2019–" -> [2019, 9999]; "Mk7, 2012–2019" -> [2012, 2019]
  function vehicleYears(name) {
    const m = String(name).match(/(\d{4})\s*[–—-]\s*(\d{4})?\s*$/) || String(name).match(/(\d{4})\s*$/);
    return m ? [+m[1], m[2] ? +m[2] : (/[–—-]\s*$/.test(name) ? 9999 : +m[1])] : null;
  }

  function vehicleGuess(texts, d) {
    const brandNames = d.brands.map(b => [b.id, b.name.replace(/\s*\(.*\)\s*$/, '')]);
    const brands = vehicleScore(texts, brandNames, 3);
    const top = brands[0] && brands[0][0];
    const out = [{ category: 'Brand', level: 0, candidates: brands.slice(0, 3).map(([id]) => ({ id, path: [id], name: d.brands.find(b => b.id === id).name })) }];
    const models = vehicleScore(texts, (top ? d.models[top] || [] : []).map(id => [String(id), d.modelNames[id]]), 2, true);
    out.push({ category: 'Model', level: 1, candidates: models.slice(0, 3).map(([id]) => ({ id, path: [top, id], name: d.modelNames[id] })) });
    // the generations of the best model whose years are the ones named in the texts
    const years = texts.join(' ').match(/\b(19[2-9]\d|20[0-3]\d)\b/g) || [];
    const gens = (models[0] ? d.gens[models[0][0]] || [] : []).filter(id => String(d.genNames[id]) !== '0').map(id => {
      const r = vehicleYears(d.genNames[id]);
      return [String(id), r ? years.filter(y => +y >= r[0] && +y <= r[1]).length : 0];
    }).filter(g => g[1]).sort((x, y) => y[1] - x[1]);
    out.push({ category: 'Generation', level: 2, candidates: gens.slice(0, 3).map(([id]) => ({ id, path: [top, models[0][0], id], name: d.genNames[id] })) });
    return out;
  }
