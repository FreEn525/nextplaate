  // Slovenia: LJ 123-AB (the region code, then the plate)
  PLATE_RULES.si = () => {
    const region = (document.getElementById('drop_1') || { value: '' }).value.trim();
    return joinParts([region, fieldVal('nomer')]);
  };
