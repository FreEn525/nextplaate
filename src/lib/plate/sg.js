  // Singapore: PC 9090 A = the letters, the digits, then the check letter (three fields)
  PLATE_RULES.sg = () => joinParts([shownVal('let'), shownVal('dig'), shownVal('checksum')]);
