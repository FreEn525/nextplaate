  /* =====================================================================
   *  PAIR  (choose the front and rear photos of a car by clicking them on the site)
   * ===================================================================== */
  function startSelecting() {
    closeDrawer();                                   // the photos must be clickable on the site
    if (host.shadowRoot.activeElement) host.shadowRoot.activeElement.blur();
    if (state.front && state.rear) { state.front = state.rear = null; store.set('front', 'null'); store.set('rear', 'null'); }
    state.mode = !state.front ? 'front' : 'rear';
    render();
  }
  function stopSelecting() { state.mode = null; clearHover(); render(); }

  function renderSlot(el, label, photo, key) {
    el.innerHTML = '';
    el.classList.toggle('empty', !photo);
    if (!photo) { el.textContent = label + ': not selected'; return; }
    const im = document.createElement('img'); im.src = photo.thumb;
    const t = document.createElement('div'); t.className = 't';
    t.textContent = label;
    const s = document.createElement('small');
    s.textContent = '#' + photo.id + (photo.alt ? ' · ' + photo.alt : '');
    t.appendChild(s);
    const x = document.createElement('button'); x.className = 'iconbtn'; x.innerHTML = icon('close'); x.title = 'Remove';
    x.onclick = () => { state[key] = null; store.set(key, 'null'); clearDone(); render(); };
    el.append(im, t, x);
  }

  function render() {
    renderSlot($('sFront'), 'Front', state.front, 'front');
    renderSlot($('sRear'), 'Rear', state.rear, 'rear');
    const ready = !!(state.front && state.rear);

    const sel = $('sel');
    sel.classList.toggle('ghost', !state.mode);
    sel.textContent = state.mode ? 'Cancel selection (S)' : (ready ? 'Select a new pair (S)' : 'Select photos (S)');

    if (state.mode === 'front') setStatus('Click the <b>FRONT</b> photo on the page. (Esc to cancel)');
    else if (state.mode === 'rear') setStatus('Now click the <b>REAR</b> photo. (Esc to cancel)');
    else if (ready) setStatus('Pair ready. Open the front photo to start the automatic edit.');
    else setStatus('Press <b>S</b>, then click the front and rear photos.');
  }

  let hovered = null;
  function clearHover() { if (hovered) { hovered.classList.remove('pmg-hover'); hovered = null; } }

  document.addEventListener('mouseover', e => {
    if (!state.mode || e.target === host) return;
    const f = findPhoto(e.target);
    clearHover();
    if (f) { hovered = f.img; hovered.classList.add('pmg-hover'); }
  }, true);

  document.addEventListener('click', e => {
    if (!state.mode || e.target === host) return;
    const f = findPhoto(e.target);
    if (!f) return; // not a car photo: let the click through
    e.preventDefault();
    e.stopPropagation();
    clearHover();
    state[state.mode] = f.photo;
    store.set(state.mode, JSON.stringify(f.photo));
    clearDone(); // new selection = fresh start for auto-edit
    state.mode = state.mode === 'front' ? (state.rear ? null : 'rear') : null;
    render();
  }, true);

  registerFeature({
    groups: [{
      drawer: 'pair', title: 'Photos',
      build: () => [
        h('button', { id: 'sel', class: 'btn ghost', text: 'Select photos (S)' }),
        h('button', { id: 'reset', class: 'btn ghost sm', text: 'Reset the pair' }),
        h('div', { class: 'slots' }, h('div', { id: 'sFront', class: 'slot empty' }), h('div', { id: 'sRear', class: 'slot empty' }))
      ]
    }],
    keys: {
      select: { code: 'KeyS', label: 'Select photos', run: () => { $('sel').click(); return true; }, hintOrder: 10 }
    },
    onEscape: () => { if (!state.mode) return false; stopSelecting(); return true; },
    escOrder: 20,
    init: () => {
      $('sel').onclick = () => (state.mode ? stopSelecting() : startSelecting());
      $('reset').onclick = () => {
        state.front = state.rear = null; state.mode = null;
        store.set('front', 'null'); store.set('rear', 'null'); clearDone();
        clearHover(); render();
      };
      render();
    }
  });
