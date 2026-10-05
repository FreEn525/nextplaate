  // Forms with a region menu (drop_1: a state, a province, an emirate) and a free plate text (nomer): the region is not part of the plate
  // text (MBG-133-A, not AGUASCALIENTES MBG-133-A), so only the text is read.
  PLATE_RULES.ae = PLATE_RULES.au = PLATE_RULES.ca = PLATE_RULES.mx = PLATE_RULES.us = () => fieldVal('nomer');
