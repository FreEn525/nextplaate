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
      if (k && /^[a-z]$/i.test(k)) prevKey = k.toUpperCase();
    }).catch(() => {});
  }

  // Name shown for a key code: KeyS -> S, Digit3 -> 3, ArrowLeft -> ←
  const keyName = code => {
    if (code === 'KeyA') return prevKey;   // the physical left key is labelled for YOUR layout
    if (!code) return '?';
    const arrows = { ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' };
    return arrows[code] || code.replace(/^Key|^Digit|^Numpad/, '');
  };
  // Ctrl+A is the letter A, whatever the layout: on AZERTY that key has the code KeyQ
  const isSelectAll = e => (e.key || '').toLowerCase() === 'a';
  // Text fields only: a checkbox, a select or a slider does not take the keys
  const isTextField = el => !!el && (el.isContentEditable || el.tagName === 'TEXTAREA' ||
    (el.tagName === 'INPUT' && /^(text|number|search|url|email|password)$/i.test(el.type)));

  // The focused control: from the event target, down through every shadow root that holds the focus
  function deepActive(el) {
    while (el && el.shadowRoot && el.shadowRoot.activeElement) el = el.shadowRoot.activeElement;
    return el;
  }

  // Capture phase on window: we see the key before the site does, so a site script cannot swallow it
  window.addEventListener('keydown', e => {
    log('key', e.code, 'target', e.target.tagName, e.target.id || '', 'modal', !!app.modal, 'capture', !!app.capture);
    if (app.capture) { e.preventDefault(); e.stopPropagation(); app.capture(e); return; }
    if (app.modal) {
      if ((e.ctrlKey || e.metaKey) && isSelectAll(e)) e.preventDefault();   // never the page text
      app.modal.onKey(e); e.stopPropagation(); return;
    }
    if (e.key === 'Escape') {
      for (const f of escapeChain) if (f.onEscape()) return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.code === 'KeyA' && /^[a-z]$/i.test(e.key || '') && e.key.toUpperCase() !== prevKey) {
      prevKey = e.key.toUpperCase();
    }
    // Focus inside the panel or inside a card of the script (each is a shadow root): the event target is the host of that root, so
    // look at the control that has the focus, however deep
    const field = deepActive(e.target);
    if (isTextField(field)) return;
    const k = keyMap[e.code];
    log('  action for', e.code, '=', k ? k.id : 'none');
    if (k && k.run(e)) {
      e.preventDefault(); e.stopPropagation();
      if (e.target === host && host.shadowRoot.activeElement) host.shadowRoot.activeElement.blur();   // no ring left on the icon
    }
  }, true);
