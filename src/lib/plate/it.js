  // Italy: mopeds and dealers type their text in mb1 / mb2 (5N JGK; 00 P 1FLYG, the P being written by the site); road machinery is nomerpl1
  // alone (AKF 511: the province menu is not in the plate text); the other types are read from their fields
  PLATE_RULES.it = () => {
    if (shownVal('mb1') || shownVal('mb2')) return joinParts([shownVal('mb1'), shownVal('dealp'), shownVal('mb2')]);
    if (fieldVal('ctype') === '14') return shownVal('nomerpl1');
    return genericPlate();
  };
