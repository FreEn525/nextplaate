  // Estonia: motorcycles (ctype 3) are ABC 123; the other types are read from their fields
  PLATE_RULES.ee = () =>
    fieldVal('ctype') === '3' ? joinParts([fieldVal('let'), fieldVal('dig1')]) : genericPlate();
