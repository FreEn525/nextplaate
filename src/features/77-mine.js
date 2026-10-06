  /* =====================================================================
   *  YOUR PHOTOS OF THIS VEHICLE  (upload page, under the brand / model / generation menus)
   *    Whatever the menus hold, however it got there (you, the plate check, Lens), the card says how many photos of that brand,
   *    that model and that generation you already have on the site, each number a link to those photos. The count is the one the
   *    site announces for your gallery filtered on the vehicle (gallery.php?usr=<you>&markaavto=&model=&modgen=), asked through the
   *    shared queue, the most precise level first, and kept for the visit: choosing the same vehicle again asks nothing.
   * ===================================================================== */
  const mineCache = new Map();      // address -> count

  // The menus now: [{ label, url }] from the most precise level that is chosen up to the brand; [] when no brand
  function mineLevels(me) {
    const menus = vehicleMenus(), values = vehicleCurrent();
    const chosen = values.map(v => (+v > 0 && +v !== 200 ? v : ''));
    if (!chosen[0]) return [];
    const names = menus.map(el => (el && el.selectedOptions[0] ? el.selectedOptions[0].textContent.trim() : ''));
    const keys = ['markaavto', 'model', 'modgen'];
    const levels = [];
    for (let i = 0; i < 3; i++) {
      if (!chosen[i]) break;
      levels.unshift({ name: names[i], key: keys[i],
        url: `/gallery.php?usr=${me}&` + keys.slice(0, i + 1).map((k, j) => `${k}=${chosen[j]}`).join('&') });
    }
    return levels;
  }

  async function mineCount(url) {
    if (mineCache.has(url)) return mineCache.get(url);
    const n = await profileCount(url);                                        // 76-profile.js: the count a gallery page announces
    mineCache.set(url, n);
    return n;
  }

  function mineCard(me) {
    const row = document.querySelector('.pm-vehicle-fields-row');
    const card = row && inlineCard({ id: 'pmg-mine-card', title: 'Your photos of this vehicle', after: row, closable: false });
    if (!card) return;
    card.host.hidden = true;
    let shown = '', run = 0;
    const draw = () => {
      const levels = mineLevels(me), sig = levels.map(l => l.url).join('|');
      if (sig === shown) return;
      shown = sig;
      const mine = ++run;                                                      // a newer choice drops the answers still coming
      card.host.hidden = !levels.length;
      card.clear();
      if (!levels.length) return;
      const where = { markaavto: 'Brand', model: 'Model', modgen: 'Generation' };
      const items = levels.map(l => {
        const num = h('a', { class: 'mine-n', href: l.url, target: '_blank', rel: 'noopener noreferrer', text: '\u2026', title: 'Opens your photos of this in a new tab' });
        return { l, num, el: h('span', { class: 'mine-item' }, `${where[l.key]} `, h('b', { text: l.name }), ': ', num) };
      });
      card.message('');
      card.body.append(h('div', { class: 'cardbox' }, h('p', { class: 'hint', text: 'How many photos you already have on the site:' }), h('div', { class: 'ln' }, items.slice().reverse().map(i => i.el))));
      (async () => {
        for (const i of items) {
          try {
            const n = await mineCount(i.l.url);
            if (mine !== run) return;
            i.num.textContent = String(n);
            i.num.classList.toggle('zero', n === 0);
          } catch (e) { if (mine === run) card.message('Not counted: ' + e.message); return; }
        }
      })();
    };
    // the menus change by the site's own script, by the plate check and by Lens: a short look at them, and the events, cover all three
    let timer = 0;
    const soon = () => { clearTimeout(timer); timer = setTimeout(draw, 500); };
    vehicleMenus().forEach(el => el && el.addEventListener('change', soon));
    setInterval(soon, 1500);
    draw();
  }

  registerFeature({
    id: 'mine', label: 'Your photos of this vehicle',
    init: () => {
      if (!here.add) return;
      const me = membersMe();                                                 // 73-members.js: the logged-in member
      if (me) mineCard(me.id);
    }
  });
