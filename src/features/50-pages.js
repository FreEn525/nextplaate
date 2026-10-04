  /* =====================================================================
   *  PAGE NAVIGATION  (previous / next page of a gallery)
   * ===================================================================== */
  // The site's pagination is <ul class="pagination"> « 1 2 3 »: the active page is <li class="active">,
  // so the previous / next page is simply the <li> before / after it.
  // Address of the previous (-1) / next (+1) page, or null on the first / last page
  function pageHref(dir) {
    const ul = document.querySelector('ul.pagination');
    if (!ul) return null;
    const items = [...ul.children].filter(li => li.tagName === 'LI');
    const i = items.findIndex(li => li.classList.contains('active'));
    const target = i < 0 ? null : items[i + dir];
    const a = target && target.querySelector('a');
    const href = a && a.getAttribute('href');
    if (!a || !href || href === '#' || /^javascript:/i.test(href)) return null;
    // A link that points back to the page we are on (e.g. "»" on the last page) is not a new page
    if (a.href.split('#')[0] === location.href.split('#')[0]) return null;
    try {
      const cur = new URLSearchParams(location.search).get('start');
      const nxt = new URL(a.href).searchParams.get('start');
      if ((cur !== null || nxt !== null) && (cur || '0') === (nxt || '0')) return null;
    } catch (e) {}
    return a.href;
  }

  function goToPage(dir) {
    if (!document.querySelector('ul.pagination')) return false; // no pagination here: leave the key alone
    if (liking || getRun()) { setStatus('Auto-like is running. Press <b>L</b> or <b>Esc</b> to stop it first.'); return true; }
    const href = pageHref(dir);
    if (!href) { setStatus(dir > 0 ? 'This is the <b>last</b> page.' : 'This is the <b>first</b> page.'); return true; }
    setStatus(dir > 0 ? 'Next page…' : 'Previous page…');
    location.href = href;
    return true;
  }


  registerFeature({
    groups: [{
      drawer: 'gallery', title: 'Pages',
      build: () => [
        h('div', { class: 'btnrow' },
          h('button', { id: 'prevPage', class: 'btn ghost half', text: '◀ Previous' }),
          h('button', { id: 'nextPage', class: 'btn ghost half', text: 'Next ▶' }))
      ]
    }],
    keys: {
      prev: { code: 'KeyA', label: 'Previous page', run: () => goToPage(-1), hint: () => keyName(actions.prev.bound) + ' ◀ ▶ ' + keyName(actions.next.bound), hintOrder: 60 }, // left key
      next: { code: 'KeyD', label: 'Next page', run: () => goToPage(+1) }                                                 // right key -> next page
    },
    init: () => {
      $('prevPage').onclick = () => goToPage(-1);
      $('nextPage').onclick = () => goToPage(+1);
    }
  });
