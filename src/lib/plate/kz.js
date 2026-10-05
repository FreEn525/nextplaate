  // Kazakhstan: military plates of 1993 are 2723 АЯ = the digits then two letter menus (milb1, milb2); the other types are read from their fields
  PLATE_RULES.kz = () => fieldVal('ctype') === '9' ? joinParts([shownVal('digit2'), menu('milb1') + menu('milb2')]) : genericPlate();
