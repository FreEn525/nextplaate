  /* =====================================================================
   *  RIBBON  (the NextPlaate panel: docked to the right edge of the page, tabs and groups like Word's ribbon)
   * ===================================================================== */
  // Tabs appear in this order; a tab not listed here goes last.
  const TAB_ORDER = ['Pair', 'Post', 'Likes', 'Upload'];
  const RIBBON_CSS = `
    .rb{display:flex;flex-direction:column;width:360px;height:100%;background:var(--bg);border-left:1px solid var(--line2);box-shadow:-10px 0 30px rgba(0,0,0,.14)}
    .rb.min .tabs,.rb.min .body,.rb.min .foot{display:none}
    .top{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#fff;border-top:3px solid var(--brand-b);border-bottom:1px solid var(--line)}
    .min-btn{width:28px;height:28px;border:1px solid var(--line2);border-radius:4px;background:#fff;color:var(--mute);font-size:16px;line-height:1;cursor:pointer}
    .min-btn:hover{background:var(--tint);color:var(--ink)}
    .tabs{display:flex;background:#fff;border-bottom:1px solid var(--line)}
    .tab{flex:1;height:38px;border:0;border-bottom:3px solid transparent;background:none;color:var(--mute);font:inherit;font-weight:600;cursor:pointer}
    .tab:hover{color:var(--ink);background:var(--tint)}
    .tab[aria-selected="true"]{color:var(--brand-l);border-bottom-color:var(--brand-l)}
    .body{flex:1;min-height:0;overflow-y:auto;padding:10px;display:flex;flex-direction:column}
    .tabpage{display:flex;flex-direction:column;gap:10px}
    .group{background:#fff;border:1px solid var(--line);border-radius:4px;display:flex;flex-direction:column;overflow:hidden}
    .gbody{display:flex;flex-direction:column;gap:8px;padding:10px}
    .gtitle{padding:5px 10px;border-top:1px solid var(--line);background:var(--tint);color:var(--mute);font-size:11px;font-weight:600;text-align:center;text-transform:uppercase;letter-spacing:.04em}
    .gbody .btn{width:100%}
    .gbody .btn.half{width:auto;flex:1}
    .btnrow{display:flex;gap:8px}
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
    .foot{display:flex;flex-direction:column;gap:4px;padding:8px 12px;background:#fff;border-top:1px solid var(--line)}
    .status{min-height:20px;font-size:13px;color:var(--mute)}
    .status b{color:var(--ink)}
    .hint{font-size:11px;color:var(--mute)}
  `;

  const host = document.createElement('div');
  host.id = 'pmg-host';
  host.style.cssText = 'position:fixed;top:0;right:0;bottom:0;z-index:2147483647;';   // full height, on the right edge
  const root = host.attachShadow({ mode: 'open' });   // shadow DOM: the site's CSS cannot reach the panel
  root.innerHTML = `
    <style>${UI_BASE}${RIBBON_CSS}</style>
    <div class="rb" id="rb">
      <div class="top">${WORDMARK(26)}<button class="min-btn" id="min" title="Collapse or expand the panel">–</button></div>
      <nav class="tabs" id="tabs"></nav>
      <div class="body" id="body"></div>
      <div class="foot"><div class="status" id="status"></div><small class="hint" id="hint"></small></div>
    </div>`;
  document.body.appendChild(host);
  const $ = id => root.getElementById(id);

  // One tab per name, one section per tab; each feature group is a box with its title under it, like Word
  function mountRibbon(list) {
    const byTab = {};
    list.forEach(f => (f.groups || []).forEach(g => { (byTab[g.tab] = byTab[g.tab] || []).push(g); }));
    const names = [...TAB_ORDER.filter(t => byTab[t]), ...Object.keys(byTab).filter(t => !TAB_ORDER.includes(t))];
    names.forEach(name => {
      $('tabs').append(h('button', { class: 'tab', text: name, 'data-tab': name, onclick: () => showTab(name) }));
      $('body').append(h('section', { class: 'tabpage', 'data-tab': name, hidden: true },
        byTab[name].map(g => h('div', { class: 'group' },
          h('div', { class: 'gbody' }, g.build()),
          h('div', { class: 'gtitle', text: g.title })))));
    });
    showTab(names.includes(store.get('tab', '')) ? store.get('tab', '') : names[0]);
    $('min').onclick = () => setMin(!$('rb').classList.contains('min'));
    setMin(store.get('min', '0') === '1');
  }
  function showTab(name) {
    root.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
    root.querySelectorAll('.tabpage').forEach(p => { p.hidden = p.dataset.tab !== name; });
    store.set('tab', name);
  }
  // Collapsed: only the header stays, and the panel stops covering the page below it
  function setMin(on) {
    $('rb').classList.toggle('min', on);
    host.style.bottom = on ? 'auto' : '0';
    store.set('min', on ? '1' : '0');
  }

  function setStatus(html) { $('status').innerHTML = html; }

  // "Keys: S · F · L · U · N · R · Q ◀ ▶ D · Esc", built from the keys the features declared
  function updateHint() {
    const parts = Object.values(keyMap).filter(k => k.hint)
      .sort((a, b) => (a.hintOrder || 0) - (b.hintOrder || 0))
      .map(k => (typeof k.hint === 'function' ? k.hint() : k.hint));
    $('hint').textContent = 'Keys: ' + [...parts, 'Esc'].join(' · ');
  }
