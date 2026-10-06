  /* =====================================================================
   *  WHERE AM I  (which kind of PlatesMania page is open, decided once when the script loads)
   * ===================================================================== */
  const here = {
    country: (location.pathname.match(/^\/([a-z]{2})\//i) || [])[1] || '',   // country code of the page (fr, de...)
    add: /^\/[a-z]{2}\/add\/?$/i.test(location.pathname),   // upload page of a country
    addAny: /^\/([a-z]{2}\/)?add\/?$/i.test(location.pathname),   // that one, or /add (the page that comes before the choice of a country)
    gallery: /\/gallery(\.php)?$/i.test(location.pathname) || /\/user\d+\/?$/i.test(location.pathname),
    photo: (location.pathname.match(/\/nomer(\d+)/i) || [])[1] || null,    // photo page: the photo id
    // Edit page: <textarea name="dop"> + <input type="hidden" name="id" value="{photo id}">
    edit: !!(document.querySelector('textarea[name="dop"]') && document.querySelector('form input[name="id"]'))
  };
