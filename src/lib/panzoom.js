  /* =====================================================================
   *  PAN AND ZOOM  (for an SVG map: the world, the regions of a country)
   *    The viewBox is the window on the map. The wheel zooms at the pointer, a drag moves the map (and the click that ends a drag opens
   *    nothing), buttons zoom by steps and go to a preset view.
   *      const pz = panZoom(svg, { w, h, max: 40, onChange: zoom => ... });   // w, h: the size of the whole map; zoom: 1 = the whole map
   *      pz.set(x, y, width)    pz.zoomAt(factor, x, y)    pz.reset()    pz.toolbar([{ label, title, view: [x, y, width] }])
   * ===================================================================== */
  function panZoom(svg, { w: W, h: H, max = 40, onChange = () => {} }) {
    let box = [0, 0, W];
    const label = h('span', { class: 'mute zl', text: 'World' });
    const set = (x, y, w) => {
      w = Math.min(W, Math.max(W / max, w));
      const hh = w * H / W;
      box = [Math.min(W - w, Math.max(0, x)), Math.min(H - hh, Math.max(0, y)), w];
      svg.setAttribute('viewBox', `${box[0]} ${box[1]} ${w} ${hh}`);
      label.textContent = w >= W - 0.5 ? 'World' : `\u00d7${(W / w).toFixed(1)}`;
      onChange(W / w);
    };
    const zoomAt = (factor, cx, cy) => {                      // cx, cy in map units: the point that stays where it is
      const w = Math.min(W, Math.max(W / max, box[2] / factor));
      set(cx - (cx - box[0]) * (w / box[2]), cy - (cy - box[1]) * (w / box[2]), w);
    };
    const centre = () => [box[0] + box[2] / 2, box[1] + box[2] * H / W / 2];
    const mapPoint = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return [q.x, q.y]; };
    svg.addEventListener('wheel', e => { e.preventDefault(); const [x, y] = mapPoint(e); zoomAt(e.deltaY < 0 ? 1.25 : 1 / 1.25, x, y); }, { passive: false });
    let drag = null, moved = false;
    svg.addEventListener('pointerdown', e => { if (e.button === 0) { drag = { x: e.clientX, y: e.clientY, box: box.slice() }; moved = false; } });
    svg.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!moved && Math.hypot(dx, dy) < 4) return;            // a click is not a drag
      if (!moved) { moved = true; svg.setPointerCapture(e.pointerId); svg.classList.add('drag'); }
      const k = drag.box[2] / svg.getBoundingClientRect().width;
      set(drag.box[0] - dx * k, drag.box[1] - dy * k, drag.box[2]);
    });
    const end = () => { drag = null; svg.classList.remove('drag'); };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    const tool = (text, title, run) => h('button', { type: 'button', class: 'pill', text, title, onclick: run });
    const toolbar = (presets = []) => h('div', { class: 'views' },
      tool('+', 'Zoom in', () => zoomAt(1.5, ...centre())), tool('\u2212', 'Zoom out', () => zoomAt(1 / 1.5, ...centre())),
      tool('World', 'The whole map', () => set(0, 0, W)), presets.map(p => tool(p.label, p.title, () => set(...p.view))),
      label, h('span', { class: 'mute', text: 'Scroll to zoom, drag to move' }));
    return { set, zoomAt, reset: () => set(0, 0, W), toolbar };
  }
