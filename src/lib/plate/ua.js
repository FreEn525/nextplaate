  // Ukraine: AA 0001 AA. Only the fields shown for the type (a hidden menu keeps BH, HA, OM)
  PLATE_RULES.ua = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '16') return joinParts([shownVal('digit1'), menu('b1') + menu('b2') + menu('b3')]);     // motorcycles 1995: 0708 CKA
    if (ctype === '14') return joinParts([shownVal('digit1'), menu('region4')]);                          // special machinery 1995: 00828 AC
    if (ctype === '15') return joinParts([menu('region4'), shownVal('digit4')]);                          // trailers for special vehicles: AB 07067
    if (ctype === '18') return joinParts([fieldVal('tt95') + shownVal('digit1'), menu('region5')]);       // work vehicles 1995: T0625 PB (the T is written by the site)
    if (ctype === '20') return joinParts([menu('region3'), shownVal('nomer')]);                           // vanity plates: 11 SOPRANOS
    if (ctype === '8') return joinParts([shownVal('digit1'), menu('mil_b1') + menu('mil_b2')]);           // military 2004: 1133 Ф4
    if (ctype === '10') return joinParts([menu('region1'), shownVal('digit2'), menu('gov')]);             // government agencies: AE 103 E
    if (ctype === '9') return joinParts([shownVal('digit1'), menu('b3'), menu('region1')]);               // work vehicles 2004: 02058 T AX
    if (ctype === '5' || ctype === '6') return joinParts([menu('region2') || menu('region3'), menu('b1') + menu('b2'), shownVal('digit4')]);   // transit and dealer: 05 CH 8725, T4 TE 2773
    if (ctype === '17') return joinParts([shownVal('dlet1'), shownVal('digit2'), shownVal('digit4')]);   // diplomatic: DP 201 191
    const region = menu('region1') || menu('region2') || menu('region3');
    const digit = ['digit1', 'digit2', 'digit3', 'digit4'].map(shownVal).find(Boolean) || '';
    return joinParts([region, digit, menu('b1') + menu('b2')]);
  };
