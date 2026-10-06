  /* =====================================================================
   *  DOM HELPERS  (features build their controls with h(), never with innerHTML on data)
   * ===================================================================== */
  // h('button', { class: 'btn', text: 'Go', onclick: fn }, child, [more children])
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v === undefined || v === null) continue;
      if (k === 'text') el.textContent = v;
      else if (k === 'class') el.className = v;
      else if (k === 'for') el.htmlFor = v;
      else if (/^on[a-z]+$/.test(k)) el.addEventListener(k.slice(2), v);
      else if (k.startsWith('data-') || k.startsWith('aria-') || k === 'role') el.setAttribute(k, v);   // attributes with no property of the same name
      else el[k] = v;                      // id, value, checked, disabled, hidden, title, min, max, step, placeholder...
    }
    kids.flat().forEach(c => { if (c !== null && c !== undefined && c !== false) el.append(c); });
    return el;
  }

  // The same for SVG elements (they need their own namespace): svgEl('path', { d, class }, ...children)
  function svgEl(tag, attrs, ...kids) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
    kids.forEach(k => el.append(k));
    return el;
  }
