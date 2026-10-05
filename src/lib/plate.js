  /* =====================================================================
   *  PLATE FORMAT  (how the plate typed in the upload form is written, to search it)
   *    Rules from "Notification Doubles Plaques" (MIT), rewritten here as small functions.
   *    A country without a rule uses the plain plate field of its form.
   * ===================================================================== */
  const fieldVal = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const shownVal = id => { const el = document.getElementById(id); return el && el.offsetParent !== null ? el.value.trim() : ''; };
  const squash = s => s.replace(/[\s-]+/g, '').toUpperCase();     // "ab-123 cd" -> "AB123CD"
  const joinParts = parts => parts.filter(Boolean).join(' ');
  // a select shows its label (BJ, VZ...), which is what the site expects; its value is an internal code
  const selText = id => { const el = document.getElementById(id); if (!el) return ''; if (el.tagName === 'SELECT') { const o = el.options[el.selectedIndex]; return o && o.value ? o.text.trim() : ''; } return el.value.trim(); };

  // France: the format depends on the plate type chosen in the form (#ctype)
  function plateFR() {
    const type = fieldVal('ctype');
    if (type === '5') {                                             // diplomatic
      return joinParts([fieldVal('dip1') !== '0' && fieldVal('dip1'), fieldVal('regdip'), fieldVal('dip2'),
        fieldVal('digdip'), fieldVal('drop_1'), fieldVal('dip3') !== '0' && fieldVal('dip3')]);
    }
    const raw = fieldVal('nomer1') || fieldVal('nomer');
    if (!raw) return '';
    const c = squash(raw);
    if (type === '16') {                                            // moped
      const m = c.match(/^([A-Z]{1,2})(\d{3})([A-Z])$/);
      return m ? `${m[1]} ${m[2]} ${m[3]}` : raw.toUpperCase();
    }
    if (type === '6') {                                             // garage plate W
      const m = c.match(/^W(\d{3})([A-Z]{2})$/);
      return m ? `W ${m[1]} ${m[2]}` : raw.toUpperCase().replace(/-/g, ' ');
    }
    if (['8', '12', '13', '14', '15'].includes(type)) {            // FNI (regular, free zones, transit, agricultural, administration)
      const m = c.match(/^(\d{1,4})([A-Z]{2,3})(\d{2})$/);
      return m ? `${m[1]} ${m[2]} ${m[3]}` : raw.toUpperCase().replace(/-/g, ' ');
    }
    if (type === '9') return raw.replace(/\D+/g, '');               // military: digits only
    const m = c.match(/^([A-Z]{2})(\d{3})([A-Z]{2})$/);             // standard SIV: the site writes it AB-123-CD
    return m ? `${m[1]}-${m[2]}-${m[3]}` : raw.toUpperCase().replace(/\s+/g, '-').trim();
  }

  // Any other country: the visible plate fields, read in the order of the page (region, letters, digits...).
  // A field that is not shown (another plate type) is left out. A field with no value is left out.
  const PLATE_FIELD = /nomer|let|digit|region|^b\d|dip|drop|^dig|trl|letter/i;
  const isPlateField = el => PLATE_FIELD.test(el.id || el.name || '');
  function genericPlate() {
    const parts = [];
    for (const el of document.querySelectorAll('input, select')) {
      const key = el.id || el.name || '';
      if (!PLATE_FIELD.test(key) || el.offsetParent === null || el.disabled || key === 'drop_2') continue;   // drop_2 is the plate-type menu of Andorra and Malta
      if (el.tagName === 'SELECT') {
        const opt = el.options[el.selectedIndex];
        if (opt && opt.value) parts.push(opt.value.length > 3 ? opt.text.trim() : opt.value.trim());
      } else if (el.value.trim()) {
        parts.push(el.value.trim());
      }
    }
    return joinParts(parts).toUpperCase();
  }

  // Belarus: for each type, the visible letter menus, the region menu and the digit field (site's disby1 function, run on each type)
  const BY_TYPES = {
    '1': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Cars (2004)
    '2': { letters: ['b1', 'b2'], region: 'region5', digit: 'digit1', lettersFirst: true },    // Trucks and buses (2004)
    '4': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Electric vehicles (cars)
    '5': { letters: ['b1', 'b3'], region: 'region5', digit: 'digit1', lettersFirst: true },    // Trailers and semitrailers (2004)
    '6': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Motorcycles (2004)
    '7': { letters: ['b1', 'b2'], region: 'region1', digit: 'digit1', lettersFirst: true },    // Special machinery (2004)
    '8': { letters: ['b1', 'b2'], region: 'region5', digit: 'digit1', lettersFirst: true },    // Electric vehicles (trucks and buses)
    '9': { letters: ['b3', 'b4'], region: 'region5', digit: 'digit1', lettersFirst: false },   // Electric vehicles (motorcycles)
    '12': { letters: ['b3', 'b4'], region: 'region1', digit: 'digit2', lettersFirst: false },  // Transit plates (2004)
    '13': { letters: ['b3', 'b4'], region: 'region3', digit: 'digit1', lettersFirst: false },  // Cars (2000)
    '20': { letters: [], region: 'region6', digit: 'digit1', lettersFirst: false },             // Police
    '14': { letters: [], region: 'region4', digit: 'digit1', lettersFirst: false },            // Cars (1992)
    '15': { letters: [], region: 'region4', digit: 'digit2', lettersFirst: false },            // Trucks and buses (1992)
    '16': { letters: [], region: '', digit: 'digit1', lettersFirst: false },                   // Trailers (1992)
    '17': { letters: ['b3', 'b4'], region: 'region1', digit: 'digit2', lettersFirst: false },  // Taxi
    '18': { letters: ['b3', 'b4'], region: '', digit: 'digit2', lettersFirst: false },         // Provisional (the T/BP mark is typed by the site)
    '19': { letters: [], region: '', digit: 'digit2', lettersFirst: false }                    // Foreign citizens and enterprises
  };

  function plateForForm() {
    switch (here.country) {
      case 'fr': return plateFR();
      case 'de': {                                                  // Germany: only the fields shown for this type (a hidden menu keeps HD or H)
        const menu = id => { const el = document.getElementById(id); return el && el.offsetParent !== null ? selText(id) : ''; };
        return joinParts([menu('region'), menu('b1'), shownVal('digit'), menu('b2')]);
      }
      case 'gg': return fieldVal('digit');
      case 'hr':                                                    // region, then digits-letters: ZG 8899-JB (the site's example: ZG 1234-AB)
      case 'rs': {                                                  // Serbia: BG 123-AB
        const digit = fieldVal('digit') || fieldVal('digit1'), letters = fieldVal('b1') + fieldVal('b2');
        return joinParts([selText('region') || selText('region1'), digit && letters ? `${digit}-${letters}` : digit || letters]);
      }
      case 'si': {                                                  // Slovenia: LJ 123-AB (the region code, then the plate)
        const region = (document.getElementById('drop_1') || { value: '' }).value.trim();
        return joinParts([region, fieldVal('nomer')]);
      }
      case 'sk': return joinParts([selText('region'), fieldVal('digit') + fieldVal('let2')]);   // Slovakia: AB 123AB
      case 'tj': {                                                  // Tajikistan: 7717XZ07, the plate then the region label (once)
        const n = squash(fieldVal('nomer')), r = selText('region2');
        return r && !n.endsWith(r) ? n + r : n;
      }
      case 'ua': return joinParts([selText('region1'), fieldVal('digit1'), fieldVal('b1') + fieldVal('b2')]);   // Ukraine: AA 0001 AA
      case 'lv': return joinParts([selText('b1') + selText('b2'), fieldVal('digit')]);   // Latvia: AB 1234
      case 'li': return joinParts(['FL', fieldVal('digit').replace(/^FL\s*/i, '')]);   // Liechtenstein: FL 12345 (the FL is fixed; the digit field may already hold it)
      case 'ru': {                                                  // Russia: А 001 АА 77. Only the menus shown for this type (the site's disru20 function)
        const menu = id => { const el = document.getElementById(id); return el && el.offsetParent !== null ? selText(id) : ''; };
        return joinParts([menu('b1') + menu('b2'), shownVal('digit'), menu('b3') + menu('b4'), menu('region')]);
      }
      case 'uz': return joinParts([selText('region'), fieldVal('b1'), fieldVal('dig1'), fieldVal('b2')]);   // Uzbekistan: PP A 123 AA
      case 'gr': {                                                  // Greece: IAZ 6038 (cars). 1972 system (9): IN-4662; mopeds (12): ZHE 3860. Only the shown fields
        const ctype = fieldVal('ctype');
        if (ctype === '9') return shownVal('let') + '-' + shownVal('digit');
        if (ctype === '12') return joinParts([shownVal('let'), shownVal('digit')]);
        const menu = id => { const el = document.getElementById(id); return el && el.offsetParent !== null ? selText(id) : ''; };
        return joinParts([menu('b1') + menu('region'), shownVal('digit')]);
      }
      case 'by': {                                                  // Belarus: the fields shown depend on the type (taken from the site's own switch function)
        const row = BY_TYPES[fieldVal('ctype')];
        if (!row) return genericPlate();
        const letters = row.letters.map(selText).join(''), digits = fieldVal(row.digit), region = selText(row.region);
        const core = row.lettersFirst ? joinParts([letters, digits]) : joinParts([digits, letters]);   // trucks AP 9665, cars 6383 EC
        return core + (region ? '-' + region : '');                    // the region follows a dash: AP 9665-1, 6383 EC-6
      }
      case 'cz': {                                                  // Czechia: 1CA 8407. Only the fields shown for this type (the site's disczn function); a hidden menu keeps a value
        if (shownVal('nomer')) return fieldVal('nomer');            // vanity, export transit, mopeds: one field
        const menu = id => { const el = document.getElementById(id); return el && el.offsetParent !== null ? selText(id) : ''; };
        const letters = menu('b1') + menu('region') + menu('b2');
        const digits = ['digit1', 'digit2', 'digit3'].map(shownVal).filter(Boolean).join('');
        return joinParts([letters, digits]);
      }
      case 'sk': return joinParts([selText('region') + '-' + fieldVal('digit') + fieldVal('let2')]);   // Slovakia: BA-427RF (a space is refused by the site)
      case 'ee':                                                    // Estonia: motorcycles (ctype 3) are ABC 123; the other types are read from their fields
        return fieldVal('ctype') === '3' ? joinParts([fieldVal('let'), fieldVal('dig1')]) : genericPlate();
      case 'al': {                                                  // Albania, by type: cars 2011 AA 896 TH; cars 1993 LE 0075 B (region, digits, letter); others: letter, digits
        const ctype = fieldVal('ctype');
        if (ctype === '1') return joinParts([fieldVal('let1'), fieldVal('digit'), fieldVal('let2')]);
        if (ctype === '4') return joinParts([selText('region'), fieldVal('digit'), fieldVal('let2')]);
        return joinParts([fieldVal('let1'), fieldVal('digit')]);
      }
      case 'ba':                                                    // Bosnia: A12-E-345, parts joined by dashes; b1 only when it is shown (a hidden menu keeps a value)
        return [fieldVal('let1'), shownVal('b1'), fieldVal('let2') || fieldVal('digit')].filter(Boolean).join('-');
      case 'tr': {
        const sel = document.querySelector('select[name="region"]');
        // the option value is an internal code (40001); the label starts with the plate number ("50 - Nevsehir")
        const label = sel && sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '';
        const region = label.match(/^\s*(\d{2})/);
        return joinParts([region && region[1], fieldVal('let'), fieldVal('digit')]);
      }
      case 'es': {                                                  // Spain: diplomatic CD 32 022 (the dip menu shows its label CD, its value is a code)
        if (fieldVal('ctype') === '2') return joinParts([selText('dip'), selText('region'), shownVal('digit1')]);
        return genericPlate();
      }
      case 'dk': {                                                  // Denmark: vanity plates are seven boxes, one character each (MARIAKJ)
        if (fieldVal('ctype') === '4') return ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'].map(shownVal).join('').toUpperCase();
        return genericPlate();
      }
      case 'pl': {                                                  // Poland: CNA 32756 = region menu (only when shown) + nomerpl
        const el = document.getElementById('region');
        const region = el && el.offsetParent !== null ? selText('region') : '';
        return joinParts([region, fieldVal('nomerpl').toUpperCase()]);
      }
      case 'dz': return fieldVal('nomer').replace(/\s+/g, ' ');     // Algeria: the groups are typed as the site shows them (271201 00 16)
      default:
        return genericPlate();
    }
  }
