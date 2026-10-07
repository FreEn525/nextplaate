  /* =====================================================================
   *  UPDATE NOTICE  (a notice when the script has a newer version, on joining the site)
   *    At most once every 3 hours (the time is kept in the browser, so the tabs share it: Tampermonkey updates by itself only every few hours, so a version published meanwhile is announced here sooner), when a PlatesMania page is open and in view,
   *    the script asks Greasy Fork for the version of the published script (the same small file as a click on the logo: 91-update.js)
   *    and, if it is newer than this one, shows a notice with a link to the install page, where Tampermonkey offers the update. The cross
   *    or the link says "not again for this version"; letting it go by does not (it comes back at the next look). A look that fails is
   *    tried again in half an hour. Never in the dev build (it is updated by building it again). Switch off in Settings.
   * ===================================================================== */
  const UPDATE_EVERY_MS = 3 * 3600000;

  async function updateNotice() {
    if ('__DEBUG__' === '1') return;
    const now = Date.now();
    if (now - (+store.get('update_checked', '0') || 0) < UPDATE_EVERY_MS) return;               // looked within 3 hours, here or in another tab
    store.set('update_checked', String(now));
    let latest;
    try { latest = await updateLatest(); } catch (e) { store.set('update_checked', String(now - UPDATE_EVERY_MS + 1800000)); return; }       // failed: again in half an hour
    if (!versionNewer(latest, SCRIPT_VERSION) || store.get('update_dismissed', '') === latest) return;
    toast({ title: `NextPlaate ${latest} is available`, body: `You have ${SCRIPT_VERSION}. Click here to install it now; Tampermonkey also updates it by itself.`, href: UPDATE_INSTALL, kind: 'update', ms: 20000,
      onClose: () => store.set('update_dismissed', latest) });
  }

  registerFeature({
    id: 'updatenotice', label: 'Update notice',
    groups: [],
    init: () => {
      const go = () => setTimeout(updateNotice, 3000 * siteScale());                              // a moment after the page, not with it
      if (document.visibilityState === 'visible') go();
      else document.addEventListener('visibilitychange', function once() { if (document.visibilityState === 'visible') { document.removeEventListener('visibilitychange', once); go(); } });
    }
  });
