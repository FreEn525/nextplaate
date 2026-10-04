  // ---- loading a photo into this tab ----
  function openItem(it) {
    setBatch({ active: true, current: it.id, pendingSubmit: null, ts: Date.now() });
    updateBatchInfo();
    const path = '/' + it.country + '/add';
    if (location.pathname.replace(/\/$/, '') === path) loadIntoEditor(it);
    else { setStatus(`Opening the <b>${esc(cName(it.country))}</b> upload page for <b>${esc(it.name)}</b>…`); location.href = path; }
  }
  const batchResumable = () => {
    const b = getBatch();
    return !!(b && b.active && b.current && queue.some(q => q.id === b.current && (isOpenable(q) || q.status === 'failed')));
  };
  function resumeCurrent() {
    const b = getBatch(), cur = b && queue.find(q => q.id === b.current);
    if (!cur) return;
    if (cur.status === 'failed' || cur.status === 'opened') { cur.status = 'pending'; qPut(cur).catch(() => {}); }
    openItem(cur);
  }

  const waitFor = (fn, ms = 8000) => new Promise(res => {
    const t0 = Date.now();
    (function tick() { const v = fn(); if (v) return res(v); if (Date.now() - t0 > ms) return res(null); setTimeout(tick, 200); })();
  });
  function feedInput(input, file) {
    try {
      const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    } catch (e) { return false; }
  }
  // After the editor opens it may show its own "select photo" file field: give it the photo too
  function feedEditor(file, mainInput) {
    return new Promise(resolve => {
      const t0 = Date.now(), fed = new WeakSet(); let n = 0;
      const timer = setInterval(() => {
        // The editor's own field first (known from the real DOM), then any other empty file field
        const cands = [...document.querySelectorAll('.pm-photo-editor input[type="file"][data-role="file"], input[type="file"]')];
        cands.forEach(i => {
          if (i !== mainInput && !fed.has(i) && !(i.files && i.files.length)) { fed.add(i); if (feedInput(i, file)) n++; }
        });
        const ws = document.querySelector('.pm-photo-editor__workspace');
        const loaded = ws && !ws.hidden;                 // editor shows its workspace once the photo is decoded
        if ((n && loaded) || Date.now() - t0 > (n ? 15000 : 7000)) { clearInterval(timer); resolve(n); }
      }, 300);
    });
  }
  let loadingNow = false;
  async function loadIntoEditor(it) {
    if (loadingNow) return;
    loadingNow = true;
    try {
      const input = await waitFor(() => document.getElementById('filename'));
      const openBtn = await waitFor(() => document.getElementById('pm-photo-editor-open'));
      if (!input || !openBtn) { setStatus('Could not find the upload form on this page.'); return; }
      if (!it.blob) { setStatus(`The photo <b>${esc(it.name)}</b> is no longer stored. Add it again (U).`); return; }
      const file = new File([it.blob], it.name, { type: it.type, lastModified: it.lastModified });
      { // plate category chosen in the manager (default = the page's first one); fires the site's own onchange
        const sel = document.getElementById('ctype');
        const want = it.ctype || (sel && sel.options[0] ? sel.options[0].value : '');
        if (sel && want && sel.value !== want) { sel.value = want; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      }
      setStatus(`Loading <b>${esc(it.name)}</b> into the editor…`);
      feedInput(input, file);
      openBtn.click();
      const n = await feedEditor(file, input);
      setStatus(`<b>${esc(it.name)}</b> sent to the editor (${n ? 'through its file field' : 'through the form'}). Crop and retouch, click Add, enter the plate, then send. Photo not shown? Press <b>R</b> to try again.`);
    } finally { loadingNow = false; }
  }

