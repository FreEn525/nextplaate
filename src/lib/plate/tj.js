  // Tajikistan: 7717XZ07 = the number, then the region code (once). A number that already ends with a region code is kept as it is
  PLATE_RULES.tj = () => {
    const el = document.getElementById('region2'), shown = el && el.offsetParent !== null;
    const n = squash(fieldVal('nomer'));
    const ctype = fieldVal('ctype');
    // the gallery text keeps its spaces: 1996 system 0542 AA 02, AH 9832 02 (the number, then the code); 2009 motorcycles 121 A20, police 0247 M 01,
    // trailers 01AB 0096 (the code first); the other 2009 types are written together (815XM01)
    if (menu('region1')) return spaceOut(n) + ' ' + menu('region1');
    if (ctype === '8') return (shown ? selText('region2') : '') + spaceOut(n);
    const codes = shown ? [...el.options].map(o => o.text.trim()).filter(Boolean) : [];
    const r = shown ? selText('region2') : '';
    if (ctype === '9') return (r && !n.endsWith(r) ? n + r : n).replace(/^(\d+)(\D+\d+)$/, '$1 $2');   // 121 A20: the number 121A, then the code menu (20)
    if (codes.some(c => n.endsWith(c))) return n;
    if (ctype === '10' && r) return spaceOut(n) + ' ' + r;
    return r ? n + r : n;
  };
