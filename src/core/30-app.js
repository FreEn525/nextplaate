  /* =====================================================================
   *  APP  (feature registry: a feature declares its ribbon groups, its key actions and its Esc behaviour)
   * ===================================================================== */
  // A feature is registered when the script loads, but touches nothing on the page then:
  // mountApp() builds the panel first, and only then runs each feature's init().
  //   registerFeature({
  //     groups:   [{ drawer: 'pair', title: 'Photos', build: () => nodes }], // controls, in a drawer of the bar
  //     keys:     { select: { code: 'KeyS', label: 'Select photos', run: () => true, hintOrder: 10 } },
  //               // run() returns true when it handled the key. The key can be changed by the user (Shortcuts drawer).
  //     onEscape: () => true, escOrder: 10,                                 // true when it handled Esc (lower runs first)
  //     init:     () => { ... }                                             // wires the controls, once the panel exists
  //   })
  const features = [];
  const actions = {};       // action id -> key spec (with .bound: the key it currently uses)
  let keyMap = {};          // e.code -> action, rebuilt when a key changes
  let escapeChain = [];     // features with onEscape, in escOrder
  const app = { modal: null, capture: null }; // modal: { onKey(e) } while a full window owns the keyboard; capture: waits for a new key

  const registerFeature = f => { features.push(f); };

  // The key an action uses: the user's choice if any, else its default
  const bindingOf = id => store.get('kb_' + id, actions[id].code);

  function rebuildKeys() {
    keyMap = {};
    Object.keys(actions).forEach(id => {
      actions[id].bound = bindingOf(id);
      keyMap[actions[id].bound] = { id, ...actions[id] };
    });
  }

  function mountApp() {
    features.forEach(f => Object.assign(actions, f.keys || {}));
    rebuildKeys();
    log('actions', Object.entries(actions).map(([id, a]) => id + '=' + a.bound).join(' '));
    mountRibbon(features);
    features.forEach(f => f.init && f.init());
    escapeChain = features.filter(f => f.onEscape).sort((a, b) => (a.escOrder || 0) - (b.escOrder || 0));
  }
