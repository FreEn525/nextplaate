  /* =====================================================================
   *  SHORTCUTS  (every key of the script, and a way to change them)
   * ===================================================================== */
  // Click a key, then press the new one. A key another action already uses is swapped with this one.
  const MODIFIERS = ['Shift', 'Control', 'Alt', 'Meta'];

  function renderShortcuts() {
    const rows = Object.entries(actions)
      .sort(([, a], [, b]) => (a.hintOrder || 99) - (b.hintOrder || 99))
      .map(([id, a]) => h('div', { class: 'kbrow' },
        h('span', { class: 'kblabel', text: a.label }),
        h('span', { class: 'kbright' },
          h('button', { class: 'kbkey', text: keyName(a.bound), title: 'Click, then press the new key', onclick: () => capture(id) }),
          h('button', { class: 'kbreset', text: '↺', title: 'Back to the default key', hidden: a.bound === a.code, onclick: () => { store.del('kb_' + id); rebuildKeys(); renderShortcuts(); } }))));
    rows.push(
      h('div', { class: 'kbrow fixed' }, h('span', { class: 'kblabel', text: 'Cancel, close, stop' }), h('span', { class: 'kbkey static', text: 'Esc' })),
      h('div', { class: 'kbrow fixed' }, h('span', { class: 'kblabel', text: 'Select all photos (batch window)' }), h('span', { class: 'kbkey static', text: 'Ctrl + A' })));
    $('kbList').replaceChildren(...rows);
  }

  function capture(id) {
    setStatus(`Press the new key for <b>${actions[id].label}</b>… (Esc cancels)`);
    app.capture = e => {
      if (MODIFIERS.includes(e.key)) return;                       // wait for the real key
      app.capture = null;
      if (e.key === 'Escape') { setStatus('Change cancelled.'); renderShortcuts(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) { setStatus('Use a single key, without Ctrl or Alt.'); renderShortcuts(); return; }
      setBinding(id, e.code);
    };
  }

  function setBinding(id, code) {
    const other = Object.keys(actions).find(o => o !== id && actions[o].bound === code);
    if (other) store.set('kb_' + other, actions[id].bound);       // swap with the other action
    store.set('kb_' + id, code);
    rebuildKeys(); renderShortcuts();
    setStatus(`<b>${actions[id].label}</b> is now <b>${keyName(code)}</b>${other ? ` (${actions[other].label} got the old key)` : ''}.`);
  }

  function resetAll() {
    Object.keys(actions).forEach(id => store.del('kb_' + id));
    rebuildKeys(); renderShortcuts();
    setStatus('Shortcuts back to the defaults.');
  }

  registerFeature({
    groups: [{
      drawer: 'keys', title: 'Keys',
      build: () => [
        h('div', { id: 'kbList', class: 'kblist' }),
        h('button', { class: 'btn ghost', text: 'Reset all to the defaults', onclick: resetAll })
      ]
    }],
    init: () => renderShortcuts()
  });
