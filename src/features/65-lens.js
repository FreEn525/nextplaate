  /* =====================================================================
   *  GOOGLE LENS  (in the panel: search the photo, the prompt to copy, and the answer shown in 3 columns)
   *    The photo is searched with Google's own address for an image link (lens.google.com/uploadbyurl): one click opens the
   *    results in a new tab. Nothing is read from or typed into a Google page, and the script keeps contacting PlatesMania only.
   *    The answer is a table: one row per category (brand, model, generation), three candidates each.
   *    It is only read and shown here: nothing is typed into the form.
   * ===================================================================== */
  const LENS_PROMPT = [
    'Tu es un expert en automobile. Sur cette photo de voiture, identifie le véhicule et propose trois hypothèses',
    'classées par probabilité, pour chacune des trois catégories ci-dessous. Pour chaque hypothèse, indique un',
    'niveau de confiance (élevé, moyen, faible).',
    '',
    '1. Marque : trois propositions.',
    '2. Modèle : trois propositions, en tenant compte de la marque la plus probable.',
    '3. Génération : trois propositions, avec la période de production si tu la connais.',
    '',
    'Si la photo ne montre pas assez de détails pour une catégorie, écris « indéterminé » plutôt que de deviner.',
    'Réponds uniquement sous forme de tableau, sans texte autour, avec les colonnes : Catégorie | 1 | 2 | 3.'
  ].join('\n');

  // The photo to search: the big photo of the upload page (#zoomimg), else the main photo of the page; a thumbnail gives its large
  // version. Only a public address works (a photo that is not published yet has none): '' when there is no such photo.
  function lensPhotoUrl() {
    const img = document.getElementById('zoomimg') || [...document.images].find(i => /\/\/img\d+\.platesmania\.com\/\d+\/[ms]\/\d+\.jpg/i.test(i.src));
    return img && /^https?:/.test(img.src) ? img.src.replace(/\/s\/(\d+\.jpg)/, '/m/$1') : '';
  }

  const lensUrl = photo => 'https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(photo);

  // "| Marque | Peugeot | Citroën | Renault |" -> { category: 'Marque', candidates: ['Peugeot', 'Citroën', 'Renault'] }
  function lensRows(text) {
    return text.split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('|') && !/^\|\s*:?-{2,}/.test(l))
      .map(l => l.split('|').slice(1, -1).map(c => c.trim()))
      .filter(cells => cells.length >= 2 && cells[0].toLowerCase() !== 'catégorie' && cells[0].toLowerCase() !== 'categorie')
      .map(cells => ({ category: cells[0], candidates: cells.slice(1, 4) }));
  }

  function lensShow() {
    const out = $('lensOut');
    const rows = lensRows($('lensIn').value || '');
    out.textContent = '';
    if (!rows.length) { out.appendChild(h('p', { class: 'presult', text: 'No table found. Paste the answer as a markdown table.' })); return; }
    // three columns: one per candidate, each row a category
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
        h('p', { class: 'presult', text: '1. Search the photo on Google Lens. 2. Copy the prompt and send it to your AI with the photo. 3. Paste the answer below.' }),
        h('button', { id: 'lensSearch', class: 'btn', text: 'Search this photo on Google Lens' }),
        h('pre', { class: 'lens-prompt', text: LENS_PROMPT }),
        h('div', { class: 'btnrow' },
          h('button', { id: 'lensCopy', class: 'btn ghost', text: 'Copy the prompt' }),
          h('button', { id: 'lensOpen', class: 'btn ghost', text: 'Open Google Lens (manual)' })),
        h('textarea', { id: 'lensIn', rows: 6, placeholder: '| Catégorie | 1 | 2 | 3 |' }),
        h('button', { id: 'lensShow', class: 'btn ghost', text: 'Show the answer' }),
        h('div', { id: 'lensOut', class: 'lens-out' })
      ]
    }],
    init: () => {
      $('lensCopy').onclick = () => {
        navigator.clipboard.writeText(LENS_PROMPT).then(() => setStatus('Prompt copied.', 2500), () => setStatus('Could not copy: select the text and copy it.', 4000));
      };
      $('lensSearch').onclick = () => {
        const photo = lensPhotoUrl();
        if (!photo) { setStatus('No published photo on this page to search.', 3500); return; }
        window.open(lensUrl(photo), '_blank', 'noopener');
      };
      $('lensOpen').onclick = () => window.open('https://lens.google.com/', '_blank', 'noopener');
      $('lensShow').onclick = lensShow;
    }
  });
