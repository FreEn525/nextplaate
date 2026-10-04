  /* =====================================================================
   *  PLATE FORMAT  (how the plate typed in the upload form is written, to search it)
   *    Rules from "Notification Doubles Plaques" (MIT), rewritten here as small functions.
   *    A country without a rule uses the plain plate field of its form.
   * ===================================================================== */
  const fieldVal = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const shownVal = id => { const el = document.getElementById(id); return el && el.offsetParent !== null ? el.value.trim() : ''; };
  const squash = s => s.replace(/[\s-]+/g, '').toUpperCase();     // "ab-123 cd" -> "AB123CD"
  const joinParts = parts => parts.filter(Boolean).join(' ');

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
      if (!PLATE_FIELD.test(key) || el.offsetParent === null || el.disabled) continue;
      if (el.tagName === 'SELECT') {
        const opt = el.options[el.selectedIndex];
        if (opt && opt.value) parts.push(opt.value.length > 3 ? opt.text.trim() : opt.value.trim());
      } else if (el.value.trim()) {
        parts.push(el.value.trim());
      }
    }
    return joinParts(parts).toUpperCase();
  }

  function plateForForm() {
    switch (here.country) {
      case 'fr': return plateFR();
      case 'de': return joinParts([fieldVal('region'), fieldVal('b1'), fieldVal('digit'), fieldVal('b2')]);
      case 'gg': return fieldVal('digit');
      case 'hr':                                                    // region, then digits-letters: ZG 8899-JB (the site's example: ZG 1234-AB)
      case 'rs': {                                                  // Serbia: BG 123-AB
        const digit = fieldVal('digit') || fieldVal('digit1'), letters = fieldVal('b1') + fieldVal('b2');
        return joinParts([fieldVal('region') || fieldVal('region1'), digit && letters ? `${digit}-${letters}` : digit || letters]);
      }
      case 'si': {                                                  // Slovenia: LJ 123-AB (the region code, then the plate)
        const region = (document.getElementById('drop_1') || { value: '' }).value.trim();
        return joinParts([region, fieldVal('nomer')]);
      }
      case 'sk': return joinParts([fieldVal('region'), fieldVal('digit') + fieldVal('let2')]);   // Slovakia: AB 123AB
      case 'tj': return fieldVal('nomer');                          // Tajikistan: 1234AB01, one string
      case 'ua': return joinParts([fieldVal('region1'), fieldVal('digit1'), fieldVal('b1') + fieldVal('b2')]);   // Ukraine: AA 0001 AA
      case 'ba':                                                    // Bosnia: A12-E-345, parts joined by dashes
        return [fieldVal('let1'), fieldVal('b1'), fieldVal('let2') || fieldVal('digit')].filter(Boolean).join('-');
      case 'tr': {
        const sel = document.querySelector('select[name="region"]');
        // the option value is an internal code (40001); the label starts with the plate number ("50 - Nevsehir")
        const label = sel && sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '';
        const region = label.match(/^\s*(\d{2})/);
        return joinParts([region && region[1], fieldVal('let'), fieldVal('digit')]);
      }
      case 'dz': {
        const digits = squash(fieldVal('nomer')).replace(/\D+/g, '');
        const m = digits.match(/^(\d{1,6})(\d{3})(\d{2})$/);
        return m ? `${m[1]} ${m[2]} ${m[3]}` : fieldVal('nomer');
      }
      default:
        return genericPlate();
    }
  }
