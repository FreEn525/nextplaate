  // Latvia: AB 1234; vanity (6) and diplomatic (9) are typed in one field: C-4307, PENNY
  PLATE_RULES.lv = () => {
    if (['6', '9'].includes(fieldVal('ctype'))) return fieldVal('nomer').toUpperCase();
    return joinParts([selText('b1') + selText('b2'), fieldVal('digit')]);
  };
