  // Ukraine: AA 0001 AA. Only the fields shown for the type (a hidden menu keeps BH, HA, OM)
  PLATE_RULES.ua = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '16') return joinParts([shownVal('digit1'), menu('b1') + menu('b2') + menu('b3')]);     // motorcycles 1995: 0708 CKA
    if (ctype === '14') return joinParts([shownVal('digit1'), menu('region4')]);                          // special machinery 1995: 00828 AC
    if (ctype === '15') return joinParts([menu('region4'), shownVal('digit4')]);                          // trailers for special vehicles: AB 07067
    if (ctype === '17') return joinParts([shownVal('dlet1'), shownVal('digit2'), shownVal('digit4')]);   // diplomatic: DP 201 191
    const region = menu('region1') || menu('region2') || menu('region3');
    const digit = ['digit1', 'digit2', 'digit3', 'digit4'].map(shownVal).find(Boolean) || '';
    return joinParts([region, digit, menu('b1') + menu('b2')]);
  };
