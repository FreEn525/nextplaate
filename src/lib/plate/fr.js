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


  PLATE_RULES.fr = () => plateFR();
