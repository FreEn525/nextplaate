  // Vietnam: 47A-271.12 = the province code, the series letter(s) typed in "mm", the digits as the site shows them (with their dot);
  // specialty plates take the letters from a menu (15CD-015.02); diplomatic and some others are one free text ("moto")
  // motorcycles (2, 6) have a dash after the province code: 29-B1 0910, 47-K1 270.77
  PLATE_RULES.vn = () => shownVal('moto') || (['2', '6'].includes(fieldVal('ctype')) ? joinParts([menu('region'), shownVal('mm') + menu('spec'), shownVal('digit')]) : '') || joinParts([menu('region') + shownVal('mm') + menu('spec'), shownVal('digit')]);
