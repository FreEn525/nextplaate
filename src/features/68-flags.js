  /* =====================================================================
   *  COUNTRY FLAGS  (one click to the upload page of a country)
   *    The flags of the 96 countries with their names, each a link to /<country>/add, and a box to find one by name or code.
   *    Two places:
   *      - the panel (Batch upload drawer): all the countries;
   *      - on the upload pages (/add and /<country>/add) and on a member's profile (/user<id>), right on the site, to the right of
   *        the page content: the countries the
   *        user chose in Settings (all by default). Where the screen has room beside the content the bar stands there, wide enough
   *        for the flags but never under the panel, even with its drawer open (the rail and the drawer take 56 px + 340 px of the
   *        right edge); on a narrower screen it moves under the photo, in the right-hand column, and the page is not widened.
   *    The choice is the setting flags_chosen: 'all', or the codes separated by commas (an empty value is no country).
   *    The flags are the site's own images (/assets/img/profile-flags/<code>.svg): nothing is downloaded from elsewhere.
   * ===================================================================== */
  const flagUrl = code => `/assets/img/profile-flags/${code}.svg`;
  settings.define('flags_chosen', 'all', 'Countries on the side bar', 'flags');

  // The countries of the side bar: a Set of codes, or null for all of them
  function flagsChosen() {
    const v = settings.get('flags_chosen');
    return v === 'all' ? null : new Set(v.split(',').filter(Boolean));
  }

  // The flags as links, each with the name of its country; the country of the page is marked. only: a Set of codes to keep, or null.
  // An image that fails shows the code instead.
  function flagLinks(only) {
    return h('nav', { class: 'flags' }, COUNTRIES.filter(c => !only || only.has(c.code)).map(c => {
      const img = h('img', { src: flagUrl(c.code), alt: '', width: 22, height: 15, loading: 'lazy' });
      img.addEventListener('error', () => img.replaceWith(h('span', { class: 'flagcode', text: c.code.toUpperCase() })));
      return h('a', { class: 'flag' + (c.code === here.country ? ' on' : ''), href: `/${c.code}/add`, title: c.name, 'data-find': (c.name + ' ' + c.code).toLowerCase() },
        img, h('span', { class: 'fname', text: c.name }));
    }));
  }

  // The flags with a box to find a country by its name or its code (96 of them: a name is faster than looking for a flag). With few
  // countries the box is not needed.
  const FLAGS_FIND_FROM = 13;
  function flagBlock(only) {
    const list = flagLinks(only);
    const many = list.children.length >= FLAGS_FIND_FROM;
    const find = h('input', { type: 'text', placeholder: 'Find a country…', hidden: !many });
    find.addEventListener('input', () => {
      const q = find.value.trim().toLowerCase();
      list.querySelectorAll('a.flag').forEach(a => { a.hidden = !!q && !a.dataset.find.includes(q); });
    });
    const none = only && !only.size ? h('p', { class: 'presult', text: 'No country chosen. Choose some in Settings, Country flags.' }) : null;
    return h('div', { class: 'flagblock' }, find, none, list);
  }

  // ---- the bar on the page
  const FLAGS_GAP = 16;          // space between the content and the bar, and between the bar and the panel
  const FLAGS_MIN = 150;         // narrower than this, the bar goes under the photo
  const FLAGS_MAX = 320;
  const FLAGS_CSS = `
    :host{display:block}
    .box{background:#fff;border:1px solid var(--line);padding:10px;display:flex;flex-direction:column;gap:8px}
    .t{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--primary-h)}
    .flags{max-height:70vh;overflow-y:auto}
    .dtab{display:none}
    :host(.dock){pointer-events:none}                                           /* the docked bar is a box of 340 px, mostly empty: only its tab and its open list take the mouse, or it would cover what lies under it (the last photos of a profile) */
    :host(.dock) .dtab,:host(.dock) .box{pointer-events:auto}
    /* no room beside the content: a tab at the right edge, next to the panel, that opens the same box (the same place on every screen) */
    :host(.dock) .dtab{display:flex;align-items:center;gap:8px;margin-left:auto;height:var(--h);padding:0 12px;border:1px solid var(--line2);background:#fff;color:var(--primary-h);font:inherit;font-size:13px;font-weight:600;cursor:pointer;box-shadow:-2px 2px 10px rgba(0,0,0,.12)}
    :host(.dock) .dtab:hover{background:var(--primary-tint);border-color:var(--primary)}
    :host(.dock) .box{display:none;margin-top:6px;box-shadow:-2px 4px 18px rgba(0,0,0,.18)}
    :host(.dock.open) .box{display:flex}
  `;
  const flagsBarContent = () => [h('div', { class: 't', text: 'Add a photo in…' }), flagBlock(flagsChosen())];

  function flagsDockToggle(open) {
    const host = document.getElementById('pmg-flags');
    if (!host) return false;
    const was = host.classList.contains('open');
    host.classList.toggle('open', open === undefined ? !was : open);
    host.shadowRoot.querySelector('.dtab').setAttribute('aria-expanded', String(host.classList.contains('open')));
    return was;
  }

  function flagsBar() {
    const host = h('div', { id: 'pmg-flags' });
    const root = host.attachShadow({ mode: 'open' });
    const tab = h('button', { type: 'button', class: 'dtab', 'aria-expanded': 'false', onclick: () => flagsDockToggle() });
    tab.innerHTML = icon('upload');                                          // our own SVG constant
    tab.append(h('span', { text: 'Add a photo in…' }));
    root.append(h('style', { text: UI_BASE + FLAGS_CSS }), tab, h('div', { class: 'box' }, flagsBarContent()));
    // a click elsewhere closes the open tab
    document.addEventListener('click', e => { if (host.classList.contains('open') && !e.composedPath().includes(host)) flagsDockToggle(false); });
    return host;
  }

  // The choice changed in Settings: the bar follows at once
  function flagsRefresh() {
    const host = document.getElementById('pmg-flags');
    if (host) host.shadowRoot.querySelector('.box').replaceChildren(...flagsBarContent());
  }

  // Beside the content when there is room for it, else a tab at the right edge, next to the panel (the same place whatever the screen,
  // the profile and the upload pages alike). Called at start, on resize, when the page has loaded and when a drawer opens or closes
  // (the drawer takes 340 px of the right edge, the rail 56 px).
  function flagsPlace() {
    const host = document.getElementById('pmg-flags');
    if (!host) return;
    const content = document.querySelector('.content .container, .container.content') || document.querySelector('.container');
    const vw = document.documentElement.clientWidth;
    const panel = 56 + (openId ? Math.min(340, vw - 56) : 0);
    const right = content ? content.getBoundingClientRect().right : vw;
    const room = vw - panel - right - 2 * FLAGS_GAP;
    if (host.parentNode !== document.body) document.body.appendChild(host);
    if (room >= FLAGS_MIN) {
      const photo = (document.getElementById('zoomimgid') || {}).parentElement;
      const top = (photo || content || document.body).getBoundingClientRect().top + window.scrollY;
      host.classList.remove('dock', 'open');
      host.style.cssText = `position:absolute;z-index:50;top:${Math.max(0, top)}px;left:${right + window.scrollX + FLAGS_GAP}px;width:${Math.min(room, FLAGS_MAX)}px`;
    } else {
      host.classList.add('dock');
      const header = document.querySelector('.header');                          // the handle lies under the site's header, and follows it away when the page scrolls
      const top = Math.max(8, Math.round(header ? header.getBoundingClientRect().bottom : 88) + 8);
      host.style.cssText = `position:fixed;z-index:50;top:${top}px;right:${panel + 8}px;width:min(${FLAGS_MAX + 20}px,calc(100vw - ${panel + 24}px))`;
    }
  }

  // ---- the choice, in Settings: a box per country, applied at once to the bar
  function flagsPicker() {
    const state = new Set(flagsChosen() || COUNTRIES.map(c => c.code));
    const count = h('p', { class: 'presult' });
    const boxes = [];
    const save = () => {
      settings.set('flags_chosen', state.size === COUNTRIES.length ? 'all' : [...state].join(','));
      count.textContent = state.size === COUNTRIES.length ? 'All the countries are on the side bar.' : `${state.size} of ${COUNTRIES.length} countries are on the side bar.`;
      flagsRefresh();
    };
    const rows = COUNTRIES.map(c => {
      const box = h('input', { type: 'checkbox', checked: state.has(c.code), id: 'flag_' + c.code });
      box.onchange = () => { box.checked ? state.add(c.code) : state.delete(c.code); save(); };
      boxes.push(box);
      return h('label', { class: 'chk', 'data-find': (c.name + ' ' + c.code).toLowerCase() }, box, h('img', { src: flagUrl(c.code), alt: '', width: 22, height: 15, loading: 'lazy' }), c.name);
    });
    const setAll = on => { state.clear(); if (on) COUNTRIES.forEach(c => state.add(c.code)); boxes.forEach(b => { b.checked = on; }); save(); };
    const find = h('input', { type: 'text', placeholder: 'Find a country…' });
    find.addEventListener('input', () => {
      const q = find.value.trim().toLowerCase();
      rows.forEach(r => { r.hidden = !!q && !r.dataset.find.includes(q); });
    });
    save();
    return h('div', { class: 'flagpick' }, count,
      h('div', { class: 'btnrow' }, h('button', { class: 'btn ghost sm', text: 'All', onclick: () => setAll(true) }), h('button', { class: 'btn ghost sm', text: 'None', onclick: () => setAll(false) })),
      find, h('div', { class: 'pickrows' }, rows));
  }

  registerFeature({
    id: 'flags', label: 'Country flags',
    onEscape: () => flagsDockToggle(false), escOrder: 40,                      // Esc closes the open tab (true only if it was open)
    groups: [{
      drawer: 'upload', title: 'Add a photo in a country', about: "Choose the country of the photo you are about to send.", lazy: true,
      build: () => [h('p', { class: 'presult', text: 'Click a country to open its upload page.' }), flagBlock(null)]
    }, {
      drawer: 'settings', rank: 80, fold: 'closed', title: 'Country flags: the side bar', lazy: true,
      build: () => [h('p', { class: 'presult', text: 'Choose the countries shown on the side of the upload pages. The panel always lists all of them.' }), flagsPicker()]
    }],
    init: () => {
      if (here.addAny && !here.add && countryPageCard()) return;          // /add: the card of large flags replaces the site's box, no side bar
      if (!here.addAny && !here.profile) return;
      // the bar of 96 flags is built when the browser is idle (the page and the panel come first), and placed at once
      (window.requestIdleCallback || (f => setTimeout(f, 30)))(() => { if (!document.getElementById('pmg-flags')) document.body.appendChild(flagsBar()); flagsPlace(); }, { timeout: 300 });
      let queued = false;
      const later = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; flagsPlace(); }); };       // one placement per frame, however many scroll events
      window.addEventListener('resize', later);
      window.addEventListener('scroll', later, { passive: true });
      window.addEventListener('load', flagsPlace);
      window.addEventListener('pmg-drawer', flagsPlace);                       // a drawer opened or closed: the room changed
    }
  });
