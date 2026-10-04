  /* =====================================================================
   *  KEYBOARD  (one listener for the whole script)
   *    Order: a key being chosen (Shortcuts drawer), then the open window (batch manager), then Esc,
   *    then the key actions of the features. Ignored while typing in a text field. Keys are read from
   *    e.code: the physical key, on any layout.
   * ===================================================================== */
  // Letter printed on the physical left key ("previous page"): Q on AZERTY, A on QWERTY. Learned from the real layout.
  let prevKey = /^fr|^be/i.test(navigator.language || '') ? 'Q' : 'A';
  if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
    navigator.keyboard.getLayoutMap().then(map => {
      const k = map.get('KeyA');
      if (k && /^[a-z]$/i.test(k)) { prevKey = k.toUpperCase(); updateHint(); }
    }).catch(() => {});
  }

  // Name shown for a key code: KeyS -> S, Digit3 -> 3, ArrowLeft -> ←
  const keyName = code => {
    if (code === 'KeyA') return prevKey;   // the physical left key is labelled for YOUR layout
    if (!code) return '?';
    const arrows = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' };
    return arrows[code] || code.replace(/^Key|^Digit|^Numpad/, '');
  };
  // Text fields only: a checkbox, a select or a slider does not take the keys
  const isTextField = el => !!el && (el.isContentEditable || el.tagName === 'TEXTAREA' ||
    (el.tagName === 'INPUT' && /^(text|number|search|url|email|password)$/i.test(el.type)));

  document.addEventListener('keydown', e => {
    if (app.capture) { e.preventDefault(); e.stopPropagation(); app.capture(e); return; }
    if (app.modal) { app.modal.onKey(e); return; }
    if (e.key === 'Escape') {
      for (const f of escapeChain) if (f.onEscape()) return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.code === 'KeyA' && /^[a-z]$/i.test(e.key || '') && e.key.toUpperCase() !== prevKey) {
      prevKey = e.key.toUpperCase(); updateHint();
    }
    // Focus inside the panel: the event target is the panel itself, so look at the focused control
    const field = e.target === host ? host.shadowRoot.activeElement : e.target;
    if (isTextField(field)) return;
    const k = keyMap[e.code];
    if (k && k.run(e)) e.preventDefault();
  });
