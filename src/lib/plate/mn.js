  // Mongolia: 2294 БӨН (cars: digits, then the region code БӨ and the letter Н), БӨЗ 3510 (motorcycles), 7073 УН (special machinery).
  // The region menu reads "БН - Bayankhongor Province": the code is the part before the dash (none for "- Diplomatic missions").
  PLATE_RULES.mn = () => {
    const ctype = fieldVal('ctype'), shown = menu('region'), digit = shownVal('digit');
    const code = shown.startsWith('-') ? '' : shown.split(' - ')[0].trim();
    if (ctype === '1') return joinParts([digit, code + menu('b1')]);
    if (ctype === '2') return joinParts([digit, menu('b1') + menu('b2')]);        // trailers: 6079 ОЧ
    if (ctype === '4') return joinParts([code + menu('b1'), digit]);
    return joinParts([digit, code]);
  };
