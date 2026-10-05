  // Czechia: 1CA 8407. Only the fields shown for this type (the site's disczn function); a hidden menu keeps a value
  PLATE_RULES.cz = () => {
    if (shownVal('nomer')) return fieldVal('nomer');            // vanity, export transit, mopeds: one field
    const letters = menu('b1') + menu('region') + menu('b2');
    const digits = ['digit1', 'digit2', 'digit3'].map(shownVal).filter(Boolean).join('');
    return joinParts([letters, digits]);
  };
