  // One card. Cards are rebuilt one at a time (refreshCard) or all together (renderGrid) -- a click never redraws the whole list.
  function buildCard(it) {
    const c = document.createElement('div');
    c.className = 'card' + (it.country ? '' : ' none') + (it.status !== 'pending' ? ' ' + it.status : '') + (sel.has(it.id) ? ' sel' : '');
    c.dataset.id = it.id; c.appendChild(thumbNode(it));
    const nm = document.createElement('div'); nm.className = 'name'; nm.textContent = it.name; nm.title = it.name; c.appendChild(nm);
    if (it.dupes) c.appendChild(h('div', { class: 'dupbadge', text: `⚠ ${it.dupes} already on the site`, title: it.plate || '' }));
    const row = document.createElement('div'); row.className = 'row';
    const bd = document.createElement('span'); bd.className = 'badge'; bd.textContent = it.country ? it.country.toUpperCase() : 'No country'; bd.title = it.country ? cName(it.country) : 'No country yet';
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
      // an empty list says what to do first, with the buttons right there
      const e = h('div', { class: 'empty' }, h('h3', { text: 'No photos yet' }), h('p', { text: 'Add the photos you want to send, or drop them here. You give each one a country next.' }),
        h('div', { class: 'acts' }, h('button', { class: 'btn', text: 'Add photos', onclick: () => M('mAdd').click() }), h('button', { class: 'btn ghost', text: 'Add a folder', onclick: () => M('mFolder').click() })));
      frag.appendChild(e);
    }
    queue.forEach(it => frag.appendChild(buildCard(it)));
    g.replaceChildren(frag);
    updateStats();
  }

