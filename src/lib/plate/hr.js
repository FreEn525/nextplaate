  // Croatia: ZG 8899-JB; vanity (5) is region + the letter boxes shown: ZG ZMAJ
  PLATE_RULES.hr = () => {
    if (fieldVal('ctype') === '5') {
      return joinParts([selText('region'), ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'].map(menu).join('')]);
    }
    const digit = fieldVal('digit') || fieldVal('digit1'), letters = fieldVal('b1') + fieldVal('b2');
    return joinParts([selText('region') || selText('region1'), digit && letters ? `${digit}-${letters}` : digit || letters]);
  };
