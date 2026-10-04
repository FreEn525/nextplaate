  /* =====================================================================
   *  UI RENDERING
   * ===================================================================== */
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
    const x = document.createElement('button'); x.className = 'x'; x.textContent = '✕'; x.title = 'Remove';
    x.onclick = () => { state[key] = null; store.set(key, 'null'); clearDone(); render(); };
    el.append(im, t, x);
  }

  function setStatus(html) { $('status').innerHTML = html; }

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

    $('hint').textContent = `Keys: S · F · L · U · N · R · ${prevKey} ◀ ▶ D · Esc`;
  }

  // Letter shown for the "previous page" key: the physical left key, labelled for YOUR layout
  //   AZERTY -> Q   |   QWERTY / QWERTZ -> A
  let prevKey = /^fr|^be/i.test(navigator.language || '') ? 'Q' : 'A';
  if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
    navigator.keyboard.getLayoutMap().then(map => {
      const k = map.get('KeyA');
      if (k && /^[a-z]$/i.test(k)) { prevKey = k.toUpperCase(); render(); }
    }).catch(() => {});
  }

