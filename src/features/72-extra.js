  /* =====================================================================
   *  EXTRA INFORMATION  (the site's "Extra information" box, large from the start and in the look of the panel)
   *    The site shows a small three-line box with a label. Here a card takes its place: a tall box that grows with what is typed, the
   *    site's own hint, a character count, and the location saved in Details one click away. The card sits above the tags card with
   *    a clear space between the two.
   *    The site's own box stays the source of truth (it is only hidden): what is typed in the card is copied into it with its input
   *    event, so the form is sent exactly as before; and what the site (or another script) writes in it shows in the card.
   *    A box inside a shadow root is not part of the form, which is why the card does not simply take the real one in.
   * ===================================================================== */
  const EXTRA_MIN = 180;          // px: the height of the box before anything is typed

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
    const here_ = () => (store.get('place', '') || '').trim();                  // the location saved in Details (never its default)
    const place = h('button', { type: 'button', class: 'btn ghost sm', onclick: () => {
      const text = here_();
      mine.value = mine.value.trim() ? mine.value.replace(/\s+$/, '') + '\n' + text : text;
      push();                                                                // before the focus: focusing re-reads the site's box
      mine.focus();
    } });

    function grow() {
      mine.style.height = 'auto';
      mine.style.height = Math.max(EXTRA_MIN, mine.scrollHeight + 2) + 'px';
    }
    function show() {
      count.textContent = mine.value.length ? `${mine.value.length} character${mine.value.length > 1 ? 's' : ''}` : '';
      place.hidden = !here_();
      place.textContent = 'Use my location: ' + here_();
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
      mine, h('div', { class: 'cardrow' }, place, count)));
    show();
    requestAnimationFrame(grow);
  }

  registerFeature({
    id: 'extra', label: 'Extra information box',
    init: () => { if (here.add) extraCard(); }
  });
