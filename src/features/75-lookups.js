  /* =====================================================================
   *  PLATE LOOKUP LINKS  (the plate you type, one click from the public pages that know it)
   *    For the plate the form reads (src/lib/plate), a link to each public lookup site of the country (src/lib/lookups.js), and to
   *    a picture search. They are plain links that open in a new tab: nothing is sent anywhere before a click. They are in the
   *    plate card above the vehicle menus and in the Search drawer. In Settings each site can be hidden.
   * ===================================================================== */
  const lookupHidden = () => new Set((store.get('lookup_hidden', '') || '').split(',').filter(Boolean));

  // The links for a plate, minus the sites the user hid; null when there is no plate or nothing to show
  function lookupLinks(plate) {
    if (!plate || !featureOn('lookup')) return null;
    const hidden = lookupHidden();
    const sites = lookupFor(here.country, plate).filter(s => !hidden.has(s.key));
    if (!sites.length) return null;
    return h('div', { class: 'lookups' }, h('div', { class: 'cat', text: 'Look up this plate' }),
      h('div', { class: 'pills' }, sites.map(s => h('a', { class: 'pill', href: s.href, target: '_blank', rel: 'noopener noreferrer', text: s.name, title: 'Opens ' + s.name + ' in a new tab' }))));
  }

  // The drawer shows the same links, for the plate of the form
  function lookupRefresh(plate) {
    const box = $('lookupBox');
    if (!box) return;
    box.replaceChildren(...[lookupLinks(plate) || h('p', { class: 'presult', text: plate ? 'No lookup site for this country.' : 'Type the plate in the form to see the sites.' })]);
  }

  // Settings: a box per site, to hide the ones that are of no use (a site that failed, or that you never open)
  function lookupPicker() {
    const hidden = lookupHidden();
    const save = () => store.set('lookup_hidden', [...hidden].join(','));
    const rows = [];
    for (const cc of Object.keys(LOOKUP_SITES)) {
      const country = cc === '*' ? 'Every country' : cName(cc);
      for (const s of LOOKUP_SITES[cc]) {
        const key = cc + '|' + s.name;
        const box = h('input', { type: 'checkbox', checked: !hidden.has(key) });
        box.onchange = () => { box.checked ? hidden.delete(key) : hidden.add(key); save(); checkPlate(true); };                                  // the plate is checked again (from the cache: no request) and both places redraw
        rows.push(h('label', { class: 'chk' }, box, h('span', { text: s.name }), h('span', { class: 'mute', text: ' · ' + country })));
      }
    }
    return h('div', { class: 'pickrows' }, rows);
  }

  registerFeature({
    id: 'lookup', label: 'Plate lookup links',
    groups: [{
      drawer: 'search', title: 'Look up the plate', about: "Links to public lookup sites for the plate you typed. Nothing is sent before you click.", pages: ['add'],
      build: () => [h('div', { id: 'lookupBox' })]
    }, {
      drawer: 'settings', title: 'Lookup sites',
      build: () => [h('p', { class: 'presult', text: 'Untick the sites you never use. They are only links: nothing is sent before you click.' }), lookupPicker()]
    }],
    init: () => lookupRefresh(plateForForm())
  });
