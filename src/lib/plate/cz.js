  // Czechia: 1CA 8407. Only the fields shown for this type (the site's disczn function); a hidden menu keeps a value
  PLATE_RULES.cz = () => {
    if (shownVal('nomer')) return fieldVal('nomer');            // vanity, export transit, mopeds: one field
    const letters = menu('b1') + menu('region') + menu('b2');
    const digits = ['digit1', 'digit2', 'digit3'].map(shownVal).filter(Boolean).join('');
    // electric vehicles write EL themselves (disabled field): EL5 57CP; trailers of 1977 start with a two-digit field: 24 DOA-99
    // electric vehicles: EL5 57CP, the field takes 557CP and the site puts the space after the first digit
    if (shownVal('el') === 'EL' && /^\d\w{4}$/.test(digits.replace(/\s+/g, ''))) { const d = digits.replace(/\s+/g, ''); return 'EL' + d[0] + ' ' + d.slice(1); }
    // the older types keep their separators in the gallery text: agricultural and commercial (1960) CB 88-39, military (1960) 214 75-56,
    // trailers (1977) 24 DOA-99, special machinery (2001) A01 3505, diplomatic 011 HC08
    const [d1, d2, d3] = ['digit1', 'digit2', 'digit3'].map(shownVal), dash = t => t.replace(/\s+/g, '-');
    const b2 = menu('b2'), kind = (document.getElementById('ctype') ? selText('ctype') : '');
    // CB 88-39 (agricultural and commercial: the second letter slot holds a digit that belongs to the number), ABJ 45-96, BV1 77-15
    if (d2 && b2 && menu('region')) return /^\d$/.test(b2) && /agricultur|commercial/i.test(kind) ? joinParts([menu('region'), b2 + dash(d2)]) : joinParts([menu('region') + b2, dash(d2)]);
    if (d1 && d2 && !d3 && !letters) return joinParts([d1, dash(d2)]);
    if (/^\d+$/.test(shownVal('el')) && menu('region') && b2 && d1) return /^\d$/.test(b2) ? [shownVal('el'), menu('region'), b2 + d1].join('-') : joinParts([shownVal('el'), menu('region') + b2 + '-' + d1]);
    if (menu('region') && d1 && d3 && !menu('b2')) return joinParts([menu('region') + d1, d3]);
    if (d1 && d3 && !letters && !shownVal('el')) return joinParts([d1, d3]);
    return joinParts([shownVal('el') + letters, digits]);
  };
