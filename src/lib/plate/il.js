  // Israel: the plate is one free text (nomer) and letters written by the site in a disabled field (b1): in front (S- of the sportcars: S-100 294)
  // or after (צ of the military: 172539-צ); diplomatic plates may also have a menu (CD, UN...) in front, "-" meaning none
  PLATE_RULES.il = () => {
    const b1 = shownVal('b1'), nomer = shownVal('nomer'), dip = menu('dip');
    const kind = dip && dip !== '-' ? dip : '';
    return b1.endsWith('-') ? joinParts([kind, b1 + nomer]) : joinParts([kind, nomer, b1]);
  };
