  // Montenegro: vanity = region then the letter boxes (BD CMM02); police = fon, then region+digits (P PG273)
  PLATE_RULES.me = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '5') return joinParts([menu('region'), ['b1', 'b2', 'b3', 'b4', 'b5'].map(menu).join('')]);
    if (ctype === '6') return joinParts([shownVal('police'), menu('region') + shownVal('digit')]);   // police: the P is written by the site
    return genericPlate();
  };
