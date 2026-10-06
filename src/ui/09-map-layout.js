  /* =====================================================================
   *  MAP LAYOUT  (the pieces the world map and the maps of regions share: the frame and the ranked list)
   *      mapLayout({ svg, tools, legend, tip, side })   the map with its tools, legend and tip laid over it, and the column on its right
   *      mapRow({ key, label, href, n, max, go })       a line of the ranked list: a bar for its share, the name (a link), the figure,
   *                                                     and a "Regions" button when go is given
   *    Pointing at a line lights its shape on the map (the shapes carry the same data-key).
   * ===================================================================== */
  function mapLayout({ svg, tools, legend, tip, side }) {
    const light = (key, on) => {
      const shape = key && svg.querySelector(`[data-key="${CSS.escape(key)}"]`);
      if (shape) shape.classList.toggle('hl', on);
    };
    const column = h('aside', { class: 'side' }, side);
    column.addEventListener('mouseover', e => { const row = e.target.closest('[data-key]'); if (row) light(row.dataset.key, true); });
    column.addEventListener('mouseout', e => { const row = e.target.closest('[data-key]'); if (row) light(row.dataset.key, false); });
    return h('div', { class: 'main' }, h('div', { class: 'stage' }, svg, tools, legend, tip ? h('div', { class: 'tip', text: tip }) : null), column);
  }

  function mapRow({ key, label, href, n, max, go }) {
    return h('li', { class: 'row', 'data-key': key },
      h('span', { class: 'share', style: `width:${Math.max(2, Math.round(100 * n / Math.max(1, max)))}%` }),
      h('a', { class: 'lnk', href, target: '_blank', rel: 'noopener noreferrer', text: label }),
      h('span', { class: 'n', text: String(n) }),
      go ? h('button', { type: 'button', class: 'go', text: 'Regions', title: 'The regions of this country on a map', onclick: go }) : null);
  }
