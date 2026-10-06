  /* =====================================================================
   *  INLINE CARD  (a block of the script, inside the site's page, in the look of the panel)
   *    For what is used right where it appears (the answer of Google Lens above the vehicle menus) instead of in a drawer.
   *      const card = inlineCard({ id: 'pmg-lens-card', title: 'Google Lens', after: someElement });   // or before: ; null if no element
   *      card.message('Searching…');        a short line in the title bar
   *      card.body                          the element to fill (card.clear() empties it)
   *      cardChoices(card, columns, opts)   columns of choices to click (see below)
   *    The card is in a shadow root: the site's CSS does not reach it and the panel's tokens (UI_BASE) apply. The same id gives
   *    the same card back, so a feature can call inlineCard() every time it needs it.
   * ===================================================================== */
  const INLINE_CARD_CSS = `
    :host{display:block;margin:0 0 12px}
    .card{background:#fff;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
    .top{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:8px 12px;background:var(--tint);border-bottom:1px solid var(--line)}
    .top b{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--brand-t)}
    .top .msg{flex:1 1 150px;min-width:0;font-size:12px;color:var(--mute);overflow-wrap:anywhere}
    .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;padding:12px}   /* three side by side where there is room, stacked under a photo */
    .col{display:flex;flex-direction:column;gap:6px;min-width:0}
    .cat{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
    .chip{width:100%;min-height:34px;padding:6px 10px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:inherit;font-size:13px;text-align:left;cursor:pointer;overflow-wrap:anywhere}
    .chip:hover{background:var(--tint);border-color:var(--brand-b)}
    .chip.best{border-color:var(--brand-b);background:var(--brand);color:var(--brand-t);font-weight:600}
    .chip.on{border-color:var(--brand-l);box-shadow:inset 0 0 0 1px var(--brand-l)}
    .none{font-size:13px;color:var(--mute)}
    .bar{display:flex;gap:8px;padding:0 12px 12px}
  `;

  // opts: { id, title, after | before: the element the card goes behind or in front of }; null when there is no such element
  function inlineCard(opts) {
    let host = document.getElementById(opts.id);
    if (!host) {
      const anchor = opts.after || opts.before;
      if (!anchor || !anchor.parentNode) return null;
      host = h('div', { id: opts.id });
      anchor.parentNode.insertBefore(host, opts.after ? anchor.nextSibling : anchor);
      const root = host.attachShadow({ mode: 'open' });
      root.append(h('style', { text: UI_BASE + INLINE_CARD_CSS }), h('div', { class: 'card' },
        h('div', { class: 'top' }, h('b', { text: opts.title }), h('span', { class: 'msg' }),
          h('button', { class: 'iconbtn', title: 'Hide', text: '×', onclick: () => { host.hidden = true; } })),
        h('div', { class: 'cbody' })));
    }
    const root = host.shadowRoot;
    host.hidden = false;
    return {
      host, root, body: root.querySelector('.cbody'),
      message: text => { root.querySelector('.msg').textContent = text; },
      clear: () => { root.querySelector('.cbody').textContent = ''; }
    };
  }

  // Columns of choices to click. columns: [{ label, level, choices: [{ id, name, path }] }]. The first choice of a column is
  // highlighted. opts.pick(path) runs on a click; opts.current() returns the values now in force, one per level, and the choices
  // equal to them are marked; opts.action = { label, path } adds a button that picks that path at once.
  function cardChoices(card, columns, opts) {
    const mark = () => {
      const now = opts.current ? opts.current() : [];
      card.root.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', now[+c.dataset.level] === c.dataset.id));
    };
    const pick = path => { opts.pick(path); mark(); };
    card.clear();
    card.body.append(h('div', { class: 'cols' }, columns.map(col => h('div', { class: 'col' },
      h('div', { class: 'cat', text: col.label }),
      col.choices.length
        ? col.choices.map((c, i) => h('button', { class: 'chip' + (i === 0 ? ' best' : ''), text: c.name, 'data-id': String(c.id), 'data-level': String(col.level), onclick: () => pick(c.path) }))
        : h('div', { class: 'none', text: 'No choice' })))));
    if (opts.action && opts.action.path.length) {
      card.body.append(h('div', { class: 'bar' }, h('button', { class: 'btn', text: opts.action.label, onclick: () => pick(opts.action.path) })));
    }
    mark();
  }
