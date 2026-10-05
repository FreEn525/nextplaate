  // Croatia: ZG 8899-JB; vanity (5) is region + the letter boxes shown: ZG ZMAJ. Dealer and oldtimers: OS PP-178, KR PV-081
  // (the letters PP, PV are written by the site in a disabled field); export transit and military: RH 199-BE, HV 236-MP (the
  // site writes RH, HV, and there is no region); diplomatic (11): 025-A-020 (code, the letter of the corps, digits)
  PLATE_RULES.hr = () => {
    const ctype = fieldVal('ctype');
    if (ctype === '5') return joinParts([menu('region'), ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'].map(menu).join('')]);
    if (ctype === '11') return [fieldVal('dipcode'), menu('dipletter').charAt(0), shownVal('digit')].filter(Boolean).join('-');
    const digit = shownVal('digit') || shownVal('digit1'), letters = menu('b1') + menu('b2');
    const core = digit && letters ? `${digit}-${letters}` : digit || letters;
    const written = shownVal('special'), region = menu('region') || menu('region1');
    if (written) return joinParts([region, region ? written + '-' + core : written + ' ' + core]);
    return joinParts([region, core]);
  };
