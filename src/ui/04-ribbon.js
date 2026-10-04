  /* =====================================================================
   *  RIBBON  (the NextPlaate panel: a vertical bar of icons on the right edge of the page;
   *           an icon opens its drawer, which slides over the page)
   * ===================================================================== */
  // The drawers, in bar order. A feature joins one of them with groups: [{ drawer: 'pair', title, build }].
  const DRAWERS = [
    { id: 'pair', icon: 'photos', title: 'Photos', keys: 'S' },
    { id: 'post', icon: 'post', title: 'Post', keys: 'F' },
    { id: 'likes', icon: 'likes', title: 'Likes', keys: 'L · ◀ ▶' },
    { id: 'upload', icon: 'upload', title: 'Batch upload', keys: 'U · N' }
  ];
  const RIBBON_CSS = `
    .side{display:flex;height:100%;align-items:stretch}
    .rail{width:56px;flex:none;display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 0;background:#fff;border-left:1px solid var(--line2);box-shadow:-6px 0 20px rgba(0,0,0,.08)}
    .rail .logo{margin-bottom:6px}
    .rbtn{width:40px;height:40px;display:grid;place-items:center;border:0;border-radius:6px;background:none;color:var(--mute);cursor:pointer}
    .rbtn:hover{background:var(--tint);color:var(--ink)}
    .rbtn[aria-pressed="true"]{background:var(--brand);color:var(--brand-t)}
    .drawer{width:340px;display:flex;flex-direction:column;background:var(--bg);border-left:1px solid var(--line2);box-shadow:-10px 0 30px rgba(0,0,0,.14);position:relative}
    .dhead{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#fff;border-top:3px solid var(--brand-b);border-bottom:1px solid var(--line)}
    .dhead h2{margin:0;font-size:15px;font-weight:700}
    .xbtn{width:28px;height:28px;display:grid;place-items:center;border:1px solid var(--line2);border-radius:4px;background:#fff;color:var(--mute);cursor:pointer}
    .xbtn:hover{background:var(--tint);color:var(--ink)}
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
    .dfoot{padding:8px 14px;background:#fff;border-top:1px solid var(--line)}
    .hint{font-size:11px;color:var(--mute)}
    .toast{position:absolute;right:68px;bottom:44px;max-width:300px;padding:8px 10px;background:#fff;border:1px solid var(--line2);border-radius:4px;box-shadow:0 6px 20px rgba(0,0,0,.15);font-size:13px;color:var(--ink)}
    .toast:empty{display:none}
    .toast b{color:var(--ink)}
  `;

  const host = document.createElement('div');
  host.id = 'pmg-host';
  host.style.cssText = 'position:fixed;top:0;right:0;bottom:0;z-index:2147483647;';   // full height, on the right edge
  const root = host.attachShadow({ mode: 'open' });   // shadow DOM: the site's CSS cannot reach the panel
  root.innerHTML = `
    <style>${UI_BASE}${RIBBON_CSS}</style>
    <div class="side" id="side">
      <aside class="drawer" id="drawer" hidden>
        <header class="dhead"><h2 id="dtitle"></h2><button class="xbtn" id="dclose" title="Close (Esc)">${icon('close')}</button></header>
        <div class="dbody" id="dbody"></div>
        <div class="dfoot"><small class="hint" id="hint"></small></div>
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
  }

  // Clicking the open icon closes its drawer; only one drawer is open at a time
  function openDrawer(id) {
    openId = id === openId ? null : id;
    root.querySelectorAll('.rbtn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.drawer === openId)));
    root.querySelectorAll('.dsec').forEach(s => { s.hidden = s.dataset.drawer !== openId; });
    $('drawer').hidden = !openId;
    $('dtitle').textContent = openId ? DRAWERS.find(d => d.id === openId).title : '';
  }
  function closeDrawer() {
    if (!openId) return false;
    openDrawer(openId);
    return true;
  }

  function setStatus(html) { $('status').innerHTML = html; }

  // "Keys: S · F · L · U · N · R · Q ◀ ▶ D · Esc", built from the keys the features declared
  function updateHint() {
    const parts = Object.values(keyMap).filter(k => k.hint)
      .sort((a, b) => (a.hintOrder || 0) - (b.hintOrder || 0))
      .map(k => (typeof k.hint === 'function' ? k.hint() : k.hint));
    $('hint').textContent = 'Keys: ' + [...parts, 'Esc'].join(' · ');
  }
