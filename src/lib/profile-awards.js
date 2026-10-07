  /* =====================================================================
   *  PROFILE AWARDS  (the counter beside the trophy of a profile)
   *    The site shows the figure of the awards only when there are none ("-"): with awards the trophy has no figure at all. The awards
   *    are on their own page (userawards.php), in one table per kind (State, region, license plate format, vehicle brand, model), a line
   *    per award. The script counts the lines, puts the total in the badge and the detail in the hover. The page is read in the
   *    background (a request of the low lane), once an hour per member, and kept in the browser.
   *      awardsParse(html)          -> { total, parts: [{ name, n }] }
   *      profileAwards(root, id)    fills the badge of the trophy when the site left it empty
   * ===================================================================== */
  function awardsParse(html) {
    const doc = new DOMParser().parseFromString(String(html), 'text/html');
    const parts = [...doc.querySelectorAll('.panel-blue')].map(p => ({
      name: profileText(p.querySelector('.panel-title')).replace(/^Awards\s*\(/i, '').replace(/\)$/, ''),
      n: [...p.querySelectorAll('tbody tr')].filter(tr => tr.querySelector('td') && !tr.querySelector('.dataTables_empty')).length
    })).filter(x => x.n);
    return { total: parts.reduce((sum, x) => sum + x.n, 0), parts };
  }

  async function profileAwards(root, id) {
    const link = root.querySelector('a[href*="/userawards.php"]'), li = link && link.parentElement;
    if (!li || !id) return;
    let badge = li.querySelector('.badge');
    if (/^[1-9]\d*$/.test(profileText(badge))) return;                           // the site shows a figure: it is the right one
    const key = 'awards_' + id;
    const show = a => {
      if (!a || !a.total) return;
      if (!badge) { badge = h('span', { class: 'badge badge-orange rounded-x' }); li.append(badge); }
      badge.textContent = String(a.total);
      const detail = 'Awards: ' + a.parts.map(p => `${p.n} ${p.name}`).join(', ');
      link.setAttribute('data-original-title', detail);                             // the site's own tooltip reads it
      link.title = detail;
    };
    let kept = null;
    try { kept = JSON.parse(store.get(key, 'null')); } catch (e) { kept = null; }
    show(kept);
    if (kept && Date.now() - kept.at < 3600000) return;                              // counted within the hour
    try {
      const a = awardsParse(await siteFetch(`/userawards.php?user=${id}`, undefined, { low: true }));
      store.set(key, JSON.stringify({ ...a, at: Date.now() }));
      show(a);
    } catch (e) { /* the site is busy: the last figure stays, or none */ }
  }
