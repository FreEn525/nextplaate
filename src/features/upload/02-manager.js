  // ---- manager overlay (its own shadow root) ----
  const mhost = document.createElement('div');
  mhost.id = 'pmg-batch';
  mhost.style.cssText = 'position:fixed;inset:0;z-index:2147483646;display:none;';
  const mroot = mhost.attachShadow({ mode: 'open' });
  mroot.innerHTML = `
    <style>${UI_BASE}
      .ov{position:absolute;inset:0;background:rgba(17,17,17,.55);display:flex;justify-content:center;padding:22px}
      .sheet{background:var(--bg);border-radius:4px;width:min(1400px,100%);max-height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35)}
      .top{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:56px;padding:0 16px;background:#fff;color:var(--ink);flex-wrap:wrap;border-bottom:1px solid var(--line)}
      .top h2{margin:0;font-size:16px;font-weight:700;display:flex;align-items:center;gap:14px}
      .top h2 small{font-size:14px;font-weight:500;color:var(--mute)}
      .acts{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .inl{display:inline-flex;align-items:center;gap:6px;font-size:13px}

      .paint{padding:12px 18px;background:#fff;border-bottom:1px solid var(--line);display:flex;gap:10px;align-items:center;flex-wrap:wrap}
      .lbl{font-weight:600;font-size:13px}
      .chips{display:flex;gap:8px;flex-wrap:wrap}
      .chip{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 10px;border-radius:4px;border:2px solid var(--line2);background:#fff;color:var(--ink);font:inherit;font-size:13px;cursor:pointer}
      .chip:hover{border-color:var(--brand-b);background:var(--tint)}
      .chip.on{background:var(--brand);color:var(--brand-t);border-color:#9fd3ea}
      .chip kbd{display:inline-grid;place-items:center;min-width:18px;height:18px;border-radius:4px;background:var(--soft);color:var(--ink);font:700 11px system-ui}
      .chip.on kbd{background:#fff}
      .chip .rm{margin-left:2px;opacity:.55;font-size:15px;line-height:1}
      .chip .rm:hover{opacity:1}
      select.more{max-width:210px;font-size:13px}
      .tools{padding:10px 18px;background:#fafafa;border-bottom:1px solid var(--line);display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .tools .inl{margin-left:auto}
      .inl input[type=range]{width:140px}
      .msg{padding:6px 18px 0;min-height:28px;font-size:13px;color:var(--mute)}

      .grid{flex:1 1 0;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:14px 18px 18px;display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--cw,300px),1fr));gap:14px;align-content:start;grid-auto-rows:max-content}
      .grid::-webkit-scrollbar{width:12px}
      .grid::-webkit-scrollbar-thumb{background:var(--line2);border-radius:4px;border:3px solid var(--bg)}
      .empty{grid-column:1/-1;padding:40px 10px;text-align:center;color:var(--mute)}
      .card{position:relative;background:#fff;border:2px solid var(--brand-b);border-radius:4px;overflow:hidden;cursor:pointer;user-select:none}
      .card.none{border:2px dashed var(--line2)}
      .card.done,.card.submitted{opacity:.5;cursor:default}
      .card.sel{border:3px solid var(--accent);box-shadow:0 0 0 3px rgba(52,152,219,.28);background:#eaf4fc}
      .card.sel::after{content:'✓';position:absolute;bottom:34px;right:8px;width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:800;font-size:14px;pointer-events:none}
      .card.sel img,.card.sel .noprev{filter:brightness(.92) saturate(1.1)}
      .card img,.card .noprev{width:100%;aspect-ratio:4/3;display:block;background:var(--soft)}
      .card img{object-fit:cover}
      .card .noprev{display:flex;align-items:center;justify-content:center;color:var(--mute);font:600 11px system-ui,sans-serif;text-align:center;padding:6px}
      .name{padding:6px 8px 0;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:6px 8px 8px}
      .badge{min-width:36px;text-align:center;padding:2px 8px;border-radius:4px;background:var(--brand);color:var(--brand-t);font-weight:700;font-size:13px}
      .none .badge{background:var(--soft);color:var(--mute)}
      select.cat{flex:1 1 100%;min-width:0;height:28px;padding:0 6px;font-size:12px;border-radius:4px}
      .st{position:absolute;top:6px;left:6px;padding:2px 8px;border-radius:4px;background:#fff;border:1px solid var(--line2);font-size:11px;font-weight:700}
      .mini{position:absolute;top:6px;height:24px;border-radius:4px;border:1px solid var(--line2);font-size:11px;font-weight:700;cursor:pointer}
      .mini.rt{right:36px;padding:0 8px;background:var(--brand);border-color:var(--brand-b);color:var(--brand-t)}
      .mini.x{right:6px;width:24px;padding:0;background:#fff;color:var(--mute);font-size:15px;line-height:1;display:none}
      .card:hover .mini.x{display:block}
      .mini.x:hover{background:var(--danger);border-color:var(--danger);color:#fff}

      .zoom{position:fixed;top:50%;transform:translateY(-50%);z-index:5;width:min(760px,52vw);pointer-events:none;border:3px solid var(--ink);border-radius:4px;background:var(--ink);box-shadow:0 18px 50px rgba(0,0,0,.5);overflow:hidden}
      .zoom img{display:block;width:100%;max-height:88vh;object-fit:contain;background:var(--ink)}
      .zoom .zl{position:absolute;left:8px;bottom:8px;background:rgba(0,0,0,.65);color:#fff;font:600 12px system-ui,sans-serif;padding:3px 8px;border-radius:4px}

      .foot{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 18px;background:#fff;border-top:1px solid var(--line);flex-wrap:wrap}
      #mInfo{font-size:13px;color:var(--mute)}
      .cfm{position:absolute;inset:0;z-index:6;background:rgba(17,17,17,.45);display:flex;align-items:center;justify-content:center;padding:16px}
      .cbox{background:#fff;border-radius:6px;padding:20px;max-width:420px;width:100%;box-shadow:0 18px 50px rgba(0,0,0,.3)}
      .cbox h3{margin:0 0 8px;font-size:16px}
      .cbox p{margin:0 0 16px;color:var(--mute);font-size:14px}
      .cbox .acts{display:flex;justify-content:flex-end;gap:8px}
      @media (max-width:640px){ .ov{padding:0} .sheet{border-radius:0} .top h2 small{display:none} .tools .inl{margin-left:0} .grid{grid-template-columns:repeat(auto-fill,minmax(min(var(--cw,300px),100%),1fr))} }
    </style>
    <div class="zoom" id="zoom" hidden><img alt=""><span class="zl"></span></div>
    <div class="ov" id="ov">
      <div class="sheet">
        <div class="top">
          <h2>${WORDMARK(38)}<small>Batch upload</small></h2>
          <div class="acts">
            <button class="btn" id="mAdd">Add photos</button>
            <button class="btn ghost" id="mFolder">Add a folder</button>
            <label class="inl"><input type="checkbox" id="mSub"> with sub-folders</label>
            <button class="btn ghost" id="mClear">Clear all</button>
            <button class="btn ghost" id="mClose" title="Close (Esc)">Close</button>
          </div>
        </div>
        <div class="paint">
          <span class="lbl">1 · Click photos to select them (blue)</span>
          <span class="lbl">2 · Then give them a country:</span>
          <div class="chips" id="chips"></div>
          <select class="more" id="more"></select>
        </div>
        <div class="tools">
          <button class="btn ghost sm" id="mSelAll">Select all</button>
          <button class="btn ghost sm" id="mSelUn">Select without country</button>
          <button class="btn ghost sm" id="mSelNone">Deselect</button>
          <button class="btn danger sm" id="mDel" disabled>Delete selected</button>
          <label class="inl">Size <input type="range" id="mSize" min="200" max="560" step="10"></label>
        </div>
        <div class="msg" id="mMsg">Click photos to select them, then press a country (or its number key). Shift+click = range · Ctrl+A = all · 0 = remove country · Del = delete · Hover a photo to zoom.</div>
        <div class="grid" id="grid"></div>
        <div class="foot">
          <span id="mInfo"></span>
          <button class="btn lg" id="mStart" disabled>Start uploading</button>
        </div>
      </div>
    </div>
    <div class="cfm" id="cfm" hidden><div class="cbox" role="dialog" aria-modal="true"><h3 id="cfmTitle"></h3><p id="cfmText"></p><div class="acts"><button class="btn ghost" id="cfmNo">Cancel</button><button class="btn danger" id="cfmYes">Clear</button></div></div></div>
    <input type="file" id="fMulti" multiple accept="image/*" hidden>
    <input type="file" id="fFolder" webkitdirectory multiple hidden>`;
  document.body.appendChild(mhost);
  const M = id => mroot.getElementById(id);

  function openManager() {
    managerOpen = true; document.documentElement.classList.add('pmg-busy'); mhost.style.display = 'block'; host.style.display = 'none'; app.modal = { onKey: managerKey };
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
    const typing = t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && /^(text|number|search)$/i.test(t.type)));
    if (e.key === 'Escape') { e.preventDefault(); if (sel.size) { sel.clear(); syncSel(); } else closeManager(); return; }
    if (typing) return;
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyA') { e.preventDefault(); queue.forEach(q => sel.add(q.id)); syncSel(); return; }
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

  // One card. Cards are rebuilt one at a time (refreshCard) or all together (renderGrid) -- a click never redraws the whole list.
  function buildCard(it) {
    const c = document.createElement('div');
    c.className = 'card' + (it.country ? '' : ' none') + (it.status !== 'pending' ? ' ' + it.status : '') + (sel.has(it.id) ? ' sel' : '');
    c.dataset.id = it.id; c.appendChild(thumbNode(it));
    const nm = document.createElement('div'); nm.className = 'name'; nm.textContent = it.name; nm.title = it.name; c.appendChild(nm);
    const row = document.createElement('div'); row.className = 'row';
    const bd = document.createElement('span'); bd.className = 'badge'; bd.textContent = it.country ? it.country.toUpperCase() : '?'; bd.title = it.country ? cName(it.country) : 'No country yet';
    row.appendChild(bd);
    if (it.country && catsCache[it.country] === undefined) ensureCats(it.country);
    const cats = it.country ? catsCache[it.country] : null;
    if (Array.isArray(cats) && cats.length > 1) {
      const pick = document.createElement('select'); pick.className = 'cat'; pick.title = 'Plate category';
      cats.forEach(k => { const o = document.createElement('option'); o.value = k.v; o.textContent = k.l; pick.appendChild(o); });
      pick.value = it.ctype || cats[0].v;
      pick.onchange = () => { it.ctype = pick.value === cats[0].v ? null : pick.value; qPut(it).catch(() => {}); };
      row.appendChild(pick);
    }
    c.appendChild(row);
    if (it.status !== 'pending') {
      const st = document.createElement('div'); st.className = 'st';
      st.textContent = { done: '✓ Uploaded', submitted: '✓ Sent', failed: '! Failed', opened: 'Opened in a tab' }[it.status] || it.status;
      c.appendChild(st);
      if (it.blob && (it.status === 'failed' || it.status === 'opened')) {
        const r = document.createElement('button'); r.className = 'mini rt'; r.textContent = 'Retry';
        r.onclick = ev => { ev.stopPropagation(); it.status = 'pending'; qPut(it).catch(() => {}); refreshCard(it); updateBatchInfo(); };
        c.appendChild(r);
      }
    }
    const x = document.createElement('button'); x.className = 'mini x'; x.textContent = '×'; x.title = 'Remove this photo from the list';
    x.onclick = ev => { ev.stopPropagation(); deleteIds([it.id]); };
    c.appendChild(x);
    c.onmouseenter = () => showZoom(it, c); c.onmouseleave = hideZoom;
    c.onclick = ev => onCardClick(ev, it, queue.indexOf(it));
    return c;
  }
  const cardOf = it => mroot.querySelector(`.card[data-id="${it.id}"]`);
  function refreshCard(it) {
    const old = cardOf(it); if (!old) return;
    hideZoom(); old.replaceWith(buildCard(it));
  }
  // Selection changed: only toggle the blue state
  function syncSel() {
    for (const c of M('grid').children) if (c.dataset && c.dataset.id) c.classList.toggle('sel', sel.has(c.dataset.id));
    updateStats();
  }
  function updateStats() {
    for (const id of [...sel]) if (!queue.some(q => q.id === id)) sel.delete(id);
    M('mDel').disabled = !sel.size; M('mDel').textContent = sel.size ? `Delete selected (${sel.size})` : 'Delete selected';
    const ready = readyCount(), noC = queue.filter(q => q.status === 'pending' && !q.country).length;
    M('mInfo').textContent = `${pl(queue.length, 'photo')} · ${ready} ready · ${noC} without a country (will be skipped) · ${queue.filter(isFinished).length} uploaded`;
    M('mStart').disabled = ready === 0;
    M('mStart').textContent = ready ? `Start uploading ${pl(ready, 'photo')}` : 'Start uploading';
  }
  function renderGrid() {
    hideZoom();
    const g = M('grid'), frag = document.createDocumentFragment();
    if (!queue.length) {
      const e = document.createElement('div'); e.className = 'empty';
      e.textContent = 'No photos yet. Use “Add photos” or “Add a folder”, or drop photos here.';
      frag.appendChild(e);
    }
    queue.forEach(it => frag.appendChild(buildCard(it)));
    g.replaceChildren(frag);
    updateStats();
  }

