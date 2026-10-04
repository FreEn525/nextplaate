  /* =====================================================================
   *  KEYBOARD SHORTCUTS  (ignored while typing, or with Ctrl/Cmd/Alt)
   *    S  select photos · F fill description (edit page) · U batch upload · N start uploading · R reload photo
   *    Esc  cancel (selection, auto-like, tab opening)
   *    L  like the page, or "Pages to like" pages (again, or Esc = stop)
   *    Q (A on QWERTY) previous page · D next page   (same physical keys on any layout)
   * ===================================================================== */
  document.addEventListener('keydown', e => {
    if (managerOpen) { managerKey(e); return; }
    if (e.key === 'Escape') {
      if (multi) { stopMulti('Stopped. The photos not yet opened are still waiting.'); return; }
      if (state.mode) { stopSelecting(); return; }
      if (liking || getRun()) { cancelLikeRun('Auto-like stopped.'); return; }
    }
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    // Learn the letter printed on the physical left key (Q on AZERTY, A on QWERTY) for the hint
    if (e.code === 'KeyA' && /^[a-z]$/i.test(e.key || '') && e.key.toUpperCase() !== prevKey) {
      prevKey = e.key.toUpperCase(); render();
    }
    const t = e.target;
    if (t === host || (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable))) return;
    const k = e.code; // physical key, so it works on any layout
    if (k === 'KeyS') { e.preventDefault(); $('sel').click(); }
    else if (k === 'KeyF' && onEditPage) { e.preventDefault(); $('fillBtn').click(); }
    else if (k === 'KeyL') { // like this page (or "Pages to like" pages); press again while running = stop
      if (liking || getRun() || unlikedHearts().length || (pagesWanted() > 1 && document.querySelector('i.rating[id^="unit_ul"]'))) {
        e.preventDefault(); likeAll();
      } else if (document.querySelector('i.rating[id^="unit_ul"]')) { e.preventDefault(); setStatus('Nothing left to like on this page.'); }
    }
    else if (k === 'KeyU') { e.preventDefault(); openManager(); } // batch upload manager
    else if (k === 'KeyN' && queue.length) { e.preventDefault(); startMulti(); }   // start uploading
    else if (k === 'KeyR' && batchResumable()) { e.preventDefault(); resumeCurrent(); } // (re)load current photo
    else if (k === 'KeyA') { if (goToPage(-1)) e.preventDefault(); } // left key  -> previous page
    else if (k === 'KeyD') { if (goToPage(+1)) e.preventDefault(); } // right key -> next page
  });

