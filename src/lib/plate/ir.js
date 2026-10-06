  // Iran: ۵۱ت۱۶۵ ۲۲ = two digits, the letter (written by the site for some types, a menu for others), three digits, then the code
  // Plates for driving abroad (15, 16) are one free text (38E889) and a code menu.
  // Motorcycles: ۷۷۴ ۷۷۷۸۹ = three digits, a space, five digits (no letter, no code)
  PLATE_RULES.ir = () => !shownVal('let') && !charsOf(['b1'], 'before') && /^.{8}$/u.test(charsOf(['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'], 'before'))
    ? charsOf(['d1', 'd2', 'd3'], 'before') + ' ' + charsOf(['d4', 'd5', 'd6', 'd7', 'd8'], 'before') : shownVal('nomer') ? joinParts([shownVal('nomer'), menuPart('region2', 'before')]) : joinParts([
    charsOf(['d1', 'd2'], 'before') + (shownVal('let') || charsOf(['b1'], 'before')) + charsOf(['d3', 'd4', 'd5', 'd6', 'd7', 'd8'], 'before'),
    menuPart('region1', 'before') || menuPart('region3', 'before')
  ]);
