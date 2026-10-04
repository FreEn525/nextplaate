  /* =====================================================================
   *  KEYBOARD  (one listener for the whole script)
   *    Order: the open window (batch manager) first, then Esc, then the keys each feature declared.
   *    Ignored while typing, or with Ctrl/Cmd/Alt. Keys are read from e.code: the physical key, on any layout.
   * ===================================================================== */
  // Letter printed on the physical left key ("previous page"): Q on AZERTY, A on QWERTY. Learned from the real layout.
  let prevKey = /^fr|^be/i.test(navigator.language || '') ? 'Q' : 'A';
  if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
    navigator.keyboard.getLayoutMap().then(map => {
      const k = map.get('KeyA');
      if (k && /^[a-z]$/i.test(k)) { prevKey = k.toUpperCase(); updateHint(); }
    }).catch(() => {});
  }

  document.addEventListener('keydown', e => {
    if (app.modal) { app.modal.onKey(e); return; }
    if (e.key === 'Escape') {
      for (const f of escapeChain) if (f.onEscape()) return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.code === 'KeyA' && /^[a-z]$/i.test(e.key || '') && e.key.toUpperCase() !== prevKey) {
      prevKey = e.key.toUpperCase(); updateHint();
    }
    const t = e.target;
    if (t === host || (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable))) return;
    const k = keyMap[e.code];
    if (k && k.run(e)) e.preventDefault();
  });
