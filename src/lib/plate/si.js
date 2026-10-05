  // Slovenia: LJ 123-AB (the region code, then the plate)
  PLATE_RULES.si = () => {
    const region = (document.getElementById('drop_1') || { value: '' }).value.trim();
    if (fieldVal('ctype') === '2') return joinParts([fieldVal('nomer'), region]);   // trailers: H4-86 KP, the code after the plate
    return joinParts([region, fieldVal('nomer')]);
  };
