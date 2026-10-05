  // Serbia: BG 123-AB; trailers (2): AC-334 LE (no region); vanity (4): region then the letter boxes
  PLATE_RULES.rs = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '2') return joinParts([shownVal('b1') + '-' + shownVal('digit2'), shownVal('b2')]);
    if (ctype === '4') return joinParts([menu('region1'), ['b1', 'b2', 'b3', 'b4', 'b5'].map(menu).join('')]);
    const digit = fieldVal('digit') || fieldVal('digit1'), letters = fieldVal('b1') + fieldVal('b2');
    return joinParts([selText('region') || selText('region1'), digit && letters ? `${digit}-${letters}` : digit || letters]);
  };
