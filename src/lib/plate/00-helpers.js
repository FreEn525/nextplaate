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

  const menu = id => { const el = document.getElementById(id); return el && el.offsetParent !== null ? selText(id) : ''; };   // a menu's label, only when the menu is shown (a hidden one keeps an old value)
  const PLATE_RULES = {};   // country code -> function that reads the plate from the upload form; one file per country, in this folder

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
