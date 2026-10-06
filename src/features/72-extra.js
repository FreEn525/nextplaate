  /* =====================================================================
   *  EXTRA INFORMATION  (the site's "Extra information" box, large from the start and in the look of the panel)
   *    The site shows a small three-line box with a label. Here a card takes its place: a tall box that grows with what is typed, the
   *    site's own hint, a character count, the location saved in Details one click away, and the date of the photo (its EXIF date,
   *    which the site shows under the photo once it is chosen) in two forms. The card sits above the tags card with
   *    a clear space between the two.
   *    The site's own box stays the source of truth (it is only hidden): what is typed in the card is copied into it with its input
   *    event, so the form is sent exactly as before; and what the site (or another script) writes in it shows in the card.
   *    A box inside a shadow root is not part of the form, which is why the card does not simply take the real one in.
   * ===================================================================== */
  const EXTRA_MIN = 180;          // px: the height of the box before anything is typed

  // The date the photo was taken: the site lists the EXIF dates of the photo under it (#fotodiv, "YYYY.MM.DD HH:MM:SS" in the text and
  // in the onclick that adds it to the box); the earliest is the shot. null when the photo has none.
  function photoDate() {
    const found = [...document.querySelectorAll('#fotodiv span[onclick^="appdop"]')].map(el => {
      const m = (el.textContent + ' ' + (el.getAttribute('onclick') || '')).match(/(\d{4})[.:](\d{2})[.:](\d{2})(?:\s+(\d{2}):(\d{2}):(\d{2}))?/);
      return m ? { y: +m[1], m: +m[2], d: +m[3], at: Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)) } : null;
    }).filter(Boolean).sort((a, b) => a.at - b.at);
    return found[0] || null;
  }
  const extraMonth = m => new Date(Date.UTC(2000, m - 1, 1)).toLocaleDateString('en', { month: 'long', timeZone: 'UTC' });

  function extraCard() {
    const real = document.querySelector('#frm textarea[name="dop"]');
    if (!real) return;
    const block = real.closest('.row') || real.closest('section') || real;       // the site's label and box
    const card = inlineCard({ id: 'pmg-extra', title: 'Extra information', before: block, closable: false });
    if (!card) return;
    block.style.display = 'none';

    // the site's hint is shown once, above the box; the box itself only says where to type
    const mine = h('textarea', { rows: 8, placeholder: 'Type here…', value: real.value, 'aria-label': 'Extra information' });
    mine.className = 'extra';
    const count = h('span', { class: 'count' });
    // the date buttons: month and year, or the whole date; there only while the photo has a date
    const dateBtn = full => h('button', { type: 'button', class: 'btn ghost sm', onclick: () => {
      const d = photoDate();
      if (d) insert(full ? `${d.d} ${extraMonth(d.m)} ${d.y}` : `${extraMonth(d.m)} ${d.y}`);
    } });
    const dateMonth = dateBtn(false), dateFull = dateBtn(true);
    const here_ = () => (store.get('place', '') || '').trim();                  // the location saved in Details (never its default)
    // adds a text on a line of its own at the end
    function insert(text) {
      mine.value = mine.value.trim() ? mine.value.replace(/\s+$/, '') + '\n' + text : text;
      push();                                                                // before the focus: focusing re-reads the site's box
      mine.focus();
    }
    const place = h('button', { type: 'button', class: 'btn ghost sm', onclick: () => insert(here_()) });

    function grow() {
      mine.style.height = 'auto';
      mine.style.height = Math.max(EXTRA_MIN, mine.scrollHeight + 2) + 'px';
    }
    function show() {
      count.textContent = mine.value.length ? `${mine.value.length} character${mine.value.length > 1 ? 's' : ''}` : '';
      place.hidden = !here_();
      place.textContent = 'Use my location: ' + here_();
      const d = photoDate();
      dateMonth.hidden = dateFull.hidden = !d;
      if (d) { dateMonth.textContent = `Date: ${extraMonth(d.m)} ${d.y}`; dateFull.textContent = `${d.d} ${extraMonth(d.m)} ${d.y}`; }
      grow();
    }
    function push() {                                                         // card -> site
      real.value = mine.value;
      real.dispatchEvent(new Event('input', { bubbles: true }));
      show();
    }
    mine.addEventListener('input', push);
    real.addEventListener('input', () => { if (real.value !== mine.value) { mine.value = real.value; show(); } });   // site -> card
    mine.addEventListener('focus', () => { if (real.value !== mine.value) { mine.value = real.value; show(); } });

    card.body.append(h('div', { class: 'cardbox' },
      h('p', { class: 'hint', text: real.placeholder || 'Anything worth knowing about the photo.' }),
      mine, h('div', { class: 'cardrow' }, place, dateMonth, dateFull, count)));
    show();
    // the site fills #fotodiv when a photo is chosen (and again when another is): the date buttons follow
    const photo = document.getElementById('fotodiv');
    if (photo) new MutationObserver(show).observe(photo, { childList: true, subtree: true, characterData: true });
    requestAnimationFrame(grow);
  }

  registerFeature({
    id: 'extra', label: 'Extra information box',
    init: () => { if (here.add) extraCard(); }
  });
