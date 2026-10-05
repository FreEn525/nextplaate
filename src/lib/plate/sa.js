  // Saudi Arabia: 3273 JRS = the digits, then the letters, in Latin script (the menus read "٣ / 3": the part after the slash);
  // the 1996 system is written in Arabic script (١ لكأ: the part before the slash)
  PLATE_RULES.sa = () => {
    const side = fieldVal('ctype') === '6' ? 'before' : 'after';
    return joinParts([charsOf(['d1', 'd2', 'd3', 'd4'], side), charsOf(['b1', 'b2', 'b3'], side)]);
  };
