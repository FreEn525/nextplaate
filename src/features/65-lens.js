  /* =====================================================================
   *  GOOGLE LENS  (in the panel: the photo is searched on Google Lens, the answer is shown as brand / model / generation)
   *    1. The panel saves the photo for the Google side (66-lens-google.js) and opens Google in a tab. On the upload page this
   *       happens by itself as soon as a photo is chosen.
   *    2. The Google side puts the photo in Google's "paste an image link" box, then, on the results page, writes down the titles
   *       of the results (GM storage: the two tabs are on different sites).
   *    3. This file reads those titles and compares them with the brands, models and generations of PlatesMania's own menus
   *       (bmObject, modelObject, bmgObject, modgenObject of the upload page): three candidates for each of the three.
   *    The answer is only shown here: nothing is typed into the form.
   * ===================================================================== */
  settings.define('lens_auto', '1', 'Search each new photo on Google Lens', 'lens');

  // ---- the photo
  // On the upload page the preview #zoomimg (a 1-pixel placeholder until a photo is chosen; its address is the photo itself while
  // it is not published), on another page the main photo. '' when there is none.
  const LENS_PLACEHOLDER = /^data:image\/gif/i;
  function lensPhoto() {
    const img = here.add ? document.getElementById('zoomimg') : [...document.images].find(i => /\/\/img\d+\.platesmania\.com\/\d+\/m\/\d+\.jpg/i.test(i.src));
    return img && img.src && !LENS_PLACEHOLDER.test(img.src) ? img.src.replace(/\/s\/(\d+\.jpg)/, '/m/$1') : '';
  }

  // ---- what PlatesMania knows (the menus and the data of the upload page)
  const lensPage = () => (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);
  function lensData() {
    const w = lensPage();
    const brands = [...document.querySelectorAll('select[name="markaavto"] option')].filter(o => +o.value > 0 && +o.value !== 200).map(o => ({ id: o.value, name: o.textContent.trim() }));
    return { brands, models: w.bmObject || {}, modelNames: w.modelObject || {}, gens: w.bmgObject || {}, genNames: w.modgenObject || {} };
  }

  // ---- the comparison
  const lensNorm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  // A title is a result of Lens ("2019 Audi RS6 Avant - Wikipedia"); a result near the top counts more than one far down
  const lensWeight = i => 1 / (1 + i / 10);

  // loose: a name written without spaces also counts inside a longer word (RS6 in RS6Avant); brands are whole words only
  // ("ogle" is in "Google"). A candidate far behind the first one is page noise, not a second guess: it needs a quarter of its score.
  function lensScore(titles, names, minLength, loose) {
    const padded = titles.map(t => ' ' + lensNorm(t) + ' ');
    const compact = padded.map(t => t.replace(/ /g, ''));
    const found = new Map();
    for (const [id, name] of names) {
      const n = lensNorm(name), c = n.replace(/ /g, '');
      if (!n || c.length < minLength || /^\d+$/.test(c)) continue;
      let score = 0;
      padded.forEach((t, i) => { if (t.includes(' ' + n + ' ') || (loose && c.length >= 3 && compact[i].includes(c))) score += lensWeight(i); });
      if (score) found.set(id, score);
    }
    const sorted = [...found].sort((a, b) => b[1] - a[1]);
    return sorted.filter(f => f[1] >= sorted[0][1] / 4);
  }

  // The year range of a generation name: "4th gen (C8/4K5), 2019–" -> [2019, 9999]; "Mk7, 2012–2019" -> [2012, 2019]
  function lensYears(name) {
    const m = String(name).match(/(\d{4})\s*[–—-]\s*(\d{4})?\s*$/) || String(name).match(/(\d{4})\s*$/);
    return m ? [+m[1], m[2] ? +m[2] : (/[–—-]\s*$/.test(name) ? 9999 : +m[1])] : null;
  }

  // titles -> [{ category, candidates: [name, name, name] }]
  function lensGuess(titles, d) {
    const brandNames = d.brands.map(b => [b.id, b.name.replace(/\s*\(.*\)\s*$/, '')]);
    const brands = lensScore(titles, brandNames, 3);
    const out = [{ category: 'Brand', candidates: brands.slice(0, 3).map(([id]) => d.brands.find(b => b.id === id).name) }];
    const top = brands[0] && brands[0][0];
    const modelIds = top ? d.models[top] || [] : [];
    const models = lensScore(titles, modelIds.map(id => [id, d.modelNames[id]]), 2, true);
    out.push({ category: 'Model', candidates: models.slice(0, 3).map(([id]) => d.modelNames[id]) });
    // the generations of the best model whose years are the ones named in the titles
    const years = titles.join(' ').match(/\b(19[2-9]\d|20[0-3]\d)\b/g) || [];
    const gens = (models[0] ? d.gens[models[0][0]] || [] : []).filter(id => String(d.genNames[id]) !== '0').map(id => {
      const r = lensYears(d.genNames[id]);
      return [d.genNames[id], r ? years.filter(y => +y >= r[0] && +y <= r[1]).length : 0];
    }).filter(g => g[1]).sort((a, b) => b[1] - a[1]);
    out.push({ category: 'Generation', candidates: gens.slice(0, 3).map(g => g[0]) });
    return out;
  }

  function lensShow(rows) {
    const out = $('lensOut');
    out.textContent = '';
    for (const r of rows) {
      out.appendChild(h('div', { class: 'lens-cat', text: r.category }));
      out.appendChild(h('div', { class: 'lens-cands' }, ...[0, 1, 2].map(i => h('span', { class: 'lens-cand', text: r.candidates[i] || '—' }))));
    }
  }

  // ---- the search
  let lensStamp = 0, lensTimer = null;
  const lensSay = text => { const el = $('lensMsg'); if (el) el.textContent = text; };

  // Hands the photo to the Google side and opens Google; in the background when the search starts by itself
  function lensStart(photo, background) {
    lensStamp = Date.now();
    GM_setValue('lens_image', photo);
    GM_setValue('lens_pending', lensStamp);
    GM_setValue('lens_titles', '');
    lensSay('Searching on Google Lens…');
    $('lensOut').textContent = '';
    clearInterval(lensTimer);
    let waited = 0;
    lensTimer = setInterval(() => {                       // the titles come from the other tab
      const raw = GM_getValue('lens_titles', '');
      const got = raw ? JSON.parse(raw) : null;
      if (got && got.at === lensStamp) {
        clearInterval(lensTimer);
        const rows = lensGuess(got.titles, lensData());
        lensShow(rows);
        lensSay(rows[0].candidates.length ? 'Lens results compared with PlatesMania.' : 'Lens answered, but no PlatesMania brand was found in the results.');
        setStatus('Google Lens results are ready (Search drawer).', 4000);
      } else if (++waited > 120) {
        clearInterval(lensTimer);
        lensSay('No result came back from Google Lens. Open its tab to see the page.');
      }
    }, 1000);
    const url = lensMarkedUrl();
    try { if (typeof GM_openInTab === 'function') { GM_openInTab(url, { active: !background, insert: true, setParent: true }); return true; } } catch (e) { /* the popup below */ }
    return !!window.open(url, '_blank');
  }

  // A photo chosen on the upload page changes the address of #zoomimg: search it at once (not at load: a photo already there was seen)
  let lensSent = '';
  function lensWatch() {
    const img = document.getElementById('zoomimg');
    if (!img) return;
    new MutationObserver(() => setTimeout(() => {
      const photo = lensPhoto();
      if (!settings.on('lens_auto') || !photo || photo === lensSent) return;
      lensSent = photo;
      if (lensStart(photo, true)) setStatus('Photo sent to Google Lens (new tab).', 3500);
    }, 300)).observe(img, { attributes: true, attributeFilter: ['src'] });
  }

  registerFeature({
    id: 'lens', label: 'Google Lens',
    groups: [{
      drawer: 'search', title: 'Google Lens', pages: ['add', 'edit', 'gallery'],
      build: () => [
        h('button', { id: 'lensSearch', class: 'btn', text: 'Search this photo on Google Lens' }),
        h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'lensAuto' }), 'Search each new photo by itself'),
        h('p', { id: 'lensMsg', class: 'presult', text: 'Choose a photo: it is searched on Google Lens and the likely brand, model and generation appear here.' }),
        h('div', { id: 'lensOut', class: 'lens-out' })
      ]
    }],
    init: () => {
      $('lensSearch').onclick = () => {
        const photo = lensPhoto();
        if (!photo) { setStatus('No photo on this page yet: choose or upload one first.', 3500); return; }
        lensStart(photo, false);
      };
      $('lensAuto').checked = settings.on('lens_auto');
      $('lensAuto').onchange = () => settings.set('lens_auto', $('lensAuto').checked ? '1' : '0');
      lensWatch();
    }
  });
