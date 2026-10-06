  // Germany: only the fields shown for this type (a hidden menu keeps HD or H)
  PLATE_RULES.de = () => {
    if (fieldVal('ctype') === '17') return joinParts([shownVal('digit'), shownVal('inslet')]);   // insurance plates: 380 LSI
    if (fieldVal('ctype') === '4') return joinParts([selText('dipf'), selText('regiondip') + '-' + fieldVal('digit')]);   // diplomatic: 0 111-111 (dipf shows 0)
    if (fieldVal('ctype') === '15') return joinParts([menu('regionfed'), menu('regionfed1'), shownVal('digit')]);   // authorities: BD 16 7004 (authority, its number, digits)
    // seasonal plates add their months in brackets (04/10); regional authorities have their own menu
    const season = shownVal('season');
    return joinParts([menu('regionreg') || menu('region'), menu('b1'), season ? shownVal('digit') + menu('b2') : joinParts([shownVal('digit'), menu('b2')]), season ? '(' + season + ')' : '']);
  };
