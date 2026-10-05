  // Kyrgyzstan (2016 and later types): the region code (the menu reads "01 - Bishkek City"), then the plate text typed as it is.
  // The diplomatic type has its own set of fields (dip_*) and is read as a generic plate.
  PLATE_RULES.kg = () => fieldVal('ctype') === '10' ? shownVal('nomerpl').replace(/\s+/g, '').replace(/^([A-Z]+)(\d{2})(\d{3})$/, '$1 $2 $3') :   // diplomatic: D 09 003 (typed D09003)
    joinParts([menu('region').split(' - ')[0].trim(), shownVal('nomerpl')]);
