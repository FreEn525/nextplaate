  PLATE_RULES.tr = () => {
    const sel = document.querySelector('select[name="region"]');
    // the option value is an internal code (40001); the label starts with the plate number ("50 - Nevsehir")
    const label = sel && sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '';
    const region = label.match(/^\s*(\d{2})/);
    return joinParts([region && region[1], fieldVal('let'), fieldVal('digit')]);
  };
