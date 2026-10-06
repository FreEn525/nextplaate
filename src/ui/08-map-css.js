  /* =====================================================================
   *  MAP STYLE  (the world map and the maps of regions: sea, land, the five shades, legend, tables; tokens only)
   * ===================================================================== */
  const MAP_CSS = `
    .wm{display:flex;flex-direction:column;gap:12px;padding:16px}
    .wm .who{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
    .wm .who input{flex:1 1 240px;min-width:0}
    .wm .sum{font-size:14px}
    .wm path,.wm circle{vector-effect:non-scaling-stroke}
    .wm .views{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
    .wm .views .zl{min-width:40px}
    .wm svg{display:block;width:100%;height:auto;background:var(--primary-tint);border:1px solid var(--line2);cursor:grab;touch-action:none}
    .wm svg.drag{cursor:grabbing}
    .wm .rest{fill:var(--land);stroke:#fff;stroke-width:.6}
    .wm .c{fill:var(--land);stroke:#fff;stroke-width:.6}
    .wm a:hover .c,.wm a:focus .c{stroke:var(--ink);stroke-width:1.5}
    .wm .t1{fill:color-mix(in srgb,var(--primary) 50%,#fff)}
    .wm .t2{fill:color-mix(in srgb,var(--primary) 63%,#fff)}
    .wm .t3{fill:color-mix(in srgb,var(--primary) 76%,#fff)}
    .wm .t4{fill:color-mix(in srgb,var(--primary) 88%,#000)}
    .wm .t5{fill:color-mix(in srgb,var(--primary-h) 80%,#000)}
    .wm .dot{stroke:var(--ink);stroke-width:1}
    .wm .dot.t0{fill:var(--land)}
    .wm .none{fill:none;stroke:var(--line2);stroke-width:1}
    .wm .legend{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;font-size:12px;color:var(--mute)}
    .wm .legend span{display:inline-flex;align-items:center;gap:6px}
    .wm .legend i{display:inline-block;width:16px;height:12px;border:1px solid var(--line2)}
    .wm .legend .t1{background:color-mix(in srgb,var(--primary) 50%,#fff)}
    .wm .legend .t2{background:color-mix(in srgb,var(--primary) 63%,#fff)}
    .wm .legend .t3{background:color-mix(in srgb,var(--primary) 76%,#fff)}
    .wm .legend .t4{background:color-mix(in srgb,var(--primary) 88%,#000)}
    .wm .legend .t5{background:color-mix(in srgb,var(--primary-h) 80%,#000)}
    .wm .legend .t0{background:var(--land)}
    .wm .extra{font-size:13px}
    .wm table{width:100%;border-collapse:collapse;font-size:13px}
    .wm td,.wm th{padding:5px 8px;border-bottom:1px solid var(--line);text-align:left}
    .wm th{font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
    .wm td.n{text-align:right;font-variant-numeric:tabular-nums}
    .wm a.lnk{color:var(--primary-h);font-weight:600}
  `;
