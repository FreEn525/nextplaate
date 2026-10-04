  /* =====================================================================
   *  BACK TO THE GALLERY WHEN EVERYTHING IS DONE
   * ===================================================================== */
  // Remember the last gallery / user page visited (and how far it was scrolled)
  const isGalleryPage = /\/gallery(\.php)?$/i.test(location.pathname) || /\/user\d+\/?$/i.test(location.pathname);
  if (isGalleryPage) {
    store.set('lastGallery', location.href);
    if (store.get('restoreScroll', '0') === '1') {
      store.set('restoreScroll', '0');
      const y = Number(store.get('lastGalleryScroll', '0')) || 0;
      setTimeout(() => window.scrollTo(0, y), 150);
    }
    window.addEventListener('pagehide', () => store.set('lastGalleryScroll', String(window.scrollY)));
  }

  // After the second photo is saved the site shows its photo page: that is the signal to go back
  function backToGallery() {
    if (!$('autoReturn').checked || onEditPage) return false;
    if (store.get('returnPending', '0') !== '1') return false;
    if (!(state.front && state.rear)) return false;
    const m = location.pathname.match(/\/nomer(\d+)/i);
    if (!m || (m[1] !== state.front.id && m[1] !== state.rear.id)) return false;
    store.set('returnPending', '0');
    const url = store.get('lastGallery', '');
    if (!url) { setStatus('All done. (No gallery page remembered to go back to.)'); return true; }
    store.set('restoreScroll', '1');
    setStatus('All done. Going back to your gallery…');
    setTimeout(() => { location.href = url; }, 600);
    return true;
  }

