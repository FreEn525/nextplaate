  /* =====================================================================
   *  PROFILE LOOK  (a member's profile page, in the look of the script)
   *    The site's elements and scripts stay; the style changes (src/ui/10-profile-css.js), the loose figures become four tiles, the
   *    countries table shows the countries with photos (a box brings back the others), and the notifications get the plate as a picture
   *    and load as the list is scrolled (src/lib/profile-parts.js, src/lib/profile-notify.js). Switch it off in the settings to get the
   *    site's own look back.
   * ===================================================================== */
  registerFeature({
    id: 'profilestyle', label: 'Profile page look',
    groups: [],
    init: () => {
      const root = here.profile && document.querySelector('.container.profile');
      if (!root) return;
      const style = document.createElement('style');
      style.id = 'pmg-profile-style';
      style.textContent = PROFILE_CSS;
      document.head.appendChild(style);
      if (profileTiles(root)) root.classList.add('pm-built');
      profileCountries(root);
      profileLast(root);
      const member = (location.pathname.match(/\/user(\d+)/) || [])[1];
      profileAwards(root, member);
      profileNotifications(root, member);
    }
  });
