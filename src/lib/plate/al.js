  // Albania, by type: cars 2011 AA 896 TH; cars 1993 LE 0075 B (region, digits, letter); others: letter, digits
  PLATE_RULES.al = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '1') return joinParts([fieldVal('let1'), fieldVal('digit'), fieldVal('let2')]);
    if (ctype === '4') return joinParts([selText('region'), fieldVal('digit'), fieldVal('let2')]);
    return joinParts([fieldVal('let1'), fieldVal('digit')]);
  };
