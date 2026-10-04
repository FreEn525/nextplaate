  /* =====================================================================
   *  WHERE AM I  (which kind of PlatesMania page is open, decided once when the script loads)
   * ===================================================================== */
  const here = {
    gallery: /\/gallery(\.php)?$/i.test(location.pathname) || /\/user\d+\/?$/i.test(location.pathname),
    photo: (location.pathname.match(/\/nomer(\d+)/i) || [])[1] || null,    // photo page: the photo id
    // Edit page: <textarea name="dop"> + <input type="hidden" name="id" value="{photo id}">
    edit: !!(document.querySelector('textarea[name="dop"]') && document.querySelector('form input[name="id"]'))
  };
