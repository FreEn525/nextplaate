  // Laos: the letters are written by the site (military ກທ/, police, temporary: a disabled "dop" field, sometimes with a second part "dop1"),
  // chosen from a menu (diplomatic) or two letter menus (private owners, organisations: ກກ 1145). The province menu is not in the plate text.
  PLATE_RULES.la = () => {
    const dop1 = shownVal('dop1');
    // military and police with a number in front of the digits: ກທ/1 0040 (the slash stays); without: ກທ 5868
    if (shownVal('dop') && dop1 && shownVal('digit')) return shownVal('dop') + dop1 + ' ' + shownVal('digit');
    const dop = shownVal('dop').replace(/\/+$/, '');
    const letters = dop || menu('dip') || menu('b1') + menu('b2'), digit = shownVal('digit') || dop1;   // a dash typed by the user is kept
    // the dash is part of the plate: diplomatic ສທ23-78 (two and two digits), temporary ຂຄ3-541 (one digit, then the rest), no space after the letters
    if (fieldVal('ctype') === '6') return letters + digit.replace(/^(\d\d)(\d{2,})$/, '$1-$2');
    if (fieldVal('ctype') === '8') return letters + digit.replace(/^(\d)(\d+)$/, '$1-$2');
    return joinParts([letters, digit]);   // military ກທ 5868, police ປກສ 1099
  };
