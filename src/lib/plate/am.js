  // Armenia: ARM 025 for the high officials (the letters are written by the site in a disabled field); the other types are read from their fields
  PLATE_RULES.am = () => shownVal('arm') ? joinParts([shownVal('arm'), shownVal('dig2')]) : spaceOut(genericPlate());
