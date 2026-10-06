  /* =====================================================================
   *  BRIDGE  (ask a job of another site, in another tab, and wait for the answer)
   *    The browser keeps sites apart: a PlatesMania page cannot read what a Google page holds. The script runs on both and shares
   *    one small memory (GM_setValue / GM_getValue), so a job is a request left there and an answer left back:
   *
   *      this side      bridgeAsk('lens', { photo }, 'https://www.google.com/?x', { background: true }).then(titles => ...)
   *      other side     const request = bridgePending('lens');               // null when nobody asked
   *                     ... do the work on that page ...
   *                     bridgeAnswer('lens', request, titles);
   *
   *    The tab that was opened for the job is closed once the answer is in (opts.close, default true); when nothing comes back it stays
   *    open, so the user can see the page. A job has a name ('lens'); a new request replaces the old one; an answer carries the stamp of its request, so an answer to an
   *    older request is never taken for the new one. Only function declarations: the other side starts from core/00-open.js,
   *    before the rest of the script is set up. Needs GM_setValue, GM_getValue (and GM_openInTab) in the header.
   * ===================================================================== */
  function bridgeKey(job, part) { return 'br_' + job + '_' + part; }

  // Leaves the request, opens the page of the other site, resolves with the answer (rejects after opts.timeout seconds, default 120),
// then closes that tab unless opts.close is false
  function bridgeAsk(job, payload, url, opts) {
    const o = Object.assign({ background: false, timeout: 120, close: true }, opts);
    const stamp = Date.now();
    GM_setValue(bridgeKey(job, 'req'), JSON.stringify({ stamp, payload }));
    GM_setValue(bridgeKey(job, 'res'), '');
    let tab = null;
    try { if (typeof GM_openInTab === 'function') tab = GM_openInTab(url, { active: !o.background, insert: true, setParent: true }); } catch (e) { /* the popup below */ }
    if (!tab) tab = window.open(url, '_blank');
    if (!tab) return Promise.reject(new Error('could not open the tab'));
    return new Promise((ok, no) => {
      let waited = 0;
      const timer = setInterval(() => {
        const raw = GM_getValue(bridgeKey(job, 'res'), '');
        const got = raw ? JSON.parse(raw) : null;
        if (got && got.stamp === stamp) {
          clearInterval(timer);
          if (o.close) { try { tab.close(); } catch (e) { /* the user may have closed it already */ } }
          ok(got.data);
        }
        else if (++waited > o.timeout) { clearInterval(timer); no(new Error('no answer')); }
      }, 1000);
    });
  }

  // The other side: the request that waits, { stamp, payload }; null when there is none, when it is older than maxAge seconds
  // (default 180) or when it was answered already
  function bridgePending(job, maxAge) {
    const raw = GM_getValue(bridgeKey(job, 'req'), '');
    if (!raw) return null;
    const request = JSON.parse(raw);
    if (Date.now() - request.stamp > (maxAge || 180) * 1000 || GM_getValue(bridgeKey(job, 'done'), 0) === request.stamp) return null;
    return request;
  }

  function bridgeAnswer(job, request, data) {
    GM_setValue(bridgeKey(job, 'res'), JSON.stringify({ stamp: request.stamp, data }));
    GM_setValue(bridgeKey(job, 'done'), request.stamp);
  }
