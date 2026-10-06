  /* =====================================================================
   *  SERIES  (the letters around the digits of a plate: HF-137-QQ is in the series HF-*-QQ)
   *    Two places:
   *    - the plate card of the upload page: how many photos of the series of the plate you already have (the site's quick search,
   *      gallery.php?fastsearch=HF * QQ&usr=<you>, one request through the shared queue, kept for the visit);
   *    - a series page of the site (/fr/series-HF-QQ-1, the 999 numbers of a series): how many numbers are on the site, which
   *      ones, and how many photos of the series you have.
   *    The series of a plate is its search with the longest run of digits as a wildcard (seriesQuery). It is switched on only for the
   *    countries where the dev tool "Series check" found the plates again on the real site (SERIES_COUNTRIES).
   * ===================================================================== */
  // The countries where the series search was checked on the real site (dev tool "Series check", 6 October 2026: two real plates per
  // country, the plate came back from its own series search). Not in the list: bh, eg, ir, ke, qa, sa (plates of digits only or in
  // Arabic or Persian digits, which the wildcard cannot replace) and ch (the plate was not among the first results: not sure).
  const SERIES_COUNTRIES = new Set('ad al am ar at ax az ba be bg br bs by cl cn cy cz de dk dz ee es fi fr ge gg gi gr gu hk hr hu id ie il iq is it je jp kg kh kr kw kz la li lt lu lv ma mc md me mk mn mp mt mx my nl no nz pl ps pt ro rs ru sc se sg si sk sm su th tj tr ua uk uz va vn'.split(' '));
  const seriesCache = new Map();      // address -> count

  // The series search of a plate: its longest run of digits (the last one when equal) becomes the wildcard, the separators become
  // spaces: HF-137-QQ -> "HF * QQ", AA 7181 -> "AA *". null when nothing is left to tell the series (a plate of digits only).
  function seriesQuery(plate) {
    const s = String(plate).toUpperCase().trim();
    let best = null;
    for (const m of s.matchAll(/\d+/g)) if (!best || m[0].length >= best[0].length) best = m;
    if (!best) return null;
    // a single letter glued after the digits, behind a separator (FAJ 04A, KTCA 881E): the site's wildcard finds nothing, so no series
    const tail = /^[^\W\d_]+/.exec(s.slice(best.index + best[0].length));
    if (/[\s-]/.test(s[best.index - 1] || '') && tail && tail[0].length === 1 && best.index + best[0].length + 1 === s.length) return null;
    const q = (s.slice(0, best.index) + '*' + s.slice(best.index + best[0].length)).split(/[\s-]+/).filter(Boolean).join(' ');
    return /[^*\s]/.test(q) ? q : null;
  }

  // { query: 'HF * QQ', label: 'HF-*-QQ' } for a plate of a country where series are switched on, else null
  function seriesOf(cc, plate) {
    const query = SERIES_COUNTRIES.has(cc) && seriesQuery(plate);
    return query ? { query, label: query.replace(/ /g, '-') } : null;
  }

  const seriesGallery = (cc, query, me) => `/${cc}/gallery.php?fastsearch=${encodeURIComponent(query)}&usr=${me}`;

  async function seriesMine(url) {
    if (seriesCache.has(url)) return seriesCache.get(url);
    const n = await profileCount(url);                                       // 76-profile.js: the count a gallery page announces
    seriesCache.set(url, n);
    return n;
  }

  // The sentence of the plate card; the number fills itself when the count comes. null when the plate has no series or you are not known
  function seriesLine(plate) {
    const me = membersMe(), series = featureOn('series') && me && seriesOf(here.country, plate);
    if (!series) return null;
    const url = seriesGallery(here.country, series.query, me.id);
    const num = h('a', { class: 'mine-n', href: url, target: '_blank', rel: 'noopener noreferrer', text: '\u2026', title: 'Opens your photos of this series in a new tab' });
    const line = h('div', { class: 'ln' }, h('span', null, 'In the series ', h('b', { text: series.label }), ': you have ', num, h('span', { class: 'plural' }, ' photos')));
    seriesMine(url).then(n => { num.textContent = String(n); line.querySelector('.plural').textContent = n === 1 ? ' photo' : ' photos'; },
      e => { line.replaceChildren(h('span', { class: 'mute', text: 'Series not counted: ' + e.message })); });
    return line;
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
