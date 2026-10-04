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
      else if (k.startsWith('data-')) el.setAttribute(k, v);
      else el[k] = v;                      // id, value, checked, disabled, hidden, title, min, max, step, placeholder...
    }
    kids.flat().forEach(c => { if (c !== null && c !== undefined && c !== false) el.append(c); });
    return el;
  }
