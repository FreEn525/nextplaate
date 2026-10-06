  /* =====================================================================
   *  PLATE PICTURES  (the picture of a plate, for the lines of a profile that name a photo)
   *    The site shows a plate as text in its lists, and as a picture ("inf" image) only on the photo's own page, under a name that cannot
   *    be guessed. It is read there through the shared queue, for what is in view only, and kept in the browser (the same photo twice
   *    costs nothing, even a week later).
   *      plateWatch(el, link, show)   when el comes in view, reads the plate picture of the photo link points to, then show(src)
   * ===================================================================== */
  const PLATE_PICTURES = 'plate_pictures';
  const PLATE_PICTURES_KEEP = 500;
  const platePictures = (() => { try { return JSON.parse(store.get(PLATE_PICTURES, '{}')); } catch (e) { return {}; } })();

  async function plateRead(href) {
    const id = (String(href).match(/nomer(\d+)/) || [])[1];
    if (!id) return '';
    if (!platePictures[id]) {
      try {
        const img = new DOMParser().parseFromString(await siteFetch(href), 'text/html').querySelector('img[src*="/inf/"]');
        if (img) {
          platePictures[id] = img.getAttribute('src');
          const ids = Object.keys(platePictures);
          if (ids.length > PLATE_PICTURES_KEEP) delete platePictures[ids[0]];
          store.set(PLATE_PICTURES, JSON.stringify(platePictures));
        }
      } catch (e) { return ''; }                                               // the text stays
    }
    return platePictures[id] || '';
  }

  const plateWatching = new Map();                                             // element -> { link, show }
  const plateEyes = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    plateEyes.unobserve(e.target);
    const job = plateWatching.get(e.target);
    plateWatching.delete(e.target);
    if (job) plateRead(job.link.getAttribute('href')).then(src => { if (src) job.show(src); });
  }), { rootMargin: '80px' }) : null;

  function plateWatch(el, link, show) {
    if (!plateEyes || !link) return;
    const id = (link.getAttribute('href').match(/nomer(\d+)/) || [])[1];
    if (id && platePictures[id]) { show(platePictures[id]); return; }          // known: at once, no request
    plateWatching.set(el, { link, show });
    plateEyes.observe(el);
  }
