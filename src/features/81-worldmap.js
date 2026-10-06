  /* =====================================================================
   *  WORLD MAP  (the countries a member has photos from, on a map of the world)
   *    A window, like the batch window: the world as an SVG (src/lib/worldmap.js; drawn by 82-worldmap-view.js), each country the member has photos from filled in
   *    five shades of the panel's blue by how many photos (1, 2-9, 10-49, 50-199, 200 and more), the others left light. A country is a link
   *    to the member's photos of it (the site's gallery.php?usr=), with its figures as the hover text. The small countries the map has
   *    no shape for are dots; the ones with neither (USSR, the non-recognised states) are listed under the map, and a list of all the
   *    countries is there too, for the keyboard and for the numbers.
   *    Whose map: yours (the member logged in) or anyone's: a box takes a number or the link of a profile, and the members you saved are
   *    one click. The figures are the ones of the member's profile, one page read through the shared queue (the page itself when you are
   *    on it), kept for the visit. Open it from Browse > World map, the key G (globe: the same place on QWERTY, AZERTY and QWERTZ), or the button of a profile.
   * ===================================================================== */
  const worldCache = new Map();      // member number -> { id, name, countries: { cc: { photos, likes, comments } } }

  // What a profile page says: the member and, per country, the photos, likes and comments (the table of the profile)
  function worldParse(doc, id) {
    const who = memberInfo(doc, id);
    const countries = {};
    doc.querySelectorAll('table tbody tr').forEach(tr => {
      const link = tr.querySelector('a[href*="/usercountry-"]');
      const m = link && /usercountry-([a-z0-9]+)-\d+/i.exec(link.getAttribute('href'));
      const td = tr.querySelectorAll('td');
      if (!m || td.length < 4) return;
      const num = cell => +(cell.getAttribute('data-order') || String(cell.textContent).replace(/\D/g, '') || 0);
      countries[m[1].toLowerCase()] = { photos: num(td[1]), likes: num(td[2]), comments: num(td[3]) };
    });
    return { id: String(id), name: who ? who.name : 'member ' + id, countries };
  }

  async function worldData(id) {
    if (worldCache.has(id)) return worldCache.get(id);
    const here_ = here.profile && location.pathname.match(/\/user(\d+)/);
    const doc = here_ && here_[1] === id ? document : new DOMParser().parseFromString(await siteFetch('/user' + id), 'text/html');
    const data = worldParse(doc, id);
    if (!Object.keys(data.countries).length) throw new Error('no country table on that profile');
    worldCache.set(id, data);
    return data;
  }

  // The window. id: the member to show (default: you, or the member of the profile you are on)
  function worldMapOpen(id) {
    const me = membersMe();
    const start = id || (here.profile && (location.pathname.match(/\/user(\d+)/) || [])[1]) || (me && me.id) || '';
    if (typeof closeDrawer === 'function') closeDrawer();                       // the panel must not lie over the map
    const view = h('div', { class: 'view' });
    const input = h('input', { type: 'text', placeholder: 'Member number or profile link', 'aria-label': 'Member', autocomplete: 'off' });
    const chips = h('span', { class: 'who' });
    const menu = h('select', { 'aria-label': 'Map to show', hidden: true });
    const bar = h('div', { class: 'bar' }, input, h('button', { type: 'button', class: 'btn', text: 'Show', onclick: () => go(input.value) }), chips,
      h('span', { class: 'gap' }), h('span', { class: 'lbl', text: 'Map' }), menu);
    const body = h('div', { class: 'wm' }, h('style', { text: MAP_CSS }), bar, view);
    const modal = modalOpen({ id: 'pmg-worldmap', title: 'World map', body, fill: true });
    const who = [...(me ? [{ id: me.id, name: 'Me (' + me.name + ')' }] : []), ...membersGet().filter(m => !me || m.id !== me.id).slice(0, 6)];
    who.forEach(m => chips.append(h('button', { type: 'button', class: 'pill', text: m.name, onclick: () => go(m.id) })));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(input.value); } });
    const say = text => view.replaceChildren(h('p', { class: 'msg', text }));
    let run = 0, current = null;
    // the choice of map: the world, or a country that has a map of its regions (83-regionmap.js)
    async function showMap(cc) {
      const mine = ++run;
      menu.value = cc;
      if (!cc) { view.replaceChildren(worldView(current, showMap)); return; }
      say(`Reading the regions of ${cName(cc)}… (the site’s lists, then the shapes)`);
      try { const v = await regionMapView(cc, current); if (mine === run) view.replaceChildren(v); }
      catch (err) { if (mine === run) say('Not drawn: ' + err.message + '.'); }
    }
    menu.onchange = () => showMap(menu.value);
    function fillMenu(data) {
      const options = Object.keys(REGION_MAPS).filter(cc => (data.countries[cc] || {}).photos > 0).sort((a, b) => data.countries[b].photos - data.countries[a].photos);
      menu.replaceChildren(h('option', { value: '', text: 'World' }), ...options.map(cc => h('option', { value: cc, text: `${cName(cc)} (regions)` })));
      menu.hidden = !options.length;
      bar.querySelector('.lbl').hidden = !options.length;
    }
    async function go(text) {
      const member = memberIdOf(text);
      if (!member) { say('Type a member number (121559) or paste the link of a profile.'); return; }
      const mine = ++run;
      input.value = member;
      modal.message(`member ${member}`);
      say('Reading the profile…');
      try {
        const data = await worldData(member);
        if (mine !== run) return;
        modal.message(`${data.name} · ID ${data.id}`);
        current = data;
        fillMenu(data);
        showMap('');
      } catch (e) { if (mine === run) say('Not read: ' + e.message + '.'); }
    }
    if (start) go(start); else say('Type a member number or paste the link of a profile.');
    return modal;
  }

  registerFeature({
    id: 'worldmap', label: 'World map',
    groups: [{
      drawer: 'gallery', rank: 10, title: 'World map', about: 'The countries a member has photos from, on a map of the world. Yours, or another member’s.',
      build: () => [h('button', { id: 'wmOpen', type: 'button', class: 'btn', text: 'Open the world map' })]
    }],
    keys: {
      worldmap: { code: 'KeyG', label: 'Open the world map (globe)', run: () => { worldMapOpen(); return true; }, hintOrder: 60 }
    },
    init: () => {
      const text = () => { $('wmOpen').textContent = `Open the world map (${keyOf('worldmap')})`; };
      text();
      window.addEventListener('pmg-keys', text);
      $('wmOpen').onclick = () => worldMapOpen();
    }
  });
