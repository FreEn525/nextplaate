  /* =====================================================================
   *  APP  (feature registry: a feature declares its ribbon groups, its keys and its Esc behaviour)
   * ===================================================================== */
  // A feature is registered when the script loads, but touches nothing on the page then:
  // mountApp() builds the panel first, and only then runs each feature's init().
  //   registerFeature({
  //     groups:   [{ drawer: 'pair', title: 'Photos', build: () => nodes }], // controls, in a drawer of the bar
  //     keys:     { KeyS: { run: () => true, hint: 'S', hintOrder: 10 } }, // run() returns true when it handled the key
  //     onEscape: () => true, escOrder: 10,                                 // true when it handled Esc (lower runs first)
  //     init:     () => { ... }                                             // wires the controls, once the panel exists
  //   })
  const features = [];
  let keyMap = {};          // e.code -> key spec, from every feature
  let escapeChain = [];     // features with onEscape, in escOrder
  const app = { modal: null }; // { onKey(e) } while a full window owns the keyboard (the batch manager)

  const registerFeature = f => { features.push(f); };

  function mountApp() {
    mountRibbon(features);
    features.forEach(f => f.init && f.init());
    features.forEach(f => Object.assign(keyMap, f.keys || {}));
    escapeChain = [...features.filter(f => f.onEscape), { onEscape: closeDrawer, escOrder: 100 }]   // Esc closes the open drawer last
    .sort((a, b) => (a.escOrder || 0) - (b.escOrder || 0));
    updateHint();
  }
