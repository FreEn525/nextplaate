  // Portugal: diplomatic plates are 007-CC453 = a number, the kind (CD, CC, FM, OI), a number; the National Republican Guard writes GNR itself
  // (gnr, disabled): GNR T-399; the other types are read from their fields
  PLATE_RULES.pt = () => shownVal('mnum1') || shownVal('mnum2') ? shownVal('mnum1') + '-' + menu('mtype') + shownVal('mnum2') : joinParts([shownVal('gnr'), genericPlate()]);
