  /* =====================================================================
   *  RIBBON  (the NextPlaate panel: a vertical bar of icons on the right edge of the page;
   *           an icon opens its drawer, which slides over the page)
   * ===================================================================== */
  // The drawers, in bar order. A feature joins one of them with groups: [{ drawer: 'pair', title, build }].
  const DRAWERS = [
    // In the order of use: check what you are about to send, send it, describe the pair, browse. The ids stay (keys, tests, memory).
    { id: 'search', icon: 'search', title: 'Check a plate', keys: '' },       // the plate check, Google Lens and the lookups
    { id: 'upload', icon: 'upload', title: 'Send photos', keys: 'U · N' },     // a photo in a country, the batch upload
    { id: 'pair', icon: 'photos', title: 'Describe a pair', keys: 'S · F' },   // front and rear photo, details, description, automation
    { id: 'gallery', icon: 'gallery', title: 'Browse', keys: 'L · ◀ ▶' },      // likes, pages, members
    { id: 'keys', icon: 'keyboard', title: 'Shortcuts', keys: 'Esc' },
    { id: 'settings', icon: 'settings', title: 'Settings', keys: '' },
    { id: 'dev', icon: 'wrench', title: 'Developer', keys: '' }        // shown only when the dev tools are built in
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
      <nav class="rail" id="rail"><div class="logo">${LOGO(36)}</div></nav>
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

  // One icon per drawer that has features, one section per drawer; each feature group is a box with its title under it
  function mountRibbon(list) {
    const byDrawer = {};
    list.forEach(f => (f.groups || []).forEach(g => { (byDrawer[g.drawer] = byDrawer[g.drawer] || []).push(g); }));
    DRAWERS.filter(d => byDrawer[d.id]).forEach(d => {
      const btn = h('button', { class: 'rbtn', 'data-drawer': d.id, title: d.keys ? `${d.title} (${d.keys})` : d.title, onclick: () => openDrawer(d.id) });
      btn.innerHTML = icon(d.icon);   // our own SVG constants, never user data
      // settings (the Shortcuts drawer) sit at the bottom, apart from the working tools
      if (d.id === 'keys') $('rail').append(h('div', { class: 'rsep' }));
      $('rail').append(btn);
      $('dbody').append(h('section', { class: 'dsec', 'data-drawer': d.id, hidden: true },
        byDrawer[d.id].map(g => h('div', { class: 'group' },
          h('div', { class: 'gbody' }, g.about ? h('p', { class: 'gabout', text: g.about }) : null, pageNote(g), g.build()),
          h('div', { class: 'gtitle', text: g.title })))));
    });
    $('dclose').onclick = () => closeDrawer();
    // the drawer that was open stays open after a reload or a page change
    const last = store.get('drawer', '');
    if (byDrawer[last]) openDrawer(last);
  }

  // Only one drawer is open at a time. It stays open until its X or another icon is clicked
  function openDrawer(id) {
    if (id === openId) return;
    openId = id;
    root.querySelectorAll('.rbtn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.drawer === openId)));
    root.querySelectorAll('.dsec').forEach(s => { s.hidden = s.dataset.drawer !== openId; });
    $('drawer').hidden = !openId;
    $('dtitle').textContent = openId ? DRAWERS.find(d => d.id === openId).title : '';
    store.set('drawer', openId || '');
  }
  function closeDrawer() {
    openId = null; store.set('drawer', '');
    root.querySelectorAll('.rbtn').forEach(b => b.setAttribute('aria-pressed', 'false'));
    root.querySelectorAll('.dsec').forEach(s => { s.hidden = true; });
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

