  // Åland: ÅL 12345, ÅLA 1234, ÅS 1234, ÅF 1234: the first letters are written by the site in disabled menus (b1, b2), a third letter is a menu (b3)
  PLATE_RULES.ax = () => joinParts([['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'].map(menu).join(''), shownVal('digit')]);   // vanity plates use all seven menus
