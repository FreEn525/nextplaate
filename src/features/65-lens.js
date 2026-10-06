  /* =====================================================================
   *  GOOGLE LENS  (in the panel: search the photo, copy the prompt, paste the answer shown in 3 columns)
   *    The panel saves the photo for the Google side (66-lens-google.js) and opens Google in a tab: the photo goes into Google's
   *    "paste an image link" box and the search starts. On the upload page this happens by itself as soon as a photo is chosen.
   *    The prompt is not shown: the user copies it with one button.
   *    The answer is a table: one row per category (brand, model, generation), three candidates each. It is only read and shown
   *    here: nothing is typed into the form.
   * ===================================================================== */
  const LENS_PROMPT = [
    'You are a car expert. In this photo of a car, identify the vehicle and give three hypotheses, ranked by probability,',
    'for each of the three categories below. For every hypothesis, add a confidence level (high, medium, low).',
    '',
    '1. Brand: three proposals.',
    '2. Model: three proposals, taking the most likely brand into account.',
    '3. Generation: three proposals, with the production years if you know them.',
    '',
    'If the photo does not show enough detail for a category, write "unknown" instead of guessing.',
    'Answer only with a table, no text around it, with the columns: Category | 1 | 2 | 3.'
  ].join('\n');
  settings.define('lens_auto', '1', 'Search each new photo on Google Lens', 'lens');

  // The photo to search: on the upload page the preview #zoomimg (a 1-pixel placeholder until a photo is chosen; its address is the
  // photo itself while it is not published), on another page the main photo. '' when there is none.
  const LENS_PLACEHOLDER = /^data:image\/gif/i;
  function lensPhoto() {
    const img = here.add ? document.getElementById('zoomimg') : [...document.images].find(i => /\/\/img\d+\.platesmania\.com\/\d+\/m\/\d+\.jpg/i.test(i.src));
    return img && img.src && !LENS_PLACEHOLDER.test(img.src) ? img.src.replace(/\/s\/(\d+\.jpg)/, '/m/$1') : '';
  }

  // Hands the photo to the Google side and opens Google; in the background when the search starts by itself
  function lensStart(photo, background) {
    GM_setValue('lens_image', photo);
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

  // "| Brand | Peugeot | Citroën | Renault |" -> { category: 'Brand', candidates: ['Peugeot', 'Citroën', 'Renault'] }
  const LENS_HEADERS = ['category', 'catégorie', 'categorie'];
  function lensRows(text) {
    return text.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('|') && !/^\|\s*:?-{2,}/.test(l))
      .map(l => l.split('|').slice(1, -1).map(c => c.trim()))
      .filter(cells => cells.length >= 2 && !LENS_HEADERS.includes(cells[0].toLowerCase()))
      .map(cells => ({ category: cells[0], candidates: cells.slice(1, 4) }));
  }

  function lensShow() {
    const out = $('lensOut');
    const rows = lensRows($('lensIn').value || '');
    out.textContent = '';
    if (!rows.length) { out.appendChild(h('p', { class: 'presult', text: 'No table found. Paste the answer as a markdown table.' })); return; }
    // one block per category, its three candidates side by side
    for (const r of rows) {
      out.appendChild(h('div', { class: 'lens-cat', text: r.category }));
      out.appendChild(h('div', { class: 'lens-cands' }, ...r.candidates.map(c => h('span', { class: 'lens-cand', text: c || '—' }))));
    }
  }

  registerFeature({
    id: 'lens', label: 'Google Lens',
    groups: [{
      drawer: 'search', title: 'Google Lens', pages: ['add', 'edit', 'gallery'],
      build: () => [
        h('button', { id: 'lensSearch', class: 'btn', text: 'Search this photo on Google Lens' }),
        h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'lensAuto' }), 'Search each new photo by itself'),
        h('div', { class: 'btnrow' },
          h('button', { id: 'lensCopy', class: 'btn ghost', text: 'Copy the prompt' }),
          h('button', { id: 'lensOpen', class: 'btn ghost', text: 'Open Lens' })),
        h('textarea', { id: 'lensIn', rows: 4, placeholder: 'Paste the answer here (| Category | 1 | 2 | 3 |)' }),
        h('button', { id: 'lensShow', class: 'btn ghost', text: 'Show the answer' }),
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
      $('lensCopy').onclick = () => {
        navigator.clipboard.writeText(LENS_PROMPT).then(() => setStatus('Prompt copied.', 2500), () => setStatus('Could not copy the prompt.', 4000));
      };
      $('lensOpen').onclick = () => window.open('https://lens.google.com/', '_blank', 'noopener');
      $('lensShow').onclick = lensShow;
    }
  });
