  // Vietnam: 47A-271.12 = the province code, the series letter(s) typed in "mm", the digits as the site shows them (with their dot);
  // specialty plates take the letters from a menu (15CD-015.02); diplomatic and some others are one free text ("moto")
  PLATE_RULES.vn = () => shownVal('moto') || joinParts([menu('region') + shownVal('mm') + menu('spec'), shownVal('digit')]);
