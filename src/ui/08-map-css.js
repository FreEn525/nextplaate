  /* =====================================================================
   *  MAP STYLE  (the world map and the maps of regions: the window's layout, sea, land, the five shades, legend; tokens only)
   *    Layout: a bar (who, which map), then the map on the left filling the height with its tools laid over it, and a column on the
   *    right (summary, ranked list, notes). Under 760 px the column goes under the map. Nothing scrolls but the list.
   * ===================================================================== */
  const MAP_CSS = `
    .wm{display:flex;flex-direction:column;flex:1;min-height:0}
    .wm .bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid var(--line);background:var(--paper)}
    .wm .bar input{flex:0 1 190px;min-width:0;height:var(--h-sm)}
    .wm .bar select{height:var(--h-sm);max-width:100%}
    .wm .bar .btn{height:var(--h-sm)}
    .wm .bar .gap{flex:1}
    .wm .bar .lbl{font-size:12px;color:var(--mute)}
    .wm .view{display:flex;flex-direction:column;flex:1;min-height:0}
    .wm .msg{margin:0;padding:24px 16px;font-size:14px;color:var(--mute)}
    .wm .main{display:flex;flex:1;min-height:0}
    .wm .stage{position:relative;flex:1;min-width:0;background:var(--primary-tint)}
    .wm svg{display:block;width:100%;height:100%;cursor:grab;touch-action:none}
    .wm svg.drag{cursor:grabbing}
    .wm path,.wm circle{vector-effect:non-scaling-stroke}
    .wm .rest,.wm .c{fill:var(--land);stroke:#fff;stroke-width:.6}
    .wm a:hover .c,.wm a:focus .c,.wm .c.hl{stroke:var(--ink);stroke-width:1.8}
    .wm .t1{fill:color-mix(in srgb,var(--primary) 50%,#fff)}
    .wm .t2{fill:color-mix(in srgb,var(--primary) 63%,#fff)}
    .wm .t3{fill:color-mix(in srgb,var(--primary) 76%,#fff)}
    .wm .t4{fill:color-mix(in srgb,var(--primary) 88%,#000)}
    .wm .t5{fill:color-mix(in srgb,var(--primary-h) 80%,#000)}
    .wm .dot{stroke:var(--ink);stroke-width:1}
    .wm .dot.t0{fill:var(--land)}
    .wm .tools{position:absolute;top:12px;right:12px;display:flex;flex-direction:column;gap:4px}
    .wm .tools button{min-width:var(--h-sm);height:var(--h-sm);padding:0 8px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:inherit;font-size:13px;font-weight:600;cursor:pointer}
    .wm .tools button:hover{background:var(--primary-tint);border-color:var(--primary-soft)}
    .wm .tools .zl{font-size:11px;color:var(--mute);text-align:center;background:rgba(255,255,255,.85)}
    .wm .legend{position:absolute;left:12px;bottom:12px;max-width:calc(100% - 24px);display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px;padding:6px 10px;border:1px solid var(--line2);background:rgba(255,255,255,.92);font-size:12px;color:var(--mute)}
    .wm .legend span{display:inline-flex;align-items:center;gap:6px}
    .wm .legend i{display:inline-block;width:16px;height:12px;border:1px solid var(--line2)}
    .wm .legend .t1{background:color-mix(in srgb,var(--primary) 50%,#fff)}
    .wm .legend .t2{background:color-mix(in srgb,var(--primary) 63%,#fff)}
    .wm .legend .t3{background:color-mix(in srgb,var(--primary) 76%,#fff)}
    .wm .legend .t4{background:color-mix(in srgb,var(--primary) 88%,#000)}
    .wm .legend .t5{background:color-mix(in srgb,var(--primary-h) 80%,#000)}
    .wm .legend .t0{background:var(--land)}
    .wm .tip{position:absolute;right:12px;bottom:12px;padding:2px 6px;font-size:11px;color:var(--mute);background:rgba(255,255,255,.85)}
    .wm .side{display:flex;flex-direction:column;flex:none;width:320px;min-height:0;border-left:1px solid var(--line);background:#fff}
    .wm .sum{padding:14px 16px;border-bottom:1px solid var(--line)}
    .wm .sum b{display:block;font-size:18px;color:var(--primary-h)}
    .wm .sum span{font-size:12px;color:var(--mute)}
    .wm .rows{flex:1;min-height:0;margin:0;padding:0;list-style:none;overflow:auto}
    .wm .row{position:relative;display:flex;align-items:center;gap:8px;min-height:36px;padding:0 16px;border-bottom:1px solid var(--line);font-size:13px}
    .wm .row .share{position:absolute;left:0;top:0;bottom:0;background:var(--primary-tint)}
    .wm .row.on{outline:1px solid var(--primary-soft);outline-offset:-1px}
    .wm .row a.lnk,.wm .row .n,.wm .row .go{position:relative}
    .wm .row a.lnk{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--primary-h);font-weight:600}
    .wm .row .n{font-variant-numeric:tabular-nums;font-weight:600}
    .wm .row .go{height:24px;padding:0 8px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:inherit;font-size:12px;cursor:pointer}
    .wm .row .go:hover{background:var(--primary-tint);border-color:var(--primary-soft)}
    .wm .foot{max-height:34%;overflow:auto;padding:10px 16px;border-top:1px solid var(--line);font-size:12px;color:var(--mute)}
    .wm .foot p{margin:0 0 6px}
    .wm a.lnk{color:var(--primary-h);font-weight:600}
    @media (max-width:760px){
      .wm .main{flex-direction:column}
      .wm .stage{flex:none;height:46%;min-height:230px}
      .wm .side{flex:1;width:auto;border-left:0;border-top:1px solid var(--line)}
      .wm .bar input{flex:1 1 140px}
      .wm .tip{display:none}
      .wm .tools{flex-direction:row;top:8px;right:8px}
      .wm .tools .zl{display:none}
      .wm .legend span:nth-child(2){display:none}
      .wm .legend{left:8px;bottom:8px;gap:2px 8px;padding:4px 8px;font-size:11px}
    }
  `;
