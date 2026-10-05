  // Thailand: 4ฒฆ 5147 / ณข 1801 / ก-3826 = an optional digit (b1, "-" for none), a special letter whose menu depends on the type (b1mt, b1c, b1p,
  // b1v, b1i, b1com, b1txc, b1dop), the letters (b2, b3, b4), then the digits. The province menus are not in the plate text.
  PLATE_RULES.th = () => {
    const letters = ['b1', 'b1mt', 'b1c', 'b1p', 'b1v', 'b1i', 'b1com', 'b1txc', 'b1dop', 'b2', 'b3', 'b4'].map(id => menu(id)).filter(t => t && t !== '-').join('');
    return joinParts([letters + shownVal('digit1'), shownVal('digit') + shownVal('digit5')]);   // trucks: 10-7100 (digit1 then digit), police: digit5 alone
  };
