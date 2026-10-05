  // Russia: А 001 АА 77. Only the menus shown for this type (the site's disru20 function). Diplomatic: 032 D 345 77 (the country code typed in
  // "code", the letter menu dipb1, the digits, the region); diplomatic motorcycles: D 017 02 77 (dipb2 first)
  PLATE_RULES.ru = () => {
    if (menu('dipb1')) return joinParts([shownVal('code'), menu('dipb1'), shownVal('digit'), menu('region')]);
    if (menu('dipb2')) return joinParts([menu('dipb2'), shownVal('code'), shownVal('digit'), menu('region')]);
    return joinParts([menu('b1') + menu('b2'), shownVal('digit'), menu('b3') + menu('b4'), menu('region')]);
  };
