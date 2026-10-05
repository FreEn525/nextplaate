  // Spain: diplomatic CD 32 022 (the dip menu shows its label CD, its value is a code)
  PLATE_RULES.es = () => {
    if (fieldVal('ctype') === '2') return joinParts([selText('dip'), selText('region'), shownVal('digit1')]);
    return genericPlate();
  };
