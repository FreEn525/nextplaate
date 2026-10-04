  /* =====================================================================
   *  RIBBON  (the NextPlaate panel: a vertical bar of icons on the right edge of the page;
   *           an icon opens its drawer, which slides over the page)
   * ===================================================================== */
  // The drawers, in bar order. A feature joins one of them with groups: [{ drawer: 'pair', title, build }].
  const DRAWERS = [
    { id: 'pair', icon: 'photos', title: 'Photo pair', keys: 'S · F' },
    { id: 'gallery', icon: 'gallery', title: 'Gallery', keys: 'L · ◀ ▶' },
    { id: 'upload', icon: 'upload', title: 'Batch upload', keys: 'U · N' },
    { id: 'keys', icon: 'keyboard', title: 'Shortcuts', keys: 'Esc' }
  ];
  const RIBBON_CSS = `
    .side{display:flex;justify-content:flex-end;height:100%;align-items:stretch;pointer-events:none}
    .side>*{pointer-events:auto}
    .rail{width:56px;flex:none;display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 0;background:#fff;border-left:1px solid var(--line2);box-shadow:-6px 0 20px rgba(0,0,0,.08)}
    .rail .logo{margin-bottom:6px}
    .rbtn{width:40px;height:40px;display:grid;place-items:center;border:0;border-radius:6px;background:none;color:var(--mute);cursor:pointer}
    .rbtn:hover{background:var(--tint);color:var(--ink)}
    .rbtn[aria-pressed="true"]{background:var(--brand);color:var(--brand-t)}
    .drawer.passive{pointer-events:none!important;opacity:.82}
    .drawer{width:min(340px,calc(100vw - 56px));display:flex;flex-direction:column;background:var(--bg);border-left:1px solid var(--line2);box-shadow:-10px 0 30px rgba(0,0,0,.14);position:relative}
    .dhead{display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:56px;padding:0 16px;background:#fff;border-bottom:1px solid var(--line)}
    .dhead h2{margin:0;font-size:16px;font-weight:700}
    .dbody{flex:1;min-height:0;overflow-y:auto;padding:12px;display:flex;flex-direction:column}
    .dsec{display:flex;flex-direction:column;gap:10px}
    .group{background:#fff;border:1px solid var(--line);border-radius:4px;display:flex;flex-direction:column;overflow:hidden}
    .gbody{display:flex;flex-direction:column;gap:8px;padding:10px}
    .gtitle{padding:5px 10px;border-top:1px solid var(--line);background:var(--tint);color:var(--mute);font-size:11px;font-weight:600;text-align:center;text-transform:uppercase;letter-spacing:.04em}
    .gbody .btn{width:100%}
    .btnrow{display:flex;gap:8px}
    .btnrow .btn{flex:1}
    .row{display:flex;align-items:center;gap:8px;font-size:12px}
    .row label{font-weight:600;white-space:nowrap}
    .row input{width:90px}
    .field{display:flex;flex-direction:column;gap:4px}
    .field label{font-size:12px;font-weight:600}
    .field input{width:100%}
    .chk{display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer}
    .chk input{width:16px;height:16px;margin:0}
    .slots{display:flex;flex-direction:column;gap:8px}
    .slot{display:flex;align-items:center;gap:8px;min-height:52px;padding:6px 8px;border:1px solid var(--line);border-radius:var(--r);background:#f7f7f7}
    .slot img{width:52px;height:40px;object-fit:cover;border-radius:4px;border:1px solid var(--line);flex:none}
    .slot .t{flex:1;min-width:0;font-size:12px}
    .slot .t small{display:block;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .slot .x{background:none;border:0;font-size:16px;color:var(--mute);cursor:pointer}
    .slot .x:hover{color:var(--ink)}
    .slot.empty{color:var(--mute);border-style:dashed;background:#fff;font-size:12px;justify-content:center}
    .qinfo{font-size:12px;color:var(--mute)}
    .toast{position:absolute;left:50%;transform:translateX(-50%);bottom:16px;width:min(420px,calc(100vw - 32px));box-sizing:border-box;overflow-wrap:anywhere;padding:10px 16px;text-align:center;background:var(--ink);border-radius:6px;box-shadow:0 8px 24px rgba(0,0,0,.35);font-size:14px;line-height:1.4;color:#fff}
    .toast:empty{display:none}
    .toast b{color:#fff;text-decoration:underline;text-decoration-color:var(--brand-b)}
    .kblist{display:flex;flex-direction:column;gap:6px}
    .kbrow{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px}
        .kbright{display:flex;align-items:center;gap:4px}
    .kbkey{width:84px;height:30px;padding:0 8px;border:1px solid var(--line2);border-radius:4px;background:#fff;color:var(--ink);font:700 12px system-ui,sans-serif;cursor:pointer}
    .kbkey:hover{border-color:var(--brand-b);background:var(--tint)}
    .kbkey.static{cursor:default}
    .kbkey.static:hover{border-color:var(--line2);background:#fff}
    .kbspacer{width:26px;flex:none}
    .kbreset{width:26px;height:30px;border:0;background:none;color:var(--mute);cursor:pointer;font-size:14px}
    .kbreset:hover{color:var(--ink)}
    .kbreset.off{visibility:hidden}
    @media (max-width:520px){ .drawer{width:calc(100vw - 56px)} .rail{width:48px} }
  `;

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
      <nav class="rail" id="rail"><div class="logo">${LOGO(28)}</div></nav>
    </div>
    <div class="toast" id="status"></div>`;
  document.body.appendChild(host);
  const $ = id => root.getElementById(id);
  let openId = null;

  // One icon per drawer that has features, one section per drawer; each feature group is a box with its title under it
  function mountRibbon(list) {
    const byDrawer = {};
    list.forEach(f => (f.groups || []).forEach(g => { (byDrawer[g.drawer] = byDrawer[g.drawer] || []).push(g); }));
    DRAWERS.filter(d => byDrawer[d.id]).forEach(d => {
      const btn = h('button', { class: 'rbtn', 'data-drawer': d.id, title: `${d.title} (${d.keys})`, onclick: () => openDrawer(d.id) });
      btn.innerHTML = icon(d.icon);   // our own SVG constants, never user data
      $('rail').append(btn);
      $('dbody').append(h('section', { class: 'dsec', 'data-drawer': d.id, hidden: true },
        byDrawer[d.id].map(g => h('div', { class: 'group' },
          h('div', { class: 'gbody' }, g.build()),
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

