  // ---- is the tab of an "opened" photo still there? ----
  // Each upload tab holds a Web Lock named after its photo for as long as it is open (the browser releases it
  // when the tab closes, even a throttled background one). Any other tab can see which locks exist.
  const LOCK = id => 'pmg-tab-' + id;
  function holdLock(id) {
    try { if (navigator.locks && id) navigator.locks.request(LOCK(id), () => new Promise(() => {})); } catch (e) {}
  }
  const missed = {};
  async function reapOpened() {
    if (!navigator.locks || !navigator.locks.query) return;
    const opened = queue.filter(q => q.status === 'opened');
    if (!opened.length) return;
    let held;
    try { held = new Set(((await navigator.locks.query()).held || []).map(l => l.name)); } catch (e) { return; }
    for (const q of opened) {
      if (held.has(LOCK(q.id)) || Date.now() - (q.openedAt || 0) < 20000) { missed[q.id] = 0; continue; }   // alive, or still loading
      if (++missed[q.id] < 2) continue;                                   // gone twice in a row (not just a page change)
      try {
        const fresh = await qGet(q.id);                                   // never overwrite what another tab just saved
        if (fresh && fresh.status === 'opened') { fresh.status = 'pending'; await qPut(fresh); }
        q.status = fresh ? fresh.status : 'pending';
      } catch (e) { continue; }
      if (managerOpen) refreshCard(q);
      updateBatchInfo();
    }
  }
  setInterval(reapOpened, 5000);

  // The form was sent: remember which photo, the next page tells us how it went
  const markSubmitted = () => {
    const b = getBatch();
    if (!b || !b.active || !b.current) return;
    const it = queue.find(q => q.id === b.current);
    if (it) { it.status = 'submitted'; qPut(it).catch(() => {}); }
    setBatch({ ...b, pendingSubmit: b.current, ts: Date.now() });
  };
  document.addEventListener('submit', e => {
    if (e.defaultPrevented || !e.target || e.target.id !== 'frm') return;
    markSubmitted();
  });
  { // patch the PAGE's form.submit (the script runs in Tampermonkey's sandbox, so go through unsafeWindow)
    const PW = (typeof unsafeWindow !== 'undefined' && unsafeWindow) || window;
    const proto = PW.HTMLFormElement.prototype, _origSubmit = proto.submit;
    proto.submit = function () { try { if (this.id === 'frm') markSubmitted(); } catch (e) {} return _origSubmit.apply(this, arguments); };
  }

  const visible = el => !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
  const pageError = () => {
    const els = [...document.querySelectorAll('.alert-danger, .alert-error, .alert-warning, .has-error')].filter(visible);
    return els.length ? els[0].textContent.replace(/\s+/g, ' ').trim().slice(0, 160) : '';
  };

  async function batchOnLoad() {
    try { queue = await qAll(); } catch (e) { queue = []; }
    // A tab opened by "Start uploading" carries its photo in the address: #pmg=ID
    const hm = location.hash.match(/^#pmg=(.+)$/);
    if (hm) {
      const hid = decodeURIComponent(hm[1]);
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      const hit = queue.find(q => q.id === hid);
      if (hit && isOpenable(hit)) setBatch({ active: true, current: hid, pendingSubmit: null, ts: Date.now() });
    }
    updateBatchInfo();
    const b = getBatch();
    if (!b || !b.active) return;
    holdLock(b.current);                                    // tells the other tabs this photo's tab is alive
    const cur = b.current && queue.find(q => q.id === b.current);

    // 1) this page is the answer to a photo we just sent
    if (b.pendingSubmit && Date.now() - (b.ts || 0) < 300000) {
      const it = queue.find(q => q.id === b.pendingSubmit);
      setBatch({ ...b, pendingSubmit: null, ts: Date.now() });
      if (it) {
        const err = document.querySelector('#filename[type="file"]') ? pageError() : '';
        if (err) {
          it.status = 'failed'; await qPut(it); updateBatchInfo();
          setStatus(`The site did not accept <b>${esc(it.name)}</b>: ${esc(err)}<br>Press <b>R</b> to try this photo again.`);
          return;
        }
        it.status = 'done'; it.blob = null; await qPut(it); updateBatchInfo();
        setStatus(`<b>${esc(it.name)}</b> sent ✓ You can close this tab.`);
        return;
      }
    }
    // 2) we are on the upload page of the current photo: put it in the editor
    const m = location.pathname.match(/^\/([a-z]{2})\/add\/?$/i);
    if (m && cur && isOpenable(cur)) {
      if (cur.country === m[1].toLowerCase()) loadIntoEditor(cur);
      else location.href = '/' + cur.country + '/add';
      return;
    }
    // 3) anywhere else: stay out of the way
    if (cur && isOpenable(cur)) setStatus(`Batch paused on <b>${esc(cur.name)}</b>. Press <b>R</b> to open it again.`);
  }

