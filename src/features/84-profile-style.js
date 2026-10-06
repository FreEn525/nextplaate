  /* =====================================================================
   *  PROFILE LOOK  (a member's profile page, in the look of the script)
   *    The figures, the badges, the private messages, the notifications, the countries and the last photos keep the site's own elements and
   *    scripts; only their style changes (src/ui/10-profile-css.js). Switch it off in the settings to get the site's own look back.
   * ===================================================================== */
  registerFeature({
    id: 'profilestyle', label: 'Profile page look',
    groups: [],
    init: () => {
      if (!here.profile || !document.querySelector('.container.profile')) return;
      const style = document.createElement('style');
      style.id = 'pmg-profile-style';
      style.textContent = PROFILE_CSS;
      document.head.appendChild(style);
    }
  });
