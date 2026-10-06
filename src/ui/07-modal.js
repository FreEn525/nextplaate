  /* =====================================================================
   *  MODAL  (a window over the page, in the look of the panel)
   *    For what needs the whole screen for a moment (the tags of a photo) instead of the site's own pop-up.
   *      const modal = modalOpen({ id: 'pmg-tags-modal', title: 'Tags', body: element, actions: [{ label: 'Save', run }, ...], onDismiss });
   *      modal.close()      closes it;  modal.dismiss()  closes it as a cancel (onDismiss runs first)
   *    The cross, the Esc key and a click outside the window dismiss it. An action closes nothing by itself: it calls modal.close().
   *    It is in a shadow root (the site's CSS does not reach it) and uses the panel's tokens. One modal of an id at a time.
   * ===================================================================== */
  const MODAL_CSS = `
    .ov{position:fixed;inset:0;background:rgba(17,17,17,.55);display:flex;justify-content:center;align-items:flex-start;padding:5vh 72px 5vh 16px;overflow:auto}   /* 72 = the panel's rail (56) and a margin: the window never goes under it */
    .dlg{background:#fff;border:1px solid var(--line);width:min(960px,100%);max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.35)}
    .mh{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:56px;padding:0 16px;border-bottom:1px solid var(--line)}
    .mh h2{margin:0;font-size:16px;font-weight:700;color:var(--primary-h)}
    .mh .sub{flex:1;min-width:0;font-size:12px;color:var(--mute);overflow-wrap:anywhere}
    .mb{flex:1;min-height:0;overflow:auto}
    .mf{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--line);background:var(--paper)}
  `;

  function modalOpen(opts) {
    document.getElementById(opts.id) && document.getElementById(opts.id).remove();
    const host = h('div', { id: opts.id });
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483645';
    const root = host.attachShadow({ mode: 'open' });
    const sub = h('span', { class: 'sub' });
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
    const ov = h('div', { class: 'ov', onclick: e => { if (e.target === ov) modal.dismiss(); } },
      h('div', { class: 'dlg', role: 'dialog' },
        h('div', { class: 'mh' }, h('h2', { text: opts.title }), sub, h('button', { class: 'iconbtn', title: 'Close', text: '×', onclick: () => modal.dismiss() })),
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
