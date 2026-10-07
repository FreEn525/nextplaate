  /* =====================================================================
   *  UPDATE NOTICE  (a notice when the script has a newer version, on joining the site and while a page stays open)
   *    About every 20 minutes (a time 15 to 25 minutes ahead is kept in the browser, so the tabs share it and the users do not all ask
   *    at the same moment), when a PlatesMania page is open and in view, the script asks Greasy Fork for the version of the published
   *    script (the same file as a click on the logo, 1.3 KB, 91-update.js) and, if it is newer than this one, shows a notice with a
   *    link to the install page, where Tampermonkey offers the update. Tampermonkey updates by itself only every few hours: a version
   *    published meanwhile, or several in a row, is announced here (the cross or the link says "not again for this version"; letting
   *    the notice go by does not). A page that stays open looks again by itself (a timer every 5 minutes asks if it is time). A look that
   *    fails is tried again in 10 minutes. Never in the dev build (it is updated by building it again). Switch off in Settings.
   * ===================================================================== */
  const UPDATE_EVERY_MS = 20 * 60000;

  async function updateNotice() {
    if ('__DEBUG__' === '1') return;
    const now = Date.now();
    if (now < (+store.get('update_due', '0') || 0)) return;                                       // not time yet: another look is due later (here or in another tab)
    store.set('update_due', String(now + UPDATE_EVERY_MS * (0.75 + Math.random() * 0.5)));
    let latest;
    try { latest = await updateLatest(); } catch (e) { store.set('update_due', String(now + 600000)); return; }       // failed: again in 10 minutes
    if (!versionNewer(latest, SCRIPT_VERSION) || store.get('update_dismissed', '') === latest) return;
    toast({ title: `NextPlaate ${latest} is available`, body: `You have ${SCRIPT_VERSION}. Click here to install it now; Tampermonkey also updates it by itself.`, href: UPDATE_INSTALL, kind: 'update', ms: 20000,
      onClose: () => store.set('update_dismissed', latest) });
  }

  registerFeature({
    id: 'updatenotice', label: 'Update notice',
    groups: [],
    init: () => {
      const look = () => { if (document.visibilityState === 'visible') updateNotice(); };
      setTimeout(look, 3000 * siteScale());                                                       // a moment after the page, not with it
      document.addEventListener('visibilitychange', () => setTimeout(look, 1000 * siteScale()));  // a tab brought back into view looks if it is time
      setInterval(look, 300000 * siteScale());                                                    // a page that stays open asks every 5 minutes if it is time
    }
  });
