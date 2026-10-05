  // Germany: only the fields shown for this type (a hidden menu keeps HD or H)
  PLATE_RULES.de = () => {
    if (fieldVal('ctype') === '17') return joinParts([shownVal('digit'), shownVal('inslet')]);   // insurance plates: 380 LSI
    if (fieldVal('ctype') === '4') return joinParts([selText('dipf'), selText('regiondip') + '-' + fieldVal('digit')]);   // diplomatic: 0 111-111 (dipf shows 0)
    return joinParts([menu('region'), menu('b1'), shownVal('digit'), menu('b2')]);
  };
