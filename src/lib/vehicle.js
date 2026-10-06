  /* =====================================================================
   *  VEHICLE  (what PlatesMania knows about brands, models and generations, and how to use it)
   *    The upload page carries the whole catalogue: the brand menu (markaavto) and four tables of its script (bmObject: brand ->
   *    models, modelObject: model -> name, bmgObject: model -> generations, modgenObject: generation -> name and years).
   *      vehicleData()                      the catalogue of the page
   *      vehicleGuess(texts, data)          the likely brand, model and generation named in some texts (titles, captions...)
   *      vehicleFill(path)                  chooses brand, model, generation in the menus of the page
   *      vehicleSearchBox(text)             types a text in the site's own "brand and model" box (it finds the vehicle itself)
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

  // The site's own box for "brand and model" (a text with autocomplete): what is typed there is resolved by the site itself
  function vehicleSearchBox(text) {
    const box = document.getElementById('markamodtype');
    if (!box) return false;
    const jq = vehiclePage().jQuery;
    try { if (jq) { jq(box).val(text).autocomplete('search', text); return true; } } catch (e) { /* the plain way below */ }
    box.value = text;
    box.dispatchEvent(new Event('input', { bubbles: true }));
    box.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  const VEHICLE_STRONG = 5;      // what Google itself names counts as five titles: its naming is a curated entity, a title is a page's words
  const vehicleNorm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  // A text near the top of a list counts more than one far down
  const vehicleWeight = i => 1 / (1 + i / 10);

  // names: [[id, name]] -> [[id, score]] best first. A whole word counts 1. loose: a name written without spaces also counts 0.5
  // inside a longer word (RS6 in RS6Avant, but also Gol in Golf); brands are whole words only ("ogle" is in "Google"). A name that is
  // part of a longer candidate which scores as well (Gol, Golf) is that candidate's echo: dropped. A candidate far behind the first
  // one is page noise, not a second guess: it needs a quarter of the best score.
  // The first `strong` texts are named by an authority (what Google calls the vehicle): each counts as much as VEHICLE_STRONG ordinary texts.
  function vehicleScore(texts, names, minLength, loose, strong) {
    const padded = texts.map(t => ' ' + vehicleNorm(t) + ' ');
    const compact = padded.map(t => t.replace(/ /g, ''));
    const found = new Map();
    for (const [id, name] of names) {
      const n = vehicleNorm(name), c = n.replace(/ /g, '');
      if (!n || c.length < minLength || /^\d+$/.test(c)) continue;
      let score = 0;
      padded.forEach((t, i) => { score += (i < strong ? VEHICLE_STRONG : vehicleWeight(i - (strong || 0))) * (t.includes(' ' + n + ' ') ? 1 : loose && c.length >= 3 && compact[i].includes(c) ? 0.5 : 0); });
      if (score) found.set(id, [score, c]);
    }
    const all = [...found].map(([id, [score, c]]) => [id, score, c]).sort((a, b) => b[1] - a[1]);
    const kept = all.filter(a => !all.some(b => b !== a && b[2].length > a[2].length && b[2].includes(a[2]) && b[1] >= a[1] * 0.8));
    return kept.filter(f => f[1] >= kept[0][1] / 4).map(f => [f[0], f[1]]);
  }

  // The year range of a generation name: "4th gen (C8/4K5), 2019–" -> [2019, 9999]; "Mk7, 2012–2019" -> [2012, 2019]
  function vehicleYears(name) {
    const m = String(name).match(/(\d{4})\s*[–—-]\s*(\d{4})?\s*$/) || String(name).match(/(\d{4})\s*$/);
    return m ? [+m[1], m[2] ? +m[2] : (/[–—-]\s*$/.test(name) ? 9999 : +m[1])] : null;
  }

  // pin: { brand, model } the user chose: the models are those of that brand, the generations those of that model (a click on a
  // generation must never change the model the user picked)
  function vehicleGuess(texts, d, pin, strong) {
    pin = pin || {};
    const brandNames = d.brands.map(b => [b.id, b.name.replace(/\s*\(.*\)\s*$/, '')]);
    const brands = vehicleScore(texts, brandNames, 3, false, strong);
    const top = pin.brand || (brands[0] && brands[0][0]);
    const out = [{ category: 'Brand', level: 0, candidates: brands.slice(0, 3).map(([id]) => ({ id, path: [id], name: d.brands.find(b => b.id === id).name })) }];
    const models = vehicleScore(texts, (top ? d.models[top] || [] : []).map(id => [String(id), d.modelNames[id]]), 2, true, strong);
    out.push({ category: 'Model', level: 1, candidates: models.slice(0, 3).map(([id]) => ({ id, path: [top, id], name: d.modelNames[id] })) });
    const model = pin.model || (models[0] && models[0][0]);
    // the generations of that model (the best one unless pinned) whose years are the ones named in the texts
    const years = texts.join(' ').match(/\b(19[2-9]\d|20[0-3]\d)\b/g) || [];
    const gens = (model ? d.gens[model] || [] : []).filter(id => String(d.genNames[id]) !== '0').map(id => {
      const r = vehicleYears(d.genNames[id]);
      return [String(id), r ? years.filter(y => +y >= r[0] && +y <= r[1]).length : 0];
    }).filter(g => g[1]).sort((x, y) => y[1] - x[1]);
    out.push({ category: 'Generation', level: 2, candidates: gens.slice(0, 3).map(([id]) => ({ id, path: [top, model, id], name: d.genNames[id] })) });
    return out;
  }
