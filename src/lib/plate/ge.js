  // Georgia: test plates are TEST-050 = TEST written by the site (testprefix, disabled), then the digits; the other types are read from their fields
  PLATE_RULES.ge = () => joinParts([shownVal('testprefix'), genericPlate()]);
