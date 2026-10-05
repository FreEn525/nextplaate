  // Poland: CNA 32756 = region menu (only when shown) + nomerpl
  PLATE_RULES.pl = () => {
    const el = document.getElementById('region');
    const region = el && el.offsetParent !== null ? selText('region') : '';
    return joinParts([region, fieldVal('nomerpl').toUpperCase()]);
  };
