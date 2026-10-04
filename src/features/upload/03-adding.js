  // ---- adding photos ----
  const IMG_RE = /\.(jpe?g|png|webp|heic|heif|avif|gif|bmp|tiff?)$/i;
  const isHeic = f => /heic|heif/i.test(f.type || '') || /\.(heic|heif|hif)$/i.test(f.name || '');
  // Newer libheif (reads recent iPhone HEICs)
  async function heicViaLibheif(file) {
    if (typeof libheif === 'undefined') throw new Error('libheif not loaded');
    const lib = typeof libheif === 'function' ? libheif() : libheif;
    const imgs = new lib.HeifDecoder().decode(new Uint8Array(await file.arrayBuffer()));
    if (!imgs || !imgs.length) throw new Error('libheif: no image found');
    const im = imgs[0], w = im.get_width(), h = im.get_height();
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'), data = ctx.createImageData(w, h);
    await new Promise((res, rej) => im.display(data, r => r ? res(r) : rej(new Error('libheif: could not render the image'))));
    ctx.putImageData(data, 0, 0);
    return c;                                   // a canvas can be drawn like a bitmap
  }
  async function bitmapOf(file) {
    try { return await createImageBitmap(file, { resizeWidth: 1400, resizeQuality: 'high' }); } catch (e) {}   // fast path: decoded straight at preview size
    try { return await createImageBitmap(file); } catch (e) {}                                                // other formats the browser can read
    if (isHeic(file)) return heicViaLibheif(file);
    throw new Error('this browser cannot read this format');
  }
  // Smooth downscale: halve step by step, then a final high-quality pass (a single big jump looks pixelated)
  function downscale(src, tw) {
    let cur = src, w = src.width, h = src.height;
    const tw2 = Math.min(tw, w), th2 = Math.max(1, Math.round(h * tw2 / w));
    while (w / 2 >= tw2) {
      const nw = Math.max(tw2, Math.floor(w / 2)), nh = Math.max(1, Math.floor(h / 2));
      const c = document.createElement('canvas'); c.width = nw; c.height = nh;
      const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(cur, 0, 0, nw, nh);
      cur = c; w = nw; h = nh;
    }
    const out = document.createElement('canvas'); out.width = tw2; out.height = th2;
    const ox = out.getContext('2d'); ox.imageSmoothingEnabled = true; ox.imageSmoothingQuality = 'high'; ox.drawImage(cur, 0, 0, tw2, th2);
    return out;
  }
  async function makeThumb(file) {
    try {
      const bmp = await bitmapOf(file);
      const c = downscale(bmp, 1400);
      if (bmp.close) bmp.close();
      return c.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      const m = e && (e.message || (typeof e === 'string' ? e : JSON.stringify(e))) || 'unknown error';
      try { file.__why = String(m).slice(0, 140); console.warn('[NextPlaate] preview failed for', file.name, e); } catch (x) {}
      return '';
    }
  }
  // Previews are made in the background (4 at a time; HEIC one at a time because it is heavy), so the photos
  // appear in the list at once. The ORIGINAL file is stored untouched and is what gets uploaded.
  const thumbBusy = new Set();
  function setCardThumb(it) {
    const c = cardOf(it); if (!c) return;
    const old = c.firstElementChild; if (old && (old.tagName === 'IMG' || old.classList.contains('noprev'))) old.remove();
    c.insertBefore(thumbNode(it), c.firstChild);
  }
  function thumbNode(it) {
    if (it.thumb) { const im = document.createElement('img'); im.src = it.thumb; im.alt = ''; return im; }
    const ph = document.createElement('div'); ph.className = 'noprev';
    ph.textContent = (!it.why && it.blob && thumbBusy.has(it.id)) ? 'Loading preview…'
      : ((it.name.match(/\.(\w+)$/) || [])[1] || 'photo').toUpperCase() + ' · no preview' + (it.why ? ' — ' + it.why : '');
    ph.title = it.why || ''; return ph;
  }
  let thumbRun = false;
  async function fillThumbs() {
    if (thumbRun) return; thumbRun = true;
    try {
      const todo = queue.filter(q => !q.thumb && !q.why && q.blob);
      todo.forEach(q => thumbBusy.add(q.id));
      todo.forEach(setCardThumb);
      const light = todo.filter(q => !isHeic(q)), heavy = todo.filter(q => isHeic(q));
      const work = async list => {
        while (list.length) {
          const it = list.shift(); if (!queue.includes(it)) { thumbBusy.delete(it.id); continue; }
          it.thumb = await makeThumb(it.blob); it.why = it.blob.__why || '';
          thumbBusy.delete(it.id); setCardThumb(it); qPut(it).catch(() => {});
          M('mMsg').textContent = `Preparing previews… ${thumbBusy.size} left`;
        }
      };
      await Promise.all([work(light), work(light), work(light), work(light), work(heavy)]);
      if (todo.length) M('mMsg').textContent = 'Previews ready.';
    } finally { thumbRun = false; }
  }
  async function addFiles(list) {
    const files = [...list].filter(f => /^image\//.test(f.type) || IMG_RE.test(f.name));
    if (!files.length) { M('mMsg').textContent = 'No photos found in that selection.'; return; }
    try {
      // finished photos make room for the new batch
      for (const q of queue.filter(q => q.status === 'done')) await qDel(q.id);
      queue = queue.filter(q => q.status !== 'done');
      const known = new Set(queue.map(q => q.key));
      const fresh = files.filter(f => !known.has(f.name + '|' + f.size + '|' + f.lastModified))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      let order = queue.reduce((m, q) => Math.max(m, q.order), 0);
      const items = fresh.map(f => ({ id: uid(), key: f.name + '|' + f.size + '|' + f.lastModified, order: ++order, name: f.name,
        type: f.type || 'image/jpeg', lastModified: f.lastModified, blob: f, thumb: '', why: '', country: '', ctype: null, status: 'pending' }));
      items.forEach(i => queue.push(i));
      renderGrid(); updateBatchInfo();                                   // everything is visible immediately
      M('mMsg').textContent = `Saving ${pl(items.length, 'photo')}…`;
      for (let i = 0; i < items.length; i += 8) await Promise.all(items.slice(i, i + 8).map(qPut));   // saved 8 at a time
      M('mMsg').textContent = fresh.length ? `Added ${pl(fresh.length, 'photo')}. Click photos to select them, then give them a country.` : 'These photos are already in the list.';
      fillThumbs();
    } catch (e) {
      M('mMsg').textContent = 'Could not store the photos in this browser (private window?). Try a normal window.';
    }
    renderGrid(); updateBatchInfo();
  }
  M('mAdd').onclick = () => M('fMulti').click();
  // Recursive folder reading (every sub-folder), through the browser's folder picker when it has one
  const subDepth = () => (M('mSub') && M('mSub').checked) ? 12 : 0;   // 0 = only the folder itself
  async function walkDir(dh, out, depth = 0) {
    for await (const [name, h] of dh.entries()) {
      if (h.kind === 'file') { if (IMG_RE.test(name)) out.push(await h.getFile()); }
      else if (depth < subDepth() && !name.startsWith('.')) await walkDir(h, out, depth + 1);
    }
  }
  async function walkEntry(en, out, depth = 0) {                // drag & drop of folders
    if (!en) return;
    if (en.isFile) { const f = await new Promise(r => en.file(r, () => r(null))); if (f && (/^image\//.test(f.type) || IMG_RE.test(f.name))) out.push(f); }
    else if (en.isDirectory && depth <= subDepth()) {
      const rd = en.createReader();
      for (;;) {                                               // readEntries returns small batches
        const batch = await new Promise(r => rd.readEntries(r, () => r([])));
        if (!batch.length) break;
        for (const c of batch) await walkEntry(c, out, depth + 1);
      }
    }
  }
  M('mSub').checked = store.get('sub', '0') === '1';
  M('mSub').onchange = () => store.set('sub', M('mSub').checked ? '1' : '0');
  M('mFolder').onclick = async () => {
    const pick = (typeof unsafeWindow !== 'undefined' && unsafeWindow.showDirectoryPicker) || window.showDirectoryPicker;
    if (typeof pick === 'function') {
      try {
        const dh = await pick.call(typeof unsafeWindow !== 'undefined' ? unsafeWindow : window, { mode: 'read' });
        const out = []; M('mMsg').textContent = 'Looking for photos in all sub-folders…';
        await walkDir(dh, out);
        addFiles(out); return;
      } catch (e) { if (e && e.name === 'AbortError') return; }  // otherwise fall back to the classic picker
    }
    M('fFolder').click();
  };
  M('fMulti').onchange = e => { addFiles(e.target.files); e.target.value = ''; };
  M('fFolder').onchange = e => {
    let fs = [...e.target.files];
    if (!subDepth()) fs = fs.filter(f => (f.webkitRelativePath || '').split('/').length <= 2);  // "folder/photo.jpg" only
    addFiles(fs); e.target.value = '';
  };
  M('ov').addEventListener('dragover', e => e.preventDefault());
  M('ov').addEventListener('drop', async e => {
    e.preventDefault();
    const dt = e.dataTransfer; if (!dt) return;
    const ents = [...(dt.items || [])].map(i => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
    if (ents.length) { const out = []; M('mMsg').textContent = 'Looking for photos in the dropped items…'; for (const en of ents) await walkEntry(en, out); addFiles(out); }
    else if (dt.files.length) addFiles(dt.files);
  });
  M('mClose').onclick = closeManager;
  M('mClear').onclick = async () => {
    if (!queue.length || !(await askConfirm('Clear the list?', 'All photos leave the batch list. Your files on disk are not touched.', 'Clear'))) return;
    try { await qClear(); } catch (e) {}
    queue = []; sel.clear(); setBatch(null); renderGrid(); updateBatchInfo();
  };
  M('mStart').onclick = () => { closeManager(); startMulti(); };

