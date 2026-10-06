  /* =====================================================================
   *  ABOUT  (Settings drawer: who made it, which version, what is new)
   *    The "What's new" window opens by itself once after an update to a new minor version (not on a first install: the script has
   *    just been chosen; not after a fix such as 5.9 -> 5.9.1),
   *    and any time from the button in Settings. It reads WHATS_NEW (src/lib/whatsnew.js).
   * ===================================================================== */
  const SCRIPT_VERSION = '__VERSION__';

  function whatsNewBody(entry) {
    return h('div', { class: 'cardbox' }, h('p', { class: 'hint', text: entry.title }), entry.sections.map(s =>
      h('div', { class: 'wn-section' }, h('div', { class: 'cat', text: s.title }),
        s.items.map(i => h('p', { class: 'wn-item' }, h('b', { text: i.title + ': ' }), h('span', { text: i.text }))))));
  }

  function whatsNewOpen() {
    const entry = WHATS_NEW[0];
    if (!entry) return;
    const modal = modalOpen({ id: 'pmg-whatsnew', title: `What’s new in ${entry.version}`, body: whatsNewBody(entry),
      actions: [{ label: 'Got it', run: () => modal.close() }] });
    modal.message(`NextPlaate by ${AUTHOR.name}`);
  }

  // After an update: show it once, then remember the version. A first install only remembers it.
  function whatsNewOnUpdate() {
    if (window.top !== window) return;                                       // not inside a frame of the site
    const seen = store.get('seen_version', '');
    if (seen === SCRIPT_VERSION) return;
    store.set('seen_version', SCRIPT_VERSION);
    // only a new minor version (5.9 -> 5.10) opens the window: a fix (5.9 -> 5.9.1) is silent
    const minor = v => String(v).split('.').slice(0, 2).join('.');
    if (seen && minor(seen) !== minor(SCRIPT_VERSION) && WHATS_NEW[0] && WHATS_NEW[0].version === minor(SCRIPT_VERSION)) whatsNewOpen();
  }

  registerFeature({
    groups: [{
      drawer: 'settings', title: 'About',
      build: () => [
        h('p', { class: 'presult' }, `NextPlaate ${SCRIPT_VERSION} © 2026 `, h('a', { href: AUTHOR.profile, target: '_blank', rel: 'noopener noreferrer', text: AUTHOR.name })),
        h('button', { id: 'aboutNew', type: 'button', class: 'btn ghost', text: 'What’s new' })
      ]
    }],
    init: () => { $('aboutNew').onclick = whatsNewOpen; whatsNewOnUpdate(); }
  });
