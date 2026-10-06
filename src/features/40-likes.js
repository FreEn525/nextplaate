  /* =====================================================================
   *  LIKE THE PHOTOS SHOWN ON THE PAGE
   * ===================================================================== */
  // Each photo has <i id="unit_ul{ID}" class="fa fa-heart-o rating" onclick="snd1ReqqGal(...)">.
  // Only hearts that are still empty (fa-heart-o) are clicked, each at most once,
  // so a photo you already liked can never be un-liked by mistake.
  //
  // Multi-page mode: with "Pages to like" > 1 the run is saved in localStorage ("likeRun"), the script
  // likes the page, goes to the next one, and resumes automatically after each page load until the
  // requested number of pages is done. A run is dropped if it goes stale (> 60 s without progress),
  // if you leave the gallery it started on, or if you stop it (button, L or Esc).
  const MAX_PAGES = 50;
  const clickedLikes = new Set();
  let liking = false, stopLiking = false;

  const getRun = () => { try { return JSON.parse(store.get('likeRun', 'null')); } catch (e) { return null; } };
  const setRun = r => store.set('likeRun', r ? JSON.stringify(r) : 'null');
  // Same gallery = same address without the page number
  const galleryKey = () => {
    const p = new URLSearchParams(location.search); p.delete('start');
    return location.pathname + '?' + [...p.entries()].map(([k, v]) => k + '=' + v).sort().join('&');
  };
  const pagesWanted = () => Math.min(MAX_PAGES, Math.max(1, parseInt($('pages').value, 10) || 1));


  const unlikedHearts = () =>
    [...document.querySelectorAll('i.rating.fa-heart-o[id^="unit_ul"]')].filter(el => !clickedLikes.has(el.id));

  window.addEventListener('pmg-keys', () => { if ($('likeAll')) updateLikeBtn(); });          // a key was changed: the button says the new one
  function updateLikeBtn() {
    if (liking) return;
    const b = $('likeAll'), r = getRun();
    if (r) { b.disabled = false; b.textContent = `Stop auto-like (page ${r.done + 1}/${r.total}) (${keyOf('like')})`; return; }
    const n = unlikedHearts().length, pages = pagesWanted();
    if (pages > 1) {
      b.disabled = !document.querySelector('i.rating[id^="unit_ul"]');
      b.textContent = `Like ${pages} pages from this one (${keyOf('like')})`;
    } else {
      b.disabled = n === 0;
      b.textContent = n ? `Like ${n} photo${n > 1 ? 's' : ''} on this page (${keyOf('like')})` : 'No photos to like on this page';
    }
  }

  // Likes every empty heart of the current page; returns how many were clicked
  async function likePage(label) {
    const list = unlikedHearts();
    const delay = Math.max(100, parseInt($('delay').value, 10) || 200);
    const b = $('likeAll');
    let done = 0;
    for (const el of list) {
      if (stopLiking) break;
      b.textContent = `Stop (${label}${done + 1}/${list.length})`;
      clickedLikes.add(el.id);
      el.click();
      done++;
      await new Promise(r => setTimeout(r, delay));
    }
    return done;
  }

  function cancelLikeRun(msg) {
    setRun(null);
    if (liking) stopLiking = true;
    updateLikeBtn();
    if (msg) setStatus(msg);
  }

  // One step of a multi-page run: like this page, then move to the next one (or finish)
  async function runStep() {
    const r = getRun();
    if (!r) return;
    liking = true; stopLiking = false;
    const done = await likePage(`page ${r.done + 1}/${r.total} · `);
    const stopped = stopLiking;
    liking = false; stopLiking = false;
    if (stopped || !getRun()) { setRun(null); updateLikeBtn(); setStatus(`Stopped on page <b>${r.done + 1}</b>. <b>${r.liked + done}</b> photo${r.liked + done > 1 ? 's' : ''} liked.`); return; }

    r.done += 1; r.liked += done; r.ts = Date.now();
    const href = pageHref(+1);
    if (r.done >= r.total || !href) {
      setRun(null); updateLikeBtn();
      setStatus(r.done >= r.total
        ? `Done: <b>${r.liked}</b> photo${r.liked > 1 ? 's' : ''} liked over <b>${r.done}</b> page${r.done > 1 ? 's' : ''}.`
        : `Reached the last page after <b>${r.done}</b> page${r.done > 1 ? 's' : ''}: <b>${r.liked}</b> liked.`);
      return;
    }
    setRun(r);
    updateLikeBtn();
    setStatus(`Page <b>${r.done}/${r.total}</b> done (${r.liked} liked). Next page…`);
    // Let the last like request finish before leaving the page
    setTimeout(() => { if (getRun()) location.href = href; }, 700);
  }

  async function likeAll() {
    if (liking || getRun()) { cancelLikeRun('Auto-like stopped.'); return; } // second click = stop
    const pages = pagesWanted();
    if (pages > 1) {
      setRun({ total: pages, done: 0, liked: 0, key: galleryKey(), ts: Date.now() });
      runStep();
      return;
    }
    const list = unlikedHearts();
    if (!list.length) return;
    liking = true; stopLiking = false;
    const done = await likePage('');
    const stopped = stopLiking;
    liking = false; stopLiking = false;
    updateLikeBtn();
    setStatus(stopped ? `Stopped after <b>${done}</b> like${done > 1 ? 's' : ''}.` : `Liked <b>${done}</b> photo${done > 1 ? 's' : ''}.`);
  }

  // A multi-page run resumes by itself after each page load
  function resumeLikeRun() {
    const r = getRun();
    if (!r) return;
    const fresh = Date.now() - (r.ts || 0) < 60000;
    if (!fresh || r.key !== galleryKey() || !document.querySelector('i.rating[id^="unit_ul"]')) {
      setRun(null); updateLikeBtn(); // stale, or left the gallery it started on
      return;
    }
    setStatus(`Auto-like: page <b>${r.done + 1}/${r.total}</b>…`);
    setTimeout(() => { if (getRun()) runStep(); }, 600); // short pause so the page is fully loaded
  }


  registerFeature({
    id: 'likes', label: 'Likes',
    groups: [{
      drawer: 'gallery', title: 'Likes', about: "Like this page, or several pages in a row, with a pause between likes.", pages: ['gallery'],
      build: () => [
        h('button', { id: 'likeAll', class: 'btn ghost', disabled: true, text: 'Like this page' }),
        h('div', { class: 'row' }, h('label', { for: 'pages', text: 'Pages to like' }), h('input', { type: 'number', id: 'pages', min: 1, step: 1 })),
        h('div', { class: 'row' }, h('label', { for: 'delay', text: 'Delay between likes (ms)' }), h('input', { type: 'number', id: 'delay', min: 100, step: 50 }))
      ]
    }],
    keys: {
      like: { code: 'KeyL', label: 'Like the page',
        run: () => { // like this page (or "Pages to like" pages); press again while running = stop
          if (liking || getRun() || unlikedHearts().length || (pagesWanted() > 1 && document.querySelector('i.rating[id^="unit_ul"]'))) { likeAll(); return true; }
          if (document.querySelector('i.rating[id^="unit_ul"]')) { setStatus('Nothing left to like on this page.'); return true; }
          return false;
        },
        hintOrder: 30
      }
    },
    onEscape: () => { if (!(liking || getRun())) return false; cancelLikeRun('Auto-like stopped.'); return true; },
    escOrder: 30,
    init: () => {
      $('delay').value = store.get('delay', '200');
      $('delay').oninput = () => store.set('delay', $('delay').value);
      $('pages').value = store.get('pages', '1');
      $('pages').oninput = () => { store.set('pages', $('pages').value); updateLikeBtn(); };
      $('pages').max = MAX_PAGES;
      $('likeAll').onclick = likeAll;
      host.addEventListener('mouseenter', updateLikeBtn); // pages can load photos lazily
      updateLikeBtn();
    }
  });
