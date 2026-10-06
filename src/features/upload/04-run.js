  // ---- "Start uploading": one new tab per photo, spaced out so Cloudflare does not get nervous ----
  // Each tab gets its photo through the address (#pmg=ID), loads it into the editor and is then on its own.
  let multi = null;                       // { list, total, opened, timer }
  const CF_PAUSE = 15 * 60 * 1000;        // after a Cloudflare challenge, do not open anything for 15 min
  const cfRecent = () => Date.now() - (+store.get('cfhit', '0') || 0) < CF_PAUSE;
  function stopMulti(msg) {
    if (multi && multi.timer) clearTimeout(multi.timer);
    multi = null; updateBatchInfo(); if (msg) setStatus(msg);
  }
  function startMulti() {                 // runs inside the click, so the first tab is never blocked
    if (multi) return;
    if (cfRecent()) { setStatus('Cloudflare asked for a check a moment ago. Open the site normally, solve it, and wait a few minutes before starting again.'); return; }
    const list = queue.filter(q => q.status === 'pending' && q.country && q.blob);
    if (!list.length) { setStatus(`Nothing ready: give each photo a country first (press <b>${keyOf('open')}</b>).`); return; }
    multi = { list, total: list.length, opened: 0, timer: null };
    updateBatchInfo();
    multiStep();
  }
  function multiStep() {
    if (!multi) return;
    if (cfRecent()) { stopMulti('Paused: Cloudflare showed a check in one of the tabs. Solve it there, wait a few minutes, then press Start again (the rest is kept).'); return; }
    const it = multi.list.shift();
    if (!it) { const n = multi.opened; stopMulti(`All <b>${n}</b> tab${n > 1 ? 's' : ''} opened. Finish each one: crop, Add, plate, send.`); return; }
    let w = null;
    const url = location.origin + '/' + it.country + '/add#pmg=' + encodeURIComponent(it.id);
    // Tampermonkey's own tab opener: never blocked as a pop-up, and opens in the background (this tab keeps running)
    try { if (typeof GM_openInTab === 'function') w = GM_openInTab(url, { active: false, insert: true, setParent: true }) || true; } catch (e) {}
    if (!w) { try { w = window.open(url, '_blank'); } catch (e) {} }
    if (!w) {
      const left = multi.list.length + 1;
      stopMulti(`Could not open a new tab. Check that the script has the <b>GM_openInTab</b> permission (reinstall it), or allow <b>pop-ups</b> for platesmania.com, then press Start again. ${left} photo${left > 1 ? 's' : ''} still waiting.`);
      return;
    }
    it.status = 'opened'; it.openedAt = Date.now(); qPut(it).catch(() => {});
    multi.opened++;
    updateBatchInfo();
    if (!multi.list.length) { multiStep(); return; }
    const sec = Math.min(120, Math.max(5, +store.get('qDelay', '10') || 10));
    const wait = Math.round(sec * 1000 * (0.85 + Math.random() * 0.5)); // slight random jitter, looks less robotic
    setStatus(`Opened <b>${multi.opened}</b> of ${multi.total}. Next tab in ~${Math.round(wait / 1000)} s… (keep this tab open)`);
    multi.timer = setTimeout(multiStep, wait);
  }

