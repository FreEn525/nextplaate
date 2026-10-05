  // Japan: 世田谷 310 あ 7410 = the place (the menu reads "Setagaya - 世田谷": the part after the dash), the class number, the hiragana,
  // the digits one per menu (a blank "•" for a short number)
  PLATE_RULES.jp = () => joinParts([menu('region').split(' - ').pop().trim(), shownVal('code'), menu('hiragana'), charsOf(['d1', 'd2', 'd3', 'd4'], 'before')]);
