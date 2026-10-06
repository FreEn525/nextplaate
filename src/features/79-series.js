  /* =====================================================================
   *  SERIES  (the letters around the digits of a plate: HF-137-QQ is in the series HF-*-QQ)
   *    Two places:
   *    - the plate card of the upload page: how many photos of the series of the plate you already have (the site's quick search,
   *      gallery.php?fastsearch=HF * QQ&usr=<you>, one request through the shared queue, kept for the visit);
   *    - a series page of the site (/fr/series-HF-QQ-1, the 999 numbers of a series): how many numbers are on the site, which
   *      ones, and how many photos of the series you have.
   *    Only the countries whose plates and series pages were checked on the real site are listed in SERIES.
   * ===================================================================== */
  // country -> how the plate gives its series: the two groups of letters around the digits
  const SERIES = { fr: /^([A-Z]{2})[\s-]\d{3}[\s-]([A-Z]{2})$/ };
  const seriesCache = new Map();      // address -> count

  // { letters: ['HF', 'QQ'], query: 'HF * QQ', label: 'HF-*-QQ' } for a plate of a listed country, else null
  function seriesOf(cc, plate) {
    const m = SERIES[cc] && SERIES[cc].exec(String(plate).toUpperCase());
    return m ? { query: `${m[1]} * ${m[2]}`, label: `${m[1]}-*-${m[2]}` } : null;
  }

  const seriesGallery = (cc, query, me) => `/${cc}/gallery.php?fastsearch=${encodeURIComponent(query)}&usr=${me}`;

  async function seriesMine(url) {
    if (seriesCache.has(url)) return seriesCache.get(url);
    const n = await profileCount(url);                                       // 76-profile.js: the count a gallery page announces
    seriesCache.set(url, n);
    return n;
  }

  // The line of the plate card; it fills itself when the count comes. null when the plate has no series or you are not known
  function seriesLine(plate) {
    const me = membersMe(), series = featureOn('series') && me && seriesOf(here.country, plate);
    if (!series) return null;
    const url = seriesGallery(here.country, series.query, me.id);
    const num = h('a', { class: 'mine-n', href: url, target: '_blank', rel: 'noopener noreferrer', text: '…', title: 'Opens your photos of this series in a new tab' });
    const line = h('div', { class: 'stat' }, num, h('span', { class: 'mute', text: `your photos in the series ${series.label}` }));
    seriesMine(url).then(n => { num.textContent = String(n); }, e => { line.replaceChildren(h('span', { class: 'mute', text: 'Series not counted: ' + e.message })); });
    return h('div', { class: 'stats' }, line);
  }

  // A series page: the numbers on the site are the cells with a photo (the others offer to upload that number)
  function seriesPage() {
    const m = location.pathname.match(/^\/([a-z]{2})\/series-([A-Z]{2})-([A-Z]{2})-\d+/i);
    const table = document.querySelector('table.table-condensed');
    const card = m && table && inlineCard({ id: 'pmg-series-card', title: `Series ${m[2].toUpperCase()}-*-${m[3].toUpperCase()}`, before: table, closable: false });
    if (!card) return;
    const cells = [...table.querySelectorAll('td')], present = cells.filter(td => td.querySelector('a[href*="/nomer"]'));
    const numbers = present.map(td => ({ n: td.textContent.trim(), href: td.querySelector('a[href*="/nomer"]').getAttribute('href') })).sort((a, b) => a.n.localeCompare(b.n));
    const mine = h('a', { class: 'mine-n', text: '…' });
    const me = membersMe();
    card.body.append(h('div', { class: 'cardbox' },
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', { text: `${present.length} / ${cells.length}` }), h('span', { class: 'mute', text: 'numbers on the site' })),
        me ? h('div', { class: 'stat' }, mine, h('span', { class: 'mute', text: 'your photos in this series' })) : null),
      present.length ? h('div', { class: 'pills' }, numbers.map(x => h('a', { class: 'pill', href: x.href, text: x.n, title: 'Opens the photo' }))) : h('p', { class: 'hint', text: 'No number of this series is on the site yet.' })));
    if (me) {
      const url = seriesGallery(m[1].toLowerCase(), `${m[2].toUpperCase()} * ${m[3].toUpperCase()}`, me.id);
      mine.href = url; mine.target = '_blank'; mine.rel = 'noopener noreferrer';
      seriesMine(url).then(n => { mine.textContent = String(n); }, e => { card.message('Not counted: ' + e.message); });
    }
  }

  registerFeature({
    id: 'series', label: 'Series counter',
    init: () => { if (/\/series-[A-Z]{2}-[A-Z]{2}-\d+/i.test(location.pathname) && featureOn('series')) seriesPage(); }
  });
