  // Guernsey: 12345; Alderney AY 1573 and dealers V145 have letters written by the site in a disabled field
  PLATE_RULES.gg = () => (l => l.length === 1 ? l + fieldVal('digit') : joinParts([l, fieldVal('digit')]))(shownVal('let'));   // a single letter touches the number (V145), two letters do not (AY 1573)
