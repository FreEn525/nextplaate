  /* =====================================================================
   *  COUNTRY FLAGS  (one click to the upload page of a country)
   *    The flags of the 96 countries, each a link to /<country>/add. They are in the panel (Batch upload drawer) and, on the upload
   *    pages (/add and /<country>/add), right on the site, to the right of the page content:
   *      - where the screen has room beside the content, the bar stands there, wide enough for the flags but never under the
   *        panel, even with its drawer open (the rail and the drawer take 56 px + 340 px of the right edge);
   *      - on a narrower screen it moves under the photo, in the right-hand column, and the page is not widened.
   *    The flags are the site's own images (/assets/img/profile-flags/<code>.svg): nothing is downloaded from elsewhere.
   * ===================================================================== */
  const flagUrl = code => `/assets/img/profile-flags/${code}.svg`;

  // The flags as links; the country of the page is marked. An image that fails shows the code instead.
  function flagLinks() {
    return h('nav', { class: 'flags' }, COUNTRIES.map(c => {
      const img = h('img', { src: flagUrl(c.code), alt: c.name, width: 22, height: 15 });
      img.addEventListener('error', () => img.replaceWith(h('span', { class: 'flagcode', text: c.code.toUpperCase() })));
      return h('a', { class: 'flag' + (c.code === here.country ? ' on' : ''), href: `/${c.code}/add`, title: c.name }, img);
    }));
  }

  // ---- the bar on the page
  const FLAGS_GAP = 16;          // space between the content and the bar, and between the bar and the panel
  const FLAGS_MIN = 150;         // narrower than this, the bar goes under the photo
  const FLAGS_MAX = 320;
  const FLAGS_CSS = `
    :host{display:block}
    .box{background:#fff;border:1px solid var(--line);padding:10px;display:flex;flex-direction:column;gap:8px}
    .t{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--primary-h)}
  `;

  function flagsBar() {
    const host = h('div', { id: 'pmg-flags' });
    const root = host.attachShadow({ mode: 'open' });
    root.append(h('style', { text: UI_BASE + FLAGS_CSS }), h('div', { class: 'box' }, h('div', { class: 't', text: 'Add a photo in…' }), flagLinks()));
    return host;
  }

  // Beside the content when there is room for it, else under the photo. Called at start, on resize and when the page has loaded.
  function flagsPlace() {
    const host = document.getElementById('pmg-flags');
    if (!host) return;
    const content = document.querySelector('.content .container') || document.querySelector('.container');
    const vw = document.documentElement.clientWidth;
    const panel = 56 + Math.min(340, vw - 56);                       // the rail, and the drawer when it is open
    const right = content ? content.getBoundingClientRect().right : vw;
    const room = vw - panel - right - 2 * FLAGS_GAP;
    const photo = (document.getElementById('zoomimgid') || {}).parentElement;
    if (room >= FLAGS_MIN) {
      const top = (photo || content || document.body).getBoundingClientRect().top + window.scrollY;
      if (host.parentNode !== document.body) document.body.appendChild(host);
      host.style.cssText = `position:absolute;z-index:50;top:${Math.max(0, top)}px;left:${right + window.scrollX + FLAGS_GAP}px;width:${Math.min(room, FLAGS_MAX)}px`;
    } else {
      const after = document.getElementById('informer-preview-wrap') || document.getElementById('zoomimgid');
      host.style.cssText = 'position:static;margin-top:10px';
      if (after) after.parentNode.insertBefore(host, after.nextSibling);
      else if (content) content.insertBefore(host, content.firstChild);
      else document.body.appendChild(host);
    }
  }

  registerFeature({
    id: 'flags', label: 'Country flags',
    groups: [{
      drawer: 'upload', title: 'Add a photo in a country',
      build: () => [h('p', { class: 'presult', text: 'Click a flag to open the upload page of that country.' }), flagLinks()]
    }],
    init: () => {
      if (!here.addAny) return;
      document.body.appendChild(flagsBar());
      flagsPlace();
      window.addEventListener('resize', flagsPlace);
      window.addEventListener('load', flagsPlace);
    }
  });
