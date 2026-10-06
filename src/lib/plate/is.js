  // Iceland: vanity plates are six boxes, one character each (LYNGAR)
  PLATE_RULES.is = () => {
    if (fieldVal('ctype') === '8') return boxes(['b1', 'b2', 'b3', 'b4', 'b5', 'b6']).toUpperCase();
    return genericPlate();
  };
