  // Cambodia: the authorities (5) and the vehicles without paid duty (7) have a province menu (region5, region7) that is not part of the
  // plate (2-0459, 1-7172); the other types are read from their fields
  PLATE_RULES.kh = () => ['5', '7'].includes(fieldVal('ctype')) ? shownVal('nomer') : genericPlate();
