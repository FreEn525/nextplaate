  // Moldova: trailers of 1992: region code, digits, letters
  PLATE_RULES.md = () => {
    if (fieldVal('ctype') === '3') return joinParts([fieldVal('region1'), fieldVal('digit'), fieldVal('let2')]);   // FL 070 RA (region code, digits, letters: the site has it)
    return genericPlate();
  };
