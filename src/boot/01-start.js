  /* =====================================================================
   *  START  (once the panel exists: mount the features, then do what this page needs)
   * ===================================================================== */
  // Cloudflare check page in this tab? Tell the tab that is opening the others to stop.
  if (/just a moment|attention required|un instant|checking your browser/i.test(document.title) || document.querySelector('#challenge-form, .cf-error-details')) {
    store.set('cfhit', String(Date.now()));
  }
    // a banner in the console, once: the name and the version (replace with an ASCII art when it is chosen)
  console.log('%c NextPlaate %c v' + (typeof GM_info !== 'undefined' && GM_info.script ? GM_info.script.version : '') + ' ', 'background:#3781c5;color:#fff;font:bold 14px monospace;padding:2px 6px;border-radius:4px', 'color:#3781c5;font:12px monospace');
mountApp();
  if (here.edit) { if ($('autoFill').checked) fillDescription(); }
  else if (!backToGallery()) { autoEdit(); resumeLikeRun(); }
  batchOnLoad().catch(() => {});
