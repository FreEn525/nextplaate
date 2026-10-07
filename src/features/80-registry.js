  /* =====================================================================
   *  OFFICIAL REGISTER  (plate card of the upload page, for the countries of src/lib/registries.js)
   *    A button asks the open register of the country about the plate (make, model, year, colour, end of the inspection) and shows
   *    the answer; where the make is written in the alphabet of the menus, "Fill the menus" compares it with them like Lens does.
   *    The plate is sent to that register only when the button is clicked, and the answer is kept for the visit.
   * ===================================================================== */
  const registryCache = new Map();      // address -> facts (or null when the register has no such plate)

  async function registryAsk(reg, plate) {
    const url = reg.url(plate);
    if (registryCache.has(url)) return registryCache.get(url);
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error('the register answered ' + res.status);
      const facts = reg.read(await res.json());
      registryCache.set(url, facts);
      return facts;
    } finally { clearTimeout(timer); }
  }

  // The first choice of each menu for the text of the answer, or [] when the menus do not know the make
  function registryPath(facts) {
    const rows = vehicleGuess([`${facts.make} ${facts.model} ${facts.year}`], vehicleData());
    const path = [];
    for (const r of rows) { if (!r.candidates[0]) break; path.push(r.candidates[0].id); }
    return path;
  }

  // The register is open public data (the vehicles of the road, the same facts as the plate itself shows), so the script may ask it by itself:
  // two switches in Settings, on by default. The menus are only filled when they are all empty and once per plate: a choice of yours is
  // never overwritten.
  settings.define('registry_auto', '1', 'Ask the open register by itself (NL, IL)', 'registry');
  settings.define('registry_fill', '1', 'Fill the empty menus from the register', 'registry');
  const registryFilled = new Set();

  // The block of the plate card; null when the country has no register, the plate is not of its shape or the feature is off
  function registryLine(plate) {
    const reg = REGISTRIES[here.country];
    const asked = reg && featureOn('registry') && reg.plate(plate);
    if (!asked) return null;
    const out = h('div', { class: 'ln' });
    const menusEmpty = () => vehicleCurrent().every(v => !(+v > 0 && +v !== 200));
    const ask = h('button', { type: 'button', class: 'btn ghost sm', text: `Ask ${reg.name}`, title: 'Sends this plate to that open register', onclick: () => run() });
    const show = (...kids) => out.replaceChildren(...kids.filter(Boolean));       // a null child would be written as the word "null"
    async function run() {
      ask.disabled = true;
      show(h('span', { class: 'mute', text: 'Asking\u2026' }));
      try {
        const facts = await registryAsk(reg, asked);
        if (!facts) { show(h('span', { class: 'mute', text: 'This plate is not in that register.' })); return; }
        const path = registryPath(facts);
        const text = [facts.make, facts.model, facts.year, facts.colour, facts.until ? 'inspection until ' + facts.until : ''].filter(Boolean).join(' \u00b7 ');
        const filled = path.length && settings.on('registry_fill') && out.isConnected && !registryFilled.has(asked) && menusEmpty();
        if (filled) { registryFilled.add(asked); vehicleFill(path); }
        show(h('b', { text }), filled ? h('span', { class: 'mute', text: 'menus filled' }) : null,
          path.length && !filled ? h('button', { type: 'button', class: 'btn sm', text: 'Fill the menus', onclick: () => vehicleFill(path) }) : null);
      } catch (e) { show(h('span', { class: 'mute', text: 'Not read: ' + (e.name === 'AbortError' ? 'no answer in 15 s' : e.message) })); ask.hidden = false; ask.disabled = false; }
    }
    ask.hidden = settings.on('registry_auto');                                // by itself: the button only comes back if the asking fails
    if (settings.on('registry_auto')) run();
    return h('div', { class: 'sec' }, h('div', { class: 'cat', text: 'Official register (' + reg.name + ')' }), out, ask);
  }

  registerFeature({
    id: 'registry', label: 'Official register (NL, IL)',
    groups: [{
      drawer: 'settings', rank: 40, title: 'Official register', about: 'Public open data (RDW for the Netherlands, data.gov.il for Israel): the plate you typed is sent to it, nothing else.',
      build: () => ['registry_auto', 'registry_fill'].map(id => {
        const box = h('input', { type: 'checkbox', checked: settings.on(id) });
        box.onchange = () => settings.set(id, box.checked ? '1' : '0');
        return h('label', { class: 'chk' }, box, settings.list('registry').find(d => d.id === id).label);
      })
    }],
    init: () => {}
  });
