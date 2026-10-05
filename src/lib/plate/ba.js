  // Bosnia: A12-E-345, parts joined by dashes; b1 only when it is shown (a hidden menu keeps a value)
  PLATE_RULES.ba = () =>
    [fieldVal('let1'), shownVal('b1'), fieldVal('let2') || fieldVal('digit')].filter(Boolean).join('-');
