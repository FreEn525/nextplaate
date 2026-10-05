  // Tajikistan: 7717XZ07 = the number, then the region code (once). A number that already ends with a region code is kept as it is
  PLATE_RULES.tj = () => {
    const el = document.getElementById('region2'), shown = el && el.offsetParent !== null;
    const n = squash(fieldVal('nomer'));
    const codes = shown ? [...el.options].map(o => o.text.trim()).filter(Boolean) : [];
    if (codes.some(c => n.endsWith(c))) return n;
    const r = shown ? selText('region2') : '';
    return r ? n + r : n;
  };
