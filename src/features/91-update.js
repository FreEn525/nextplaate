  /* =====================================================================
   *  UPDATE  (a click on the logo of the panel: is there a newer version of the script?)
   *    Asks Greasy Fork for the header of the published script (one small file, only when the logo is clicked; up to three tries) and compares its
   *    @version with this one. A newer one: a button opens the install page, where Tampermonkey offers the update. Greasy Fork
   *    answers with access-control-allow-origin: *, so a plain fetch works and no extra permission is needed.
   *    The dev build is never compared with the published script: it is updated by building it again.
   * ===================================================================== */
  const UPDATE_META = 'https://update.greasyfork.org/scripts/598722/NextPlaate.meta.js';
  const UPDATE_INSTALL = 'https://update.greasyfork.org/scripts/598722/NextPlaate.user.js';

  // true when version a is newer than b, comparing the numbers one by one: 5.10 is newer than 5.9.1
  function versionNewer(a, b) {
    const x = String(a).split('.').map(n => +n || 0), y = String(b).split('.').map(n => +n || 0);
    for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d > 0; }
    return false;
  }

  // The version of the published script, from its header. Three tries, a pause longer each time (a first request that fails is often
  // a hiccup), and a new address each time: a copy kept by a cache between Greasy Fork and you cannot hide a version just published.
  async function updateLatest() {
    let failure;
    for (const pause of [0, 1500, 4000]) {
      if (pause) await new Promise(r => setTimeout(r, pause));
      const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 10000);
      try {
        const res = await fetch(`${UPDATE_META}?t=${Date.now()}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('Greasy Fork answered ' + res.status);
        const m = /@version\s+(\S+)/.exec(await res.text());
        if (!m) throw new Error('no version in the answer');
        return m[1];
      } catch (e) { failure = e; } finally { clearTimeout(timer); }
    }
    throw failure;
  }

  function updateOpen() {
    const status = h('p', { class: 'hint', text: 'Checking Greasy Fork…' });
    const install = h('button', { type: 'button', class: 'btn', text: 'Update now', hidden: true, onclick: () => {
      try { if (typeof GM_openInTab === 'function') { GM_openInTab(UPDATE_INSTALL, { active: true }); return; } } catch (e) { /* the plain way below */ }
      window.open(UPDATE_INSTALL, '_blank', 'noopener');
    } });
    const again = h('button', { type: 'button', class: 'btn ghost', text: 'Check again', onclick: () => check() });
    const modal = modalOpen({ id: 'pmg-update', title: 'NextPlaate ' + SCRIPT_VERSION,
      body: h('div', { class: 'cardbox' }, status, h('div', { class: 'cardrow' }, install, again)) });         // no second Close at the foot: the one of the header is the only one
    modal.message(`by ${AUTHOR.name}`);
    async function check() {
      install.hidden = true;
      if ('__DEBUG__' === '1') { status.textContent = 'This is the dev build: it is updated by building it again, not from Greasy Fork.'; return; }
      status.textContent = 'Checking Greasy Fork…';
      try {
        const latest = await updateLatest();
        if (versionNewer(latest, SCRIPT_VERSION)) { status.textContent = `Version ${latest} is available (you have ${SCRIPT_VERSION}). Update now opens the install page: Tampermonkey offers the update there.`; install.hidden = false; }
        else status.textContent = `You have the latest version (${SCRIPT_VERSION}).`;
      } catch (e) { status.textContent = 'Could not check: ' + (e.name === 'AbortError' ? 'no answer in 10 s' : e.message) + '.'; }
    }
    check();
  }

  registerFeature({
    init: () => { for (const id of ['logo', 'rver']) { const el = $(id); if (el) el.onclick = updateOpen; } }       // the logo, and the version at the foot of the rail
  });
