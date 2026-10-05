  // Latvia: AB 1234; vanity (6) and diplomatic (9) are typed in one field: C-4307, PENNY
  PLATE_RULES.lv = () => {
    if (['6', '9'].includes(fieldVal('ctype'))) return fieldVal('nomer').toUpperCase();
    // dealers add a last digit after a dash (B 1122-6)
    return joinParts([menu('b1') + menu('b2'), shownVal('digit') + shownVal('digit2')]);
  };
