  /* =====================================================================
   *  PHOTO DETECTION
   * ===================================================================== */
  // Works on the main photo (/m/) and on thumbnails (/s/): both sit inside a link to nomerXXXX
  function findPhoto(el) {
    if (!el || !el.closest) return null;
    let img = el.closest('img');
    if (!img) { const a = el.closest('a'); if (a) img = a.querySelector('img'); }
    if (!img || !img.src) return null;
    const m = img.src.match(/\/\/(img\d+)\.platesmania\.com\/(\d+)\/\w\/(\d+)\.jpg/i);
    if (!m) return null;
    const a = img.closest('a');
    const lm = ((a && a.href) || location.href).match(/platesmania\.com\/([a-z]{2})\//i);
    return {
      img,
      photo: { srv: m[1], folder: m[2], id: m[3], lang: lm ? lm[1] : 'de',
               alt: (img.alt || '').replace(/['"<>]/g, '').trim(), thumb: img.src }
    };
  }

