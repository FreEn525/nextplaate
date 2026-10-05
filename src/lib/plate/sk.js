  // Slovakia: BA 427RF; the types with a middle letter (dealer, oldtimers...) read it: PO M 704
  PLATE_RULES.sk = () => {
    const region = selText('region');
    if (shownVal('let1')) return joinParts([region, shownVal('let1'), fieldVal('digit')]);
    if (!fieldVal('digit')) return genericPlate();                // vanity and provisional types have no digit field: read the shown fields
    return region + '-' + fieldVal('digit') + fieldVal('let2');   // a space is refused by the site
  };
