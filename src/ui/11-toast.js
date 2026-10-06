  /* =====================================================================
   *  TOAST  (a small notice that comes up in a corner and goes by itself, like a phone's)
   *      toast({ title, body, href, kind })      kind: 'like' | 'comment' | 'message' | 'other' (the colour and the word on it)
   *    They stack above the panel's rail, bottom right. Pointing at one keeps it; the cross or a click on the title closes it; a click on
   *    the line opens its link in a new tab. Under reduced motion they appear without sliding. It is in a shadow root, in the panel's tokens.
   * ===================================================================== */
  const TOAST_WORDS = { like: 'Like', comment: 'Comment', message: 'Message', other: 'News' };
  const TOAST_CSS = `
    .stack{position:fixed;right:72px;bottom:16px;display:flex;flex-direction:column;gap:8px;width:min(340px,calc(100vw - 88px));pointer-events:none}
    .t{position:relative;display:flex;flex-direction:column;gap:2px;padding:10px 36px 10px 14px;border:1px solid var(--line2);border-left:3px solid var(--primary);background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.2);pointer-events:auto;animation:in .2s ease-out}
    .t.like{border-left-color:var(--danger)}.t.comment{border-left-color:var(--ok-ink)}.t.message{border-left-color:var(--primary)}
    .t .k{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
    .t a.ti{font-size:14px;font-weight:600;color:var(--ink);text-decoration:none;overflow-wrap:anywhere}
    .t a.ti:hover{color:var(--primary-h);text-decoration:underline}
    .t .b{font-size:12px;color:var(--mute)}
    .t .x{position:absolute;top:4px;right:4px;width:var(--h-sm);height:var(--h-sm);display:grid;place-items:center;border:0;background:none;color:var(--mute);font:inherit;font-size:16px;cursor:pointer}
    .t .x:hover{background:var(--primary-tint);color:var(--ink)}
    @keyframes in{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}
    @media (prefers-reduced-motion:reduce){.t{animation:none}}
  `;
  let toastStack = null;

  function toast({ title, body = '', href = '', kind = 'other', ms = 9000 }) {
    if (!toastStack || !toastStack.isConnected) {
      const host = h('div', { id: 'pmg-toasts' });
      host.style.cssText = 'position:fixed;inset:0;z-index:2147483646;pointer-events:none';
      const root = host.attachShadow({ mode: 'open' });
      toastStack = h('div', { class: 'stack', role: 'status', 'aria-live': 'polite' });
      root.append(h('style', { text: UI_BASE + TOAST_CSS }), toastStack);
      document.body.appendChild(host);
    }
    const el = h('div', { class: 't ' + kind },
      h('span', { class: 'k', text: TOAST_WORDS[kind] || TOAST_WORDS.other }),
      href ? h('a', { class: 'ti', href, target: '_blank', rel: 'noopener noreferrer', text: title }) : h('span', { class: 'ti', text: title }),
      body ? h('span', { class: 'b', text: body }) : null,
      h('button', { type: 'button', class: 'x', title: 'Close', 'aria-label': 'Close', text: '\u00d7', onclick: () => el.remove() }));
    let timer = 0;
    const arm = () => { clearTimeout(timer); timer = setTimeout(() => el.remove(), ms); };
    el.addEventListener('mouseenter', () => clearTimeout(timer));
    el.addEventListener('mouseleave', arm);
    toastStack.append(el);
    while (toastStack.children.length > 4) toastStack.firstChild.remove();       // never a wall of them
    arm();
    return el;
  }
