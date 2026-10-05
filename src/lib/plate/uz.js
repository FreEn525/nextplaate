  // Uzbekistan: PP A 123 AA (cars); motorcycles, trailers, special machinery: 010 LA 50; high authorities: PAA 252
  PLATE_RULES.uz = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '9') return joinParts([selText('b3'), fieldVal('dig1')]);
    if (['5', '6', '7', '8'].includes(ctype)) return joinParts([fieldVal('dig3'), fieldVal('b4'), selText('region')]);
    return joinParts([selText('region'), fieldVal('b1'), fieldVal('dig1'), fieldVal('b2')]);
  };
