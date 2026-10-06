  // China: the trailer mark 挂 touches the number (浙C·B152挂), every other part is read as the form lists it
  PLATE_RULES.cn = () => genericPlate().replace(/(\d) (挂)/, '$1$2');
