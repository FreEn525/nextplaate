  // "Test all countries": one page after the other, each result kept in the browser
  // Waits for the site (block or Cloudflare) to be over, then goes back to the same country, by itself.
  // The queue is kept, so nothing is lost: the country that was running is tested again from its start.
  function ptPause(left, reason) {
    const until = siteBlockedUntil();
    const wait = Math.max(0, until - Date.now()) + 5000;
    const when = new Date(Date.now() + wait).toLocaleTimeString();
    ptMsg(`Paused (${reason}). It resumes by itself at ${when}, on ${left[0]}. Keep this tab open.`);
    setTimeout(() => {
      if (sessionStorage.getItem(PT_QUEUE) === null) { ptMsg('Stopped.'); return; }
      location.href = '/' + left[0] + '/add';
    }, wait);
  }

  async function ptStep() {
    const left = JSON.parse(sessionStorage.getItem(PT_QUEUE) || 'null');
    if (!left) return;
    if (!left.length) { sessionStorage.removeItem(PT_QUEUE); ptMsg('All countries tested. Click "Write report to folder".'); return; }
    const cc = left[0];
    if (Date.now() < siteBlockedUntil()) { ptPause(left, 'the site asked to wait'); return; }
    if (CHALLENGE.test(document.title)) { ptMsg('Cloudflare check: solve it in this tab. The run resumes on ' + cc + ' by itself after that.'); return; }
    const m = location.pathname.match(/^\/([a-z]{2})\/add\/?$/i);
    // not on the upload page of this country yet: go there first (once; a second miss means no upload page)
    if (!(m && m[1].toLowerCase() === cc)) {
      if (sessionStorage.getItem('nextplaate-plates-try') !== cc) {
        sessionStorage.setItem('nextplaate-plates-try', cc);
        location.href = '/' + cc + '/add';
        return;
      }
      await capPut('plates-skip:' + cc, location.href);           // no upload page for this country
    } else {
      await new Promise(r => setTimeout(r, 1000));
      sessionStorage.removeItem('nextplaate-plates-try');
      try {
        if (sessionStorage.getItem(PT_MODE) === 'fill') {
          await ptFillMissing();                                     // logs its own result (fill:xx)
        } else if (sessionStorage.getItem(PT_MODE) === 'types') {
          const types = await ptByType();
          await capPut('types:' + cc, { date: new Date().toISOString(), types });
          console.log('[NextPlaate] all types ' + cc, types);
        } else {
          const rows = await ptCollect();
          await capPut('plates:' + cc, { date: new Date().toISOString(), passed: rows.filter(r => r.ok).length, total: rows.filter(r => r.fits).length, other: rows.filter(r => !r.fits).length, rows });
        }
      } catch (e) {
        if (/asked to wait|check or rate limit/.test(e.message)) { ptPause(left, e.message); return; }   // the queue is kept: it resumes by itself
        // a slow or failed answer is not a block: try the same country again after a minute, 3 times at most
        const tries = +(sessionStorage.getItem('nextplaate-plates-retry') || '0') + 1;
        if (tries <= 3) {
          sessionStorage.setItem('nextplaate-plates-retry', String(tries));
          ptMsg(`${cc}: ${e.message}. Try ${tries}/3 in 60 s…`);
          setTimeout(() => { location.href = '/' + cc + '/add'; }, 60000);
          return;
        }
        sessionStorage.removeItem('nextplaate-plates-retry');
        await capPut('failed:' + cc, { date: new Date().toISOString(), error: e.message });   // not a missing page: it is tested again next time
        ptMsg(`${cc} not saved after 3 tries (${e.message}). Going on with the next country.`);
        // falls through: the country is left out and the run goes on
      }
    }
    const rest = left.slice(1);
    sessionStorage.setItem(PT_QUEUE, JSON.stringify(rest));
    sessionStorage.removeItem('nextplaate-plates-try');
    sessionStorage.removeItem('nextplaate-plates-retry');
    ptMsg(`${cc} tested. ${rest.length} left. Next in ${PT_PAUSE_MS / 1000} s…`);
    if (!rest.length) { sessionStorage.removeItem(PT_QUEUE); ptMsg('All countries tested. Click "Write report to folder".'); return; }
    setTimeout(() => {
      if (sessionStorage.getItem(PT_QUEUE) === null) { ptMsg('Stopped.'); return; }
      location.href = '/' + rest[0] + '/add';
    }, PT_PAUSE_MS);
  }

