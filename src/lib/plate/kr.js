  // Korea: 29무 3759 / 경기50바 4521 = the province (commercial vehicles: the menu reads "경기 (Gyeonggi Province)"), the two digits, the
  // letter (a menu), then the four digits
  PLATE_RULES.kr = () => joinParts([menu('region').split(' (')[0].trim() + shownVal('digit1') + menu('let1') + menu('let2'), shownVal('digit')]);
