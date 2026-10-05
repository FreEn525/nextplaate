  function openManager() {
    managerOpen = true; document.documentElement.classList.add('pmg-busy'); mhost.style.display = 'block';
    if (document.activeElement) document.activeElement.blur(); host.style.display = 'none'; app.modal = { onKey: managerKey };
    renderChips(); fillMore(); renderGrid();
    qAll().then(a => { if (managerOpen && !multi) { queue = a; renderGrid(); fillThumbs(); } }).catch(() => {}); // pick up what other tabs finished
  }
  function closeManager() {
    try { hideZoom(); } catch (e) {}
    managerOpen = false; document.documentElement.classList.remove('pmg-busy'); mhost.style.display = 'none'; host.style.display = ''; app.modal = null;
    updateBatchInfo();
  }
  // A confirmation drawn in this window (window.confirm would show the browser's own box)
  function askConfirm(title, text, okLabel) {
    return new Promise(resolve => {
      M('cfmTitle').textContent = title; M('cfmText').textContent = text; M('cfmYes').textContent = okLabel;
      const done = ok => { M('cfm').hidden = true; app.modal = { onKey: managerKey }; resolve(ok); };
      M('cfm').hidden = false;
      M('cfmYes').onclick = () => done(true);
      M('cfmNo').onclick = () => done(false);
      app.modal = { onKey: e => { if (e.key === 'Escape') { e.preventDefault(); done(false); } else if (e.key === 'Enter') { e.preventDefault(); done(true); } } };
    });
  }
  function managerKey(e) {
    const t = e.composedPath ? e.composedPath()[0] : e.target;
    const typing = t instanceof Node && mroot.contains(t) && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && /^(text|number|search)$/i.test(t.type)));
    log('window key', e.code, 'ctrl', e.ctrlKey, 'target', t && (t.tagName + (t.id ? '#' + t.id : '')), 'typing', !!typing, 'queue', queue.length);
    if (e.key === 'Escape') { e.preventDefault(); if (sel.size) { sel.clear(); syncSel(); } else closeManager(); return; }
    if (typing) return;
    if ((e.ctrlKey || e.metaKey) && isSelectAll(e)) { e.preventDefault(); queue.forEach(q => sel.add(q.id)); syncSel(); log('select all: ' + sel.size + ' photos selected'); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { if (sel.size) { e.preventDefault(); deleteSelected(); } return; }
    const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
    if (m && mine[+m[1] - 1]) { e.preventDefault(); brush = mine[+m[1] - 1]; store.set('brush', brush); renderChips(); assignSel(brush); }
    else if (/^(?:Digit|Numpad)0$/.test(e.code)) { e.preventDefault(); assignSel(''); }
  }

  const saveMine = () => store.set('mine', JSON.stringify(mine));
  function renderChips() {
    const box = M('chips'); box.innerHTML = '';
    mine.forEach((code, i) => {
      const b = document.createElement('button');
      b.className = 'chip' + (code === brush ? ' on' : '');
      const k = document.createElement('kbd'); k.textContent = i + 1;
      const c = document.createElement('b'); c.textContent = code.toUpperCase();
      const n = document.createElement('span'); n.textContent = cName(code);
      const x = document.createElement('span'); x.className = 'rm'; x.textContent = '×'; x.title = 'Remove from my countries';
      x.onclick = ev => {
        ev.stopPropagation();
        mine = mine.filter(m => m !== code); saveMine();
        if (brush === code) { brush = mine[0] || ''; store.set('brush', brush); }
        renderChips(); fillMore();
      };
      b.onclick = () => { brush = code; store.set('brush', code); renderChips(); assignSel(code); };
      b.append(k, c, n, x); box.appendChild(b);
    });
  }
  function fillMore() {
    const s = M('more'); s.innerHTML = '';
    const d = document.createElement('option'); d.value = ''; d.textContent = '+ Add another country…'; s.appendChild(d);
    COUNTRIES.filter(c => !mine.includes(c.code)).forEach(c => {
      const o = document.createElement('option'); o.value = c.code; o.textContent = c.name + ' (' + c.code.toUpperCase() + ')'; s.appendChild(o);
    });
  }
  M('more').onchange = () => {
    const code = M('more').value; if (!code) return;
    mine.push(code); saveMine(); brush = code; store.set('brush', code);
    ensureCats(code); renderChips(); fillMore();
  };

  // The list on screen changes instantly; saving to IndexedDB happens in the background
  function setCountry(it, code) {
    if (it.country !== code) { it.country = code; it.ctype = null; qPut(it).catch(() => {}); }
    if (code) ensureCats(code);
  }
  function onCardClick(ev, it, idx) {
    if (ev.target.closest('select,button')) return;
    if (ev.shiftKey && lastIdx >= 0 && lastIdx < queue.length) {              // range
      const a = Math.min(lastIdx, idx), b = Math.max(lastIdx, idx);
      for (let i = a; i <= b; i++) sel.add(queue[i].id);
    } else if (sel.has(it.id)) sel.delete(it.id); else sel.add(it.id);        // a click adds / removes one photo
    lastIdx = idx; syncSel();
  }
  // Give a country to every selected photo (then the selection is cleared, ready for the next group)
  function assignSel(code) {
    const t = queue.filter(q => sel.has(q.id) && !isFinished(q));
    if (!t.length) { M('mMsg').textContent = 'Select photos first (click them, they turn blue), then choose a country.'; return false; }
    t.forEach(it => setCountry(it, code));
    M('mMsg').textContent = code ? `${cName(code)} given to ${pl(t.length, 'photo')}.` : `Country removed from ${pl(t.length, 'photo')}.`;
    sel.clear(); t.forEach(refreshCard); syncSel(); updateBatchInfo(); return true;
  }
  M('mSelAll').onclick = () => { queue.forEach(q => sel.add(q.id)); syncSel(); };
  M('mSelUn').onclick = () => { sel.clear(); queue.forEach(q => { if (q.status === 'pending' && !q.country) sel.add(q.id); }); syncSel(); };
  M('mSelNone').onclick = () => { sel.clear(); syncSel(); };
  async function deleteIds(ids) {
    if (!ids.length) return;
    const set = new Set(ids);
    queue = queue.filter(q => !set.has(q.id)); ids.forEach(i => sel.delete(i)); lastIdx = -1;
    renderGrid(); updateBatchInfo();
    for (const id of ids) { try { await qDel(id); } catch (e) {} }
    M('mMsg').textContent = `Removed ${pl(ids.length, 'photo')} from the list (your files are untouched).`;
  }
  const deleteSelected = () => deleteIds(queue.filter(q => sel.has(q.id)).map(q => q.id));
  M('mDel').onclick = deleteSelected;
  // ---- hover zoom: a big preview on the side opposite to the hovered photo ----
  const zoomEl = M('zoom'), zoomImg = zoomEl.querySelector('img'), zoomLbl = zoomEl.querySelector('.zl');
  let zoomTimer = null, zoomUrl = '';
  function hideZoom() { clearTimeout(zoomTimer); zoomEl.hidden = true; if (zoomUrl) { URL.revokeObjectURL(zoomUrl); zoomUrl = ''; } zoomImg.removeAttribute('src'); }
  function showZoom(it, card) {
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(() => {
      if (zoomUrl) { URL.revokeObjectURL(zoomUrl); zoomUrl = ''; }
      let src = it.thumb;
      if (it.blob && !isHeic(it)) { try { zoomUrl = URL.createObjectURL(it.blob); src = zoomUrl; } catch (e) {} }   // full resolution when the browser can show it
      if (!src) return;
      zoomImg.src = src; zoomLbl.textContent = it.name;
      const r = card.getBoundingClientRect(), left = r.left + r.width / 2 < innerWidth / 2;
      zoomEl.style.left = left ? 'auto' : '16px'; zoomEl.style.right = left ? '16px' : 'auto';
      zoomEl.hidden = false;
    }, 160);
  }
  M('grid').addEventListener('scroll', hideZoom);
  const applySize = v => { M('grid').style.setProperty('--cw', v + 'px'); };
  M('mSize').value = Math.min(560, Math.max(200, +store.get('csize', '300') || 300)); applySize(M('mSize').value);
  M('mSize').oninput = () => { applySize(M('mSize').value); store.set('csize', M('mSize').value); };

