  /* =====================================================================
   *  SELECTION MODE
   * ===================================================================== */
  function startSelecting() {
    if (state.front && state.rear) { state.front = state.rear = null; store.set('front', 'null'); store.set('rear', 'null'); }
    state.mode = !state.front ? 'front' : 'rear';
    render();
  }
  function stopSelecting() { state.mode = null; clearHover(); render(); }

  $('sel').onclick = () => (state.mode ? stopSelecting() : startSelecting());
  $('reset').onclick = () => {
    state.front = state.rear = null; state.mode = null;
    store.set('front', 'null'); store.set('rear', 'null'); clearDone();
    clearHover(); render();
  };
  $('min').onclick = () => {
    const p = $('panel'); p.classList.toggle('min'); store.set('min', p.classList.contains('min') ? '1' : '0');
  };
  $('place').oninput = () => store.set('place', $('place').value);
  $('tag').oninput = () => store.set('tag', $('tag').value);

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

