  /* =====================================================================
   *  GOOGLE LENS  (the photo is searched on Google Lens; the answer is the brand, model and generation it names)
   *    Built from the shared parts:
   *      bridge (lib/bridge.js)         asks Google, in another tab, for the titles of the Lens results of the photo
   *      vehicle (lib/vehicle.js)       compares those titles with the brands, models and generations of PlatesMania's menus
   *      inlineCard (ui/06-inline-card) shows the answer under the photo of the upload page, where it is used
   *    The Google side is 66-lens-google.js. On the upload page the search starts by itself as soon as a photo is chosen.
   *    Nothing is filled in the menus until the user clicks a choice.
   * ===================================================================== */
  settings.define('lens_auto', '1', 'Search each new photo on Google Lens', 'lens');

  // The photo to search: on the upload page the preview #zoomimg (a 1-pixel placeholder until a photo is chosen; its address is the
  // photo itself while it is not published), on another page the main photo. '' when there is none.
  const LENS_PLACEHOLDER = /^data:image\/gif/i;
  function lensPhoto() {
    const img = here.add ? document.getElementById('zoomimg') : [...document.images].find(i => /\/\/img\d+\.platesmania\.com\/\d+\/m\/\d+\.jpg/i.test(i.src));
    return img && img.src && !LENS_PLACEHOLDER.test(img.src) ? img.src.replace(/\/s\/(\d+\.jpg)/, '/m/$1') : '';
  }

  // Where the answer goes: the card under the photo of the upload page (above the vehicle menus when the page has no photo block),
  // and always the panel, so both show it at once
  function lensShow(message, rows, similar) {
    const photo = document.getElementById('zoomimgid'), menus = document.querySelector('.pm-vehicle-fields-row');
    const card = inlineCard({ id: 'pmg-lens-card', title: 'Google Lens', after: photo, before: photo ? null : menus });
    if (card) {
      card.message(message);
      card.clear();
      if (rows) {
        const first = [];
        for (const r of rows) { if (!r.candidates[0]) break; first.push(r.candidates[0].id); }
        cardChoices(card, rows.map(r => ({ label: r.category, level: r.level, choices: r.candidates })),
          { pick: lensPick, current: vehicleCurrent, action: { label: 'Fill with the first choices', path: first } });
      }
      if (similar && similar.length) card.body.prepend(lensSays(similar));              // above the columns (cardChoices empties the card first)
    }
    $('lensMsg').textContent = message;
    const out = $('lensOut');
    out.textContent = '';
    if (similar && similar.length) out.appendChild(lensSays(similar));
    if (!rows) return;
    // the same choices as the card, stacked (the drawer is narrow), and clickable the same way
    for (const r of rows) {
      out.appendChild(h('div', { class: 'cat', text: r.category }));
      out.appendChild(h('div', { class: 'lens-cands' }, r.candidates.length
        ? r.candidates.map((c, i) => h('button', { class: 'chip' + (i === 0 ? ' best' : ''), text: c.name, 'data-id': String(c.id), 'data-level': String(r.level), onclick: () => lensPick(c.path) }))
        : h('div', { class: 'lens-none', text: 'No choice' })));
    }
    const now = vehicleCurrent();
    out.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', now[+c.dataset.level] === c.dataset.id));
  }

  // A click on a choice fills the menus, then the guess is redone around what was picked: the models of the picked brand, the
  // generations of the picked model
  let lensTitles = [], lensNamed = [];
  const lensGuessNow = pin => vehicleGuess(lensNamed.concat(lensTitles), vehicleData(), pin, lensNamed.length);   // what Google names counts first, and more
  function lensPick(path) {
    vehicleFill(path);
    lensShow('Lens results compared with PlatesMania. Click a choice to fill the menu.', lensGuessNow({ brand: path[0], model: path[1] }), lensNamed);
  }

  // What Google itself calls the vehicle, each name a button: it goes into the site's own "brand and model" box, which finds the
  // vehicle (the way out when the menus of the page do not name it)
  function lensSays(similar) {
    return h('div', { class: 'cardbox says' }, h('div', { class: 'cat', text: 'Google says' }),
      h('div', { class: 'pills' }, similar.slice(0, 3).map(q => h('button', { type: 'button', class: 'pill', text: q, title: 'Use in the brand and model box',
        onclick: () => { if (!vehicleSearchBox(q)) setStatus('This page has no brand and model box.', 3000); } }))));
  }

  // The search: the photo goes to the Google side, the titles of the results come back
  function lensStart(photo, background) {
    lensShow('Searching on Google Lens…', null);
    bridgeAsk('lens', { photo }, lensMarkedUrl(), { background, timeout: 120 }).then(answer => {
      // { similar, titles }; an older answer is the titles alone
      lensTitles = Array.isArray(answer) ? answer : answer.titles || [];
      lensNamed = Array.isArray(answer) ? [] : answer.similar || [];
      const rows = lensGuessNow();
      lensShow(rows[0].candidates.length ? 'Lens results compared with PlatesMania. Click a choice to fill the menu.' : 'Lens answered, but no PlatesMania brand was found in the results.', rows, lensNamed);
      setStatus('Google Lens results are ready.', 3500);
    }, e => lensShow(e.message === 'no answer' ? 'No result came back from Google Lens. Open its tab to see the page.' : 'Could not open Google Lens: ' + e.message + '.', null));
    return true;
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
        h('p', { id: 'lensMsg', class: 'presult', text: 'Choose a photo: it is searched on Google Lens, and the likely brand, model and generation appear here and under the photo.' }),
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
