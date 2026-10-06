  /* =====================================================================
   *  GOOGLE LENS  (in the panel: search the photo, copy the prompt, paste the answer shown in 3 columns)
   *    A published photo is searched with Google's own address for an image link (lens.google.com/uploadbyurl): one click opens
   *    the results. A photo that is only on the computer (upload page, not published yet) is put on the clipboard and Lens is
   *    opened: Ctrl+V pastes it there. Nothing is read from or typed into a Google page, and the script keeps contacting
   *    PlatesMania only. The prompt is not shown: the user copies it with one button.
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

  // The photo to search. Upload page: the preview #zoomimg (a 1-pixel placeholder until a photo is chosen). Other pages: the main
  // photo of the page (the thumbnails of a gallery are many photos: not guessed). { src, local }: local = only on this computer.
  function lensPhoto() {
    let img = here.add ? document.getElementById('zoomimg') : [...document.images].find(i => /\/\/img\d+\.platesmania\.com\/\d+\/m\/\d+\.jpg/i.test(i.src));
    if (!img || !img.src || img.naturalWidth <= 1) return null;
    const src = img.src.replace(/\/s\/(\d+\.jpg)/, '/m/$1');
    return { src, local: !/^https?:/i.test(src), img };
  }

  const lensUrl = photo => 'https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(photo);

  // A photo on this computer as a PNG blob, the only image format the clipboard accepts
  async function lensPng(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return new Promise((ok, no) => canvas.toBlob(b => (b ? ok(b) : no(new Error('no image'))), 'image/png'));
  }

  async function lensSearch() {
    const photo = lensPhoto();
    if (!photo) { setStatus('No photo on this page yet: choose or upload one first.', 3500); return; }
    if (!photo.local) { window.open(lensUrl(photo.src), '_blank', 'noopener'); return; }
    // not published: Google cannot fetch it, so the photo goes to the clipboard and Lens opens to receive it
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': await lensPng(photo.img) })]);
      window.open('https://lens.google.com/', '_blank', 'noopener');
      setStatus('Photo copied. In Google Lens, press Ctrl+V to paste it.', 6000);
    } catch (e) {
      setStatus('Could not copy the photo. Open Google Lens and upload it by hand.', 5000);
    }
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
        h('div', { class: 'btnrow' },
          h('button', { id: 'lensCopy', class: 'btn ghost', text: 'Copy the prompt' }),
          h('button', { id: 'lensOpen', class: 'btn ghost', text: 'Open Lens' })),
        h('textarea', { id: 'lensIn', rows: 4, placeholder: 'Paste the answer here (| Category | 1 | 2 | 3 |)' }),
        h('button', { id: 'lensShow', class: 'btn ghost', text: 'Show the answer' }),
        h('div', { id: 'lensOut', class: 'lens-out' })
      ]
    }],
    init: () => {
      $('lensSearch').onclick = lensSearch;
      $('lensCopy').onclick = () => {
        navigator.clipboard.writeText(LENS_PROMPT).then(() => setStatus('Prompt copied.', 2500), () => setStatus('Could not copy the prompt.', 4000));
      };
      $('lensOpen').onclick = () => window.open('https://lens.google.com/', '_blank', 'noopener');
      $('lensShow').onclick = lensShow;
    }
  });
