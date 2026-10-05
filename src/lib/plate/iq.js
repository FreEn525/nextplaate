  // Iraq: 1988 and 2001 systems are written in Arabic digits (١٠٣٧٠٤), 2008 as E 74525, 2022 as 21 O 17000 (Latin, with the governorate number first)
  PLATE_RULES.iq = () => {
    const ctype = fieldVal('ctype'), side = ['3', '4'].includes(ctype) ? 'before' : 'after';
    const region = ctype === '1' ? menuPart('region2', 'before') : '';
    return joinParts([region, charsOf(['b1l', 'b1', 'b2', 'b3'], side), charsOf(['d1', 'd2', 'd3', 'd4', 'd5', 'd6'], side)]);
  };
