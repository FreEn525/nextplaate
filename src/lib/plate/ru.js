  // Russia: А 001 АА 77. Only the menus shown for this type (the site's disru20 function)
  PLATE_RULES.ru = () => {
    return joinParts([menu('b1') + menu('b2'), shownVal('digit'), menu('b3') + menu('b4'), menu('region')]);
  };
