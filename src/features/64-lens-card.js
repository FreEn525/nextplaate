  /* =====================================================================
   *  GOOGLE LENS CARD  (on the upload page, right above the brand / model / generation menus)
   *    The answer of the Lens group (65-lens.js), shown where it is used: three columns of up to three choices. A click on a
   *    choice fills the site's own menus (brand, then model, then generation, the way the page's functions fill each other).
   *    "Fill with the first choices" does the three at once. Nothing is filled until the user clicks.
   *    The card is in a shadow root (the site's CSS cannot reach it) and uses the same look as the panel.
   * ===================================================================== */
  const LENS_CARD_CSS = `
    :host{display:block;margin:0 0 12px}
    .card{background:#fff;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
    .top{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--tint);border-bottom:1px solid var(--line)}
    .top b{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-t)}
    .top .msg{flex:1;min-width:0;font-size:12px;color:var(--mute);overflow-wrap:anywhere}
    .cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:12px}
    .col{display:flex;flex-direction:column;gap:6px;min-width:0}
    .cat{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
    .chip{width:100%;min-height:34px;padding:6px 10px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:inherit;font-size:13px;text-align:left;cursor:pointer;overflow-wrap:anywhere}
    .chip:hover{background:var(--tint);border-color:var(--brand-b)}
    .chip.best{border-color:var(--brand-b);background:var(--brand);color:var(--brand-t);font-weight:600}
    .chip.on{border-color:var(--brand-l);box-shadow:inset 0 0 0 1px var(--brand-l)}
    .none{font-size:13px;color:var(--mute)}
    .bar{display:flex;gap:8px;padding:0 12px 12px}
    @media (max-width:640px){.cols{grid-template-columns:1fr}}
  `;

  const lensMenus = () => [document.querySelector('select[name="markaavto"]'), document.getElementById('model'), document.getElementById('modgen')];

  // The card, created once above the vehicle menus; null on a page without them
  function lensCard() {
    let host = document.getElementById('pmg-lens-card');
    if (host) return host.shadowRoot;
    const row = document.querySelector('.pm-vehicle-fields-row');
    if (!row) return null;
    host = h('div', { id: 'pmg-lens-card' });
    row.parentNode.insertBefore(host, row);
    const root = host.attachShadow({ mode: 'open' });
    root.append(h('style', { text: UI_BASE + LENS_CARD_CSS }), h('div', { class: 'card' },
      h('div', { class: 'top' }, h('b', { text: 'Google Lens' }), h('span', { class: 'msg', id: 'cardMsg' }),
        h('button', { class: 'iconbtn', id: 'cardClose', title: 'Hide', text: '×' })),
      h('div', { id: 'cardBody' })));
    root.getElementById('cardClose').onclick = () => { host.hidden = true; };
    return root;
  }

  // The menus of the page, filled the way the page fills them: a change event runs the page's own onchange (changeBrand, changeModel)
  function lensFill(path) {
    const menus = lensMenus();
    path.forEach((id, i) => {
      const el = menus[i];
      if (!el || id === undefined || el.value === String(id)) return;
      el.value = String(id);
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    lensCardMark();
  }

  // The choices that are the menus' current values are marked
  function lensCardMark() {
    const root = lensCard();
    if (!root) return;
    const now = lensMenus().map(el => el && el.value);
    root.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', now[+c.dataset.level] === c.dataset.id));
  }

  // message: a short line (searching, nothing found); rows: [{ category, level, candidates: [{ id, path, name }] }] or null.
  // Returns false when the page has no place for the card (the panel shows the answer then).
  function lensCardShow(message, rows) {
    const root = lensCard();
    if (!root) return false;
    root.host.hidden = false;
    root.getElementById('cardMsg').textContent = message;
    const body = root.getElementById('cardBody');
    body.textContent = '';
    if (!rows) return true;
    body.append(h('div', { class: 'cols' }, rows.map(r => h('div', { class: 'col' },
      h('div', { class: 'cat', text: r.category }),
      r.candidates.length
        ? r.candidates.map((c, i) => h('button', { class: 'chip' + (i === 0 ? ' best' : ''), text: c.name, 'data-id': String(c.id), 'data-level': String(r.level), onclick: () => lensFill(c.path) }))
        : h('div', { class: 'none', text: 'No choice' })))));
    const first = rows.map(r => r.candidates[0] && r.candidates[0].id);
    if (first[0] !== undefined) {
      const path = [];
      for (const id of first) { if (id === undefined) break; path.push(id); }
      body.append(h('div', { class: 'bar' }, h('button', { class: 'btn', text: 'Fill with the first choices', onclick: () => lensFill(path) })));
    }
    lensCardMark();
    return true;
  }
