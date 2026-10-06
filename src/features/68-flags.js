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
  `;
  const flagsBarContent = () => [h('div', { class: 't', text: 'Add a photo in…' }), flagBlock(flagsChosen())];

  function flagsBar() {
    const host = h('div', { id: 'pmg-flags' });
    const root = host.attachShadow({ mode: 'open' });
    root.append(h('style', { text: UI_BASE + FLAGS_CSS }), h('div', { class: 'box' }, flagsBarContent()));
    return host;
  }

  // The choice changed in Settings: the bar follows at once
  function flagsRefresh() {
    const host = document.getElementById('pmg-flags');
    if (host) host.shadowRoot.querySelector('.box').replaceChildren(...flagsBarContent());
  }

  // Beside the content when there is room for it, else under the photo. Called at start, on resize and when the page has loaded.
  function flagsPlace() {
    const host = document.getElementById('pmg-flags');
    if (!host) return;
    const content = document.querySelector('.content .container, .container.content') || document.querySelector('.container');
    const vw = document.documentElement.clientWidth;
    const panel = 56 + Math.min(340, vw - 56);                       // the rail, and the drawer when it is open
    const right = content ? content.getBoundingClientRect().right : vw;
    const room = vw - panel - right - 2 * FLAGS_GAP;
    const photo = (document.getElementById('zoomimgid') || {}).parentElement;
    if (room >= FLAGS_MIN) {
      const top = (photo || content || document.body).getBoundingClientRect().top + window.scrollY;
      if (host.parentNode !== document.body) document.body.appendChild(host);
      host.style.cssText = `position:absolute;z-index:50;top:${Math.max(0, top)}px;left:${right + window.scrollX + FLAGS_GAP}px;width:${Math.min(room, FLAGS_MAX)}px`;
    } else {
      const after = document.getElementById('informer-preview-wrap') || document.getElementById('zoomimgid');
      const side = here.profile && content && content.querySelector('.col-md-3');      // a profile: under the avatar, in the left column
      host.style.cssText = 'position:static;margin-top:10px';
      if (after) after.parentNode.insertBefore(host, after.nextSibling);
      else if (side) side.appendChild(host);
      else if (content) content.insertBefore(host, content.firstChild);
      else document.body.appendChild(host);
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
    groups: [{
      drawer: 'upload', title: 'Add a photo in a country', about: "Choose the country of the photo you are about to send.", lazy: true,
      build: () => [h('p', { class: 'presult', text: 'Click a country to open its upload page.' }), flagBlock(null)]
    }, {
      drawer: 'settings', title: 'Country flags: the side bar', lazy: true,
      build: () => [h('p', { class: 'presult', text: 'Choose the countries shown on the side of the upload pages. The panel always lists all of them.' }), flagsPicker()]
    }],
    init: () => {
      if (!here.addAny && !here.profile) return;
      document.body.appendChild(flagsBar());
      flagsPlace();
      window.addEventListener('resize', flagsPlace);
      window.addEventListener('load', flagsPlace);
    }
  });
