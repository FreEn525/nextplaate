  /* =====================================================================
   *  ABOUT  (Settings drawer: who made it, which version, what is new)
   *    The "What's new" window opens by itself once after an update to a new minor version (not on a first install: the script has
   *    just been chosen; not after a fix such as 5.9 -> 5.9.1),
   *    and any time from the button in Settings. It reads WHATS_NEW (src/lib/whatsnew.js).
   * ===================================================================== */
  const SCRIPT_VERSION = '__VERSION__';

  // One block per version: its title, then its sections. Several versions are stacked, the newest first.
  function whatsNewBody(entries) {
    return h('div', { class: 'cardbox' }, entries.map(entry => h('div', null,
      h('p', { class: 'hint', text: (entries.length > 1 ? entry.version + ' · ' : '') + entry.title }),
      entry.sections.map(s => h('div', { class: 'wn-section' }, h('div', { class: 'cat', text: s.title }),
        s.items.map(i => h('p', { class: 'wn-item' }, h('b', { text: i.title + ': ' }), h('span', { text: i.text }))))))));
  }

  // "5.9.1" -> [5, 9]: a fix does not count as news
  const minorOf = v => String(v).split('.').slice(0, 2).map(n => +n || 0);
  const newerMinor = (a, b) => a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);

  // The entries newer than the version last seen (the newest alone when there is none)
  function whatsNewSince(seen) {
    if (!seen) return WHATS_NEW.slice(0, 1);
    return WHATS_NEW.filter(e => newerMinor(minorOf(e.version), minorOf(seen)));
  }

  function whatsNewOpen(seen) {
    const entries = whatsNewSince(seen);
    if (!entries.length) return;
    const modal = modalOpen({ id: 'pmg-whatsnew', title: `What’s new in ${entries[0].version}`, body: whatsNewBody(entries),
      actions: [{ label: 'Got it', run: () => modal.close() }] });
    modal.message(`NextPlaate by ${AUTHOR.name}`);
  }

  // After an update: show it once, then remember the version. A first install only remembers it.
  function whatsNewOnUpdate() {
    if (window.top !== window) return;                                       // not inside a frame of the site
    const seen = store.get('seen_version', '');
    if (seen === SCRIPT_VERSION) return;
    store.set('seen_version', SCRIPT_VERSION);
    // only a newer minor version (5.9 -> 5.10) opens the window, with everything since the version last seen: a fix (5.9 -> 5.9.1) is silent
    if (seen && newerMinor(minorOf(SCRIPT_VERSION), minorOf(seen))) whatsNewOpen(seen);
  }

  registerFeature({
    groups: [{
      drawer: 'settings', rank: 99, title: 'About',
      build: () => [
        h('p', { class: 'presult' }, `NextPlaate ${SCRIPT_VERSION} © 2026 `, h('a', { href: AUTHOR.profile, target: '_blank', rel: 'noopener noreferrer', text: AUTHOR.name })),
        h('button', { id: 'aboutNew', type: 'button', class: 'btn ghost', text: 'What’s new' }),
        h('button', { id: 'siteCheck', type: 'button', class: 'btn ghost', text: 'Check the site now' }),
        h('p', { id: 'siteSaid', class: 'presult', hidden: true })
      ]
    }],
    init: () => {
      $('aboutNew').onclick = () => whatsNewOpen('');
      // one small request, on demand only (a robots.txt: a few bytes), through the shared queue; the dot on the logo follows
      $('siteCheck').onclick = async () => {
        const said = $('siteSaid'), began = performance.now();
        said.hidden = false;
        said.textContent = 'Asking the site…';
        try { await siteFetch('/robots.txt'); said.textContent = siteHealth().text.replace(/^The site /, 'The site answered; it ') + ` (this request: ${Math.round(performance.now() - began)} ms)`; }
        catch (e) { said.textContent = 'The site did not answer: ' + e.message + '.'; }
      };
      whatsNewOnUpdate();
    }
  });
