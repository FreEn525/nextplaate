  // Denmark: vanity plates are seven boxes, one character each (MARIAKJ)
  PLATE_RULES.dk = () => {
    if (fieldVal('ctype') === '4') return ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'].map(menu).join('').toUpperCase();
    return genericPlate();
  };
