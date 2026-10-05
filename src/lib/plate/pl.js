  // Poland: CNA 32756 = region menu (only when shown) + b1 (one more letter or digit: K0, ROK) + nomerpl; diplomatic (12): W 016600 = the W
  // written by the site, the code menu, then three digits
  PLATE_RULES.pl = () => {
    if (shownVal('dip')) return joinParts([shownVal('dip'), menu('region') + shownVal('digit')]);
    return joinParts([menu('region') + shownVal('b1'), fieldVal('nomerpl').toUpperCase()]);
  };
