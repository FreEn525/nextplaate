  // Greece: IAZ 6038 (cars). 1972 system (9): IN-4662; mopeds (12): ZHE 3860. Only the fields shown for the type: some
  // letters are written by the site itself in a disabled field that is still shown (ΞΑ of the administrative staff, AM of the
  // agricultural vehicles, E.A. of the police, ΛΣ of the Coast Guard), and menus can be shown but fixed (the P of a trailer)
  PLATE_RULES.gr = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '9') return shownVal('let') + '-' + shownVal('digit');
    if (ctype === '12') return joinParts([shownVal('let'), shownVal('digit')]);
    const digits = shownVal('digit');
    const written = shownVal('let') || shownVal('bfixed').replace(/\./g, '');
    if (written) return joinParts([written + menu('b1'), digits]);                               // private trailers: the T written by the site, then the letter
    return joinParts([menu('region') + menu('b1'), digits]);                                     // the two-letter code, then the letter: IA Z
  };
