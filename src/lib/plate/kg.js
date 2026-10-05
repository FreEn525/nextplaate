  // Kyrgyzstan (2016 and later types): the region code (the menu reads "01 - Bishkek City"), then the plate text typed as it is.
  // The diplomatic type has its own set of fields (dip_*) and is read as a generic plate.
  PLATE_RULES.kg = () => fieldVal('ctype') === '10' ? genericPlate() : joinParts([menu('region').split(' - ')[0].trim(), shownVal('nomerpl')]);
