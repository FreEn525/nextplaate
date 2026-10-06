  // Palestine: 4-7752-94 = a one-digit menu (reg1), the digits, then two characters
  PLATE_RULES.ps = () => shownVal('digit2') ? joinParts([menu('reg1'), shownVal('digit1'), shownVal('digit2')]) : menu('reg1') + shownVal('digit1');   // authorities: 5396, one block
