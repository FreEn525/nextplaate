  /* =====================================================================
   *  MODAL  (a window over the page, in the look of the panel)
   *    For what needs the whole screen for a moment (the tags of a photo) instead of the site's own pop-up.
   *      const modal = modalOpen({ id: 'pmg-tags-modal', title: 'Tags', body: element, actions: [{ label: 'Save', run }, ...], onDismiss, fill: true });
   *      modal.close()      closes it;  modal.dismiss()  closes it as a cancel (onDismiss runs first)
   *    The Close button of its header (the only one: an action at the foot is for what does something else, Save, Update...) and the Esc key dismiss it; a click outside does NOT (the same in every window of the script, the batch window
   *    included: a stray click, or a drag of the map that ends outside, must never lose what is open). An action closes nothing by itself: it calls modal.close().
   *    fill: true makes it almost the whole screen, with a body that does not scroll (the map: it lays out its own scrolling parts).
   *    It is in a shadow root (the site's CSS does not reach it) and uses the panel's tokens. One modal of an id at a time.
   * ===================================================================== */
  const MODAL_CSS = `
    .ov{position:fixed;inset:0;background:rgba(17,17,17,.55);display:flex;justify-content:center;align-items:flex-start;padding:22px 72px 22px 22px;overflow:auto}   /* 72 = the panel's rail (56) and a margin: the window never goes under it */
    .dlg{background:#fff;border:1px solid var(--line);width:min(960px,100%);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35)}
    .mh{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:56px;padding:0 16px;border-bottom:1px solid var(--line)}
    .mh h2{margin:0;font-size:14px;font-weight:500;color:var(--mute)}                /* the same header as the batch window: the mark, then the name of the window */
    .mh .mbrand{display:flex;flex:none}
    .mh .btn{height:var(--h-sm);flex:none}
    .mh .sub{flex:1;min-width:0;font-size:12px;color:var(--mute);overflow-wrap:anywhere}
    .mb{flex:1;min-height:0;overflow:auto}
    .ov.fill{align-items:center}
    .dlg.fill{width:min(1400px,100%);height:100%;max-height:none}
    .dlg.fill .mb{overflow:hidden;display:flex;flex-direction:column}
    @media (max-width:640px){.ov{padding:0 56px 0 0}.dlg{border:0;max-height:100%}.mh .mbrand span span{display:none}}
    .mf{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--line);background:var(--paper)}
  `;

  function modalOpen(opts) {
    document.getElementById(opts.id) && document.getElementById(opts.id).remove();
    const host = h('div', { id: opts.id });
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483645';
    const root = host.attachShadow({ mode: 'open' });
    const sub = h('span', { class: 'sub' });
    const brand = h('span', { class: 'mbrand' });
    brand.innerHTML = WORDMARK(38);                                                  // our own SVG constant, never user data
    const before = document.documentElement.style.overflow;
    let done = false;
    const modal = {
      host, body: null,
      message: text => { sub.textContent = text; },
      close() {
        if (done) return;
        done = true;
        document.removeEventListener('keydown', onKey, true);
        document.documentElement.style.overflow = before;
        host.remove();
      },
      dismiss() { if (done) return; if (opts.onDismiss) opts.onDismiss(); modal.close(); }
    };
    const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); modal.dismiss(); } };
    const ov = h('div', { class: 'ov' + (opts.fill ? ' fill' : '') },
      h('div', { class: 'dlg' + (opts.fill ? ' fill' : ''), role: 'dialog' },
        h('div', { class: 'mh' }, brand, h('h2', { text: opts.title }), sub, h('button', { type: 'button', class: 'btn ghost', title: 'Close (Esc)', text: 'Close', onclick: () => modal.dismiss() })),
        modal.body = h('div', { class: 'mb' }, opts.body),
        opts.actions && opts.actions.length
          ? h('div', { class: 'mf' }, opts.actions.map(a => h('button', { type: 'button', class: 'btn' + (a.kind === 'ghost' ? ' ghost' : ''), text: a.label, onclick: a.run })))
          : null));
    root.append(h('style', { text: UI_BASE + MODAL_CSS }), ov);
    document.body.appendChild(host);
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey, true);
    return modal;
  }
