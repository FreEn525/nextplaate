  /* =====================================================================
   *  RIBBON  (the NextPlaate panel: a vertical bar of icons on the right edge of the page;
   *           an icon opens its drawer, which slides over the page)
   * ===================================================================== */
  // The drawers, in bar order. A feature joins one of them with groups: [{ drawer: 'pair', title, build, rank }]; rank (default 50) puts a box higher (small) or lower (large) in its drawer.
  const DRAWERS = [
    // In the order of use: check what you are about to send, send it, describe the pair, browse. The ids stay (keys, tests, memory).
    // keys: the actions of the drawer, whose current keys the tooltip tells (they follow what the user chose in Shortcuts)
    { id: 'search', icon: 'search', title: 'Check a plate', keys: [] },       // the plate check, Google Lens and the lookups
    { id: 'upload', icon: 'upload', title: 'Send photos', keys: ['open', 'start'] },     // a photo in a country, the batch upload
    { id: 'pair', icon: 'photos', title: 'Describe a pair', keys: ['select', 'fill'] },   // front and rear photo, details, description, automation
    { id: 'gallery', icon: 'gallery', title: 'Browse', keys: ['prev', 'next', 'worldmap'] },      // pages, members, the world map
    { id: 'keys', icon: 'keyboard', title: 'Shortcuts', keys: ['Esc'] },
    { id: 'settings', icon: 'settings', title: 'Settings', keys: [] },
    { id: 'dev', icon: 'wrench', title: 'Developer', keys: [] }        // shown only when the dev tools are built in
  ];

  const host = document.createElement('div');
  host.id = 'pmg-host';
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;';   // covers the window but lets clicks through, except on the bar and the drawer
  const root = host.attachShadow({ mode: 'open' });   // shadow DOM: the site's CSS cannot reach the panel
  root.innerHTML = `
    <style>${UI_BASE}${RIBBON_CSS}</style>
    <div class="side" id="side">
      <aside class="drawer" id="drawer" hidden>
        <header class="dhead"><h2 id="dtitle"></h2><button class="iconbtn" id="dclose" title="Close (Esc)">${icon('close')}</button></header>
        <div class="dbody" id="dbody"></div>
      </aside>
      <nav class="rail" id="rail"><button class="logo" id="logo" title="NextPlaate: check for an update" aria-label="NextPlaate: check for an update">${LOGO(36)}<span class="sdot" id="sdot" data-level="unknown"></span></button></nav>
    </div>
    <div class="toast" id="status"></div>`;
  document.body.appendChild(host);
  const $ = id => root.getElementById(id);
  let openId = null;

  // Names of the pages a group works on (here.gallery, here.photo, here.edit, here.add)
  const PAGE_NAMES = { gallery: 'a gallery', photo: 'a photo', edit: 'the edit', add: 'the upload' };
  function pageNote(g) {
    if (!g.pages || g.pages.some(p => here[p])) return null;
    return h('p', { class: 'pnote', text: 'Works on ' + g.pages.map(p => PAGE_NAMES[p]).join(' or ') + ' page.' });
  }

  // "Describe a pair (S · F)": the keys are those in force now
  const drawerTitle = d => {
    const keys = d.keys.map(k => (actions[k] ? keyOf(k) : k)).filter(Boolean);
    return keys.length ? `${d.title} (${keys.join(' · ')})` : d.title;
  };
  window.addEventListener('pmg-keys', () => root.querySelectorAll('.rbtn').forEach(b => { const d = DRAWERS.find(x => x.id === b.dataset.drawer); if (d) b.title = drawerTitle(d); }));

  const lazyGroups = [];       // { drawer, g, body } of the groups not built yet
  function buildLazy(drawerId) {
    for (let i = lazyGroups.length - 1; i >= 0; i--) {
      if (lazyGroups[i].drawer !== drawerId) continue;
      const { g, body } = lazyGroups.splice(i, 1)[0];
      body.append(...[].concat(g.build()).filter(Boolean));
    }
  }

  // One icon per drawer that has features, one section per drawer; each feature group is a box with its title under it
  function mountRibbon(list) {
    const byDrawer = {};
    list.forEach(f => (f.groups || []).forEach(g => { (byDrawer[g.drawer] = byDrawer[g.drawer] || []).push(g); }));
    DRAWERS.filter(d => byDrawer[d.id]).forEach(d => {
      const btn = h('button', { class: 'rbtn', 'data-drawer': d.id, title: drawerTitle(d), onclick: () => openDrawer(d.id) });
      btn.innerHTML = icon(d.icon);   // our own SVG constants, never user data
      // settings (the Shortcuts drawer) sit at the bottom, apart from the working tools
      if (d.id === 'keys') $('rail').append(h('div', { class: 'rsep' }));
      $('rail').append(btn);
      $('dbody').append(h('section', { class: 'dsec', 'data-drawer': d.id, hidden: true },
        byDrawer[d.id].slice().sort((a, b) => (a.rank || 50) - (b.rank || 50)).map(g => {
          // a group with lazy: true is built when its drawer is first opened (long lists nobody sees until then: no cost at page load)
          const body = h('div', { class: 'gbody' + (pageNote(g) ? ' idle' : '') }, g.about ? h('p', { class: 'gabout', text: g.about }) : null, pageNote(g));
          if (g.lazy) lazyGroups.push({ drawer: d.id, g, body }); else body.append(...[].concat(g.build()).filter(Boolean));
          if (!g.fold) return h('div', { class: 'group' }, body, h('div', { class: 'gtitle', text: g.title }));
          // fold: 'closed' | 'open': the title is a button that folds the box; the choice is kept (a long list nobody needs open all the time)
          const key = 'fold_' + g.title, group = h('div', { class: 'group foldable' });
          const title = h('button', { type: 'button', class: 'gtitle', 'aria-expanded': 'true', text: g.title });
          const set = closed => { group.classList.toggle('closed', closed); title.setAttribute('aria-expanded', String(!closed)); };
          set(store.get(key, g.fold === 'closed' ? '1' : '0') === '1');
          title.onclick = () => { const closed = !group.classList.contains('closed'); set(closed); store.set(key, closed ? '1' : '0'); };
          group.append(body, title);
          return group;
        })));
    });
    // the version, at the foot of the rail (the dev build says so); a click opens the update window like the logo does (91-update.js)
    $('rail').append(h('button', { type: 'button', class: 'rver', id: 'rver', title: `NextPlaate ${SCRIPT_VERSION}: click to check for an update`, 'aria-label': `NextPlaate version ${SCRIPT_VERSION}: check for an update` },
      SCRIPT_VERSION, '__DEBUG__' === '1' ? h('small', { text: 'dev' }) : null));
    $('dclose').onclick = () => closeDrawer();
    // the dot on the logo: how the site is doing, from what the script already sees (src/lib/http.js); the pause counts down by itself
    const siteDot = () => { const s = siteHealth(); $('sdot').dataset.level = s.level; $('logo').title = 'NextPlaate: check for an update' + String.fromCharCode(10) + s.text; };
    window.addEventListener('pmg-site', siteDot);
    setInterval(siteDot, 30000);
    siteDot();
    // the drawer that was open stays open after a reload or a page change
    const last = store.get('drawer', '');
    if (byDrawer[last]) openDrawer(last);
  }

  // Only one drawer is open at a time. It stays open until its X or another icon is clicked
  function openDrawer(id) {
    if (id === openId) return;
    openId = id;
    buildLazy(id);
    root.querySelectorAll('.rbtn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.drawer === openId)));
    root.querySelectorAll('.dsec').forEach(s => { s.hidden = s.dataset.drawer !== openId; });
    $('drawer').hidden = !openId;
    $('dtitle').textContent = openId ? DRAWERS.find(d => d.id === openId).title : '';
    store.set('drawer', openId || '');
    window.dispatchEvent(new Event('pmg-drawer'));
  }
  function closeDrawer() {
    openId = null; store.set('drawer', '');
    root.querySelectorAll('.rbtn').forEach(b => b.setAttribute('aria-pressed', 'false'));
    root.querySelectorAll('.dsec').forEach(s => { s.hidden = true; });
    window.dispatchEvent(new Event('pmg-drawer'));
    $('drawer').hidden = true;
  }
  // While a selection runs, the drawer stays visible but lets clicks reach the site
  function setPassive(on) { $('drawer').classList.toggle('passive', on); }

  // Shows a message at the bottom of the window. It goes away by itself after a few seconds (ms = 0: it stays)
  let statusTimer = null;
  function setStatus(html, ms = 6000) {
    clearTimeout(statusTimer);
    $('status').innerHTML = html;
    if (ms) statusTimer = setTimeout(() => { $('status').innerHTML = ''; }, ms);
  }

