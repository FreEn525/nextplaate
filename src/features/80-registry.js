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

  // The block of the plate card; null when the country has no register, the plate is not of its shape or the feature is off
  function registryLine(plate) {
    const reg = REGISTRIES[here.country];
    const asked = reg && featureOn('registry') && reg.plate(plate);
    if (!asked) return null;
    const out = h('div', { class: 'cardrow' });
    const ask = h('button', { type: 'button', class: 'btn ghost sm', text: `Ask ${reg.name}`, title: 'Sends this plate to that open register', onclick: async () => {
      ask.disabled = true;
      out.replaceChildren(h('span', { class: 'mute', text: 'Asking…' }));
      try {
        const facts = await registryAsk(reg, asked);
        if (!facts) { out.replaceChildren(h('span', { class: 'mute', text: 'No such plate in that register.' })); return; }
        const path = registryPath(facts);
        const text = [facts.make, facts.model, facts.year, facts.colour, facts.until ? 'inspection until ' + facts.until : ''].filter(Boolean).join(' · ');
        out.replaceChildren(h('b', { text }), path.length ? h('button', { type: 'button', class: 'btn sm', text: 'Fill the menus', onclick: () => vehicleFill(path) }) : null);
      } catch (e) { out.replaceChildren(h('span', { class: 'mute', text: 'Not read: ' + (e.name === 'AbortError' ? 'no answer in 15 s' : e.message) })); ask.disabled = false; }
    } });
    return h('div', { class: 'cardrow' }, ask, out);
  }

  registerFeature({ id: 'registry', label: 'Official register (NL, IL)', init: () => {} });
