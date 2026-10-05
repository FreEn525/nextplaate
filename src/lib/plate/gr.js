  // Greece: IAZ 6038 (cars). 1972 system (9): IN-4662; mopeds (12): ZHE 3860. Only the shown fields
  PLATE_RULES.gr = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '9') return shownVal('let') + '-' + shownVal('digit');
    if (ctype === '12') return joinParts([shownVal('let'), shownVal('digit')]);
    return joinParts([menu('b1') + menu('region'), shownVal('digit')]);
  };
