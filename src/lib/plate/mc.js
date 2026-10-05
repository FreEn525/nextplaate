  // Monaco: provisional plates are 1517 WW MC = the number, the WW menu, then MC (the country, part of the plate text); the other types are read from their fields
  PLATE_RULES.mc = () => shownVal('nomerpl') && menu('drop_1') ? joinParts([shownVal('nomerpl'), menu('drop_1'), 'MC']) : genericPlate();
