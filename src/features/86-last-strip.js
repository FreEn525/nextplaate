  /* =====================================================================
   *  THE LAST PLATES STRIP  (the line of the latest uploads that every page of the site carries under its header)
   *    The site writes it as a small line of text, "last | AB 123 | CD 456 | ...", at the very left of the window. Here it becomes a slim
   *    strip as wide as the page, centred, with a flag and a chip per plate: all of them on ONE line (a long plate is cut with an ellipsis, its
   *    full text is the hover; never a scrollbar, never a second line). The links are the site's own;
   *    its line stays in the page, hidden. Switch it off in Settings to get the site's line back.
   * ===================================================================== */
  const STRIP_CSS = `
    .pm-last{${PAGE_TOKENS};display:flex;align-items:center;justify-content:center;gap:12px;width:min(1170px,calc(100% - 30px));min-height:44px;margin:8px auto;padding:7px 12px;border:1px solid var(--pm-line);background:#fff}
    .pm-last-label{flex:none;font:700 11px/1 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:var(--pm)}
    .pm-last-list{display:flex;flex:0 1 auto;justify-content:center;gap:4px;min-width:0}
    .pm-chip{display:inline-flex;align-items:center;flex:0 1 auto;min-width:0;height:30px;padding:0 8px;border:1px solid var(--pm-line2);background:var(--pm-paper);color:var(--pm-ink);font:600 12px/1 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;text-decoration:none;overflow:hidden}
    .pm-chip:hover{background:var(--pm-tint);border-color:var(--pm-soft);color:var(--pm-ink);text-decoration:none}
    .pm-chip-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    ${PM_FLAG_CSS}
    .pm-chip .pm-flag{margin-right:6px}
  `;

  registerFeature({
    id: 'laststrip', label: 'Latest plates strip',
    groups: [],
    init: () => {
      const mark = document.querySelector('.text-highlights'), small = mark && mark.closest('small');
      const links = small ? [...small.querySelectorAll('a[href*="/nomer"]')] : [];
      if (!links.length || document.querySelector('.pm-last')) return;
      const style = document.createElement('style');
      style.id = 'pmg-last-strip-style';
      style.textContent = STRIP_CSS;
      document.head.appendChild(style);
      const chips = links.map(a => {
        const code = (a.getAttribute('href').match(/^\/([a-z]{2})\//) || [])[1];
        const text = a.textContent.trim();
        return h('a', { class: 'pm-chip', href: a.getAttribute('href'), title: (code ? cName(code) + ': ' : '') + text }, code ? profileFlag(code) : null, h('span', { class: 'pm-chip-text', text }));
      });
      small.after(h('div', { class: 'pm-last' }, h('span', { class: 'pm-last-label', text: 'Last' }), h('div', { class: 'pm-last-list' }, chips)));
      small.style.display = 'none';
    }
  });
