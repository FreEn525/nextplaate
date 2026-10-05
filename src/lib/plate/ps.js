  // Palestine: 4-7752-94 = a one-digit menu (reg1), the digits, then two characters
  PLATE_RULES.ps = () => joinParts([menu('reg1'), shownVal('digit1'), shownVal('digit2')]);
