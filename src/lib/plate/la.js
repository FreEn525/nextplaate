  // Laos: the letters are written by the site (military ກທ/, police, temporary: a disabled "dop" field, sometimes with a second part "dop1"),
  // chosen from a menu (diplomatic) or two letter menus (private owners, organisations: ກກ 1145). The province menu is not in the plate text.
  PLATE_RULES.la = () => {
    const dop = shownVal('dop').replace(/\/+$/, '') + shownVal('dop1');
    if (dop) return joinParts([dop, shownVal('digit')]);
    return joinParts([menu('dip') || menu('b1') + menu('b2'), shownVal('digit')]);
  };
