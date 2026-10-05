  // Åland: ÅL 12345, ÅLA 1234, ÅS 1234, ÅF 1234: the first letters are written by the site in disabled menus (b1, b2), a third letter is a menu (b3)
  PLATE_RULES.ax = () => joinParts([menu('b1') + menu('b2') + menu('b3'), shownVal('digit')]);
