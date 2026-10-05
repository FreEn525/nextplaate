  // Czechia: 1CA 8407. Only the fields shown for this type (the site's disczn function); a hidden menu keeps a value
  PLATE_RULES.cz = () => {
    if (shownVal('nomer')) return fieldVal('nomer');            // vanity, export transit, mopeds: one field
    const letters = menu('b1') + menu('region') + menu('b2');
    const digits = ['digit1', 'digit2', 'digit3'].map(shownVal).filter(Boolean).join('');
    // electric vehicles write EL themselves (disabled field): EL5 57CP; trailers of 1977 start with a two-digit field: 24 DOA-99
    // electric vehicles: EL5 57CP, the field takes 557CP and the site puts the space after the first digit
    if (shownVal('el') === 'EL' && /^\d\w{4}$/.test(digits.replace(/\s+/g, ''))) { const d = digits.replace(/\s+/g, ''); return 'EL' + d[0] + ' ' + d.slice(1); }
    return joinParts([shownVal('el') + letters, digits]);
  };
