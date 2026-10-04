  /* =====================================================================
   *  START  (once the panel exists: mount the features, then do what this page needs)
   * ===================================================================== */
  // Cloudflare check page in this tab? Tell the tab that is opening the others to stop.
  if (/just a moment|attention required|un instant|checking your browser/i.test(document.title) || document.querySelector('#challenge-form, .cf-error-details')) {
    store.set('cfhit', String(Date.now()));
  }
  mountApp();
  if (here.edit) { if ($('autoFill').checked) fillDescription(); }
  else if (!backToGallery()) { autoEdit(); resumeLikeRun(); }
  batchOnLoad().catch(() => {});
