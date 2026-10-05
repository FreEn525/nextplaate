  // Serbia: BG 123-AB; trailers (2): OO-442 VR (two letters, digits, then the region menu); vanity (4): region then the letter boxes;
  // diplomatic (6), military (10), oldtimers (8), special machinery (9) put their text in "dip" after the region; police (5) has a
  // letter written by the site (П 009-299)
  PLATE_RULES.rs = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '2') return joinParts([menu('b1') + menu('b2') + '-' + shownVal('digit2'), menu('region2')]);
    if (ctype === '4') return joinParts([menu('region1'), ['b1', 'b2', 'b3', 'b4', 'b5'].map(menu).join('')]);
    const digit = shownVal('digit') || shownVal('digit1'), letters = menu('b1') + menu('b2');
    const core = digit && letters ? `${digit}-${letters}` : digit || letters;
    return joinParts([menu('region') || menu('region1'), shownVal('police'), shownVal('dip'), core, ctype === '6' ? shownVal('digit2') : '']);
  };
