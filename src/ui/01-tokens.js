  /* =====================================================================
   *  SHARED LOOK  (one palette + one set of controls for the panel AND the batch window)
   * ===================================================================== */
  // NextPlaate mark: a round camera with a plus (a photo to add), in three blues and white. The shapes are those of the logo file
  // (logo_nextplaate.svg, optimised with svgo to one decimal: the drawing is the same pixel for pixel); the blues are the logo's own.
  const LOGO_BLUES = { a: '#3781c5', b: '#529bde', c: '#82c3ff' };
  const LOGO_BODY = '<g transform="translate(-551 -180.5)"><circle cx="651.5" cy="281.4" r="96" class="w"/><path d="M650.7 188.5a101 101 0 0 0-20.4 2.2 86 86 0 0 0-23.5 9 89 89 0 0 0-34.8 33.8 88 88 0 0 0-9.6 23 100 100 0 0 0-3.3 26.8 91 91 0 0 0 7.2 33.4l2.3-1.8a71 71 0 0 1 16.2-8.7 70 70 0 0 1 12.3-3.6v-52l.9-2a12 12 0 0 1 2.8-4 12 12 0 0 1 4-2.4 9 9 0 0 1 3.9-.6q.4 0 .7-.2l.4-.4.5-.8q.4-.8 1-1.5l2.2-2.2 2-1 1.4-.2q1.5-.3 4-.3a156 156 0 0 1 15 .5l1.2.5 2.3 1.7a9 9 0 0 1 1.7 2.4l.8 1.4h13v-4.7l.3-1.8q0-1.5.3-2.8l.2-1 .8-3.5v-.4l1.3-4 1.6-4.3 1.8-4 2-3.9 2-3.6.6-.9 3.5-5.4.7-.9 2.8-4 2.6-3 .9-1-4-1.3a91 91 0 0 0-14-2.3z" class="a"/><path d="m676.3 192.2-.9 1-2.5 3.2q-1.4 1.6-3 4l-.6.8-3.5 5.4-.6.9a101 101 0 0 0-7.4 15.8l-1.2 4-.1.4-.8 3.4-.2 1.1-.3 2.7-.3 2v4.6H690l3.8.3q1 0 1.7.4.9.3 1.8 1t1.7 1.4a15 15 0 0 1 2.7 3.6l1 2v35l-.4 35.3-.4 1.6a13 13 0 0 1-2.4 3.4q-.7.8-1.5 1.3-.7.6-1.8 1L694 329h-11.2l.6 1.4a246 246 0 0 0 11.4 20.7 65 65 0 0 0 7 8.4 77 77 0 0 0 17.3-14.9 98 98 0 0 0 16.5-25 90 90 0 0 0 6.8-21.9 114 114 0 0 0 1.2-9.5 131 131 0 0 0-.5-19.2 121 121 0 0 0-6.7-24.3l-1-2-.6-.2h-2.1l-.2 4.6a34 34 0 0 1-.6 5.4l-1.2 2.5a13 13 0 0 1-4 3.9 12 12 0 0 1-6.3 1.7 12 12 0 0 1-9.4-5 9 9 0 0 1-1.9-4.7l-.3-3.7-.2-5-4.7-.2-4.3-.3q-.7 0-1.3-.4L696 240a12 12 0 0 1-3-3.2 11 11 0 0 1-1.5-4.1 15 15 0 0 1 .5-7l1.2-2.2a15 15 0 0 1 5.2-4.3l1.1-.5 2.7-.5q1.5-.2 3.4-.2h3.4v-8.6l-1.8-1.6a50 50 0 0 0-9-6.1 93 93 0 0 0-18.4-8.4z" class="c"/><path d="M701.8 359.5a26 26 0 0 1-3.3-3.5 64 64 0 0 1-7.3-10.9 179 179 0 0 1-7.6-14.7l-.7-1.4h-63.2c-8 0-13.2-.1-13.5-.2l-1.3-.4-1.2-.6-1.2-.7-1.1-.8-1-1a14 14 0 0 1-2.4-3.4l-1-2v-17.4a59 59 0 0 0-12.2 3.6 78 78 0 0 0-16.2 8.8l-2.3 1.7a92 92 0 0 0 31.3 39.8 95 95 0 0 0 53.3 18.3l7-.4a88 88 0 0 0 29.2-7 88 88 0 0 0 14.7-7.8" class="b"/><path d="M720.3 202.8a8 8 0 0 1 5 1.4 7 7 0 0 1 3 5.3v12.8h6.5l7.3.5 2 .8.8.7 1.7 2.1a8 8 0 0 1 1 2.9v1.5a8 8 0 0 1-1.4 4.2l-1 1.2q-.8.8-1.6 1.2l-1.9.7q-1 .3-2.7.3l-4.3.1h-6.3v6.1l-.5 7.2-.6 1.2a8 8 0 0 1-2.2 2.2l-1.3.8a7 7 0 0 1-7-.4 8 8 0 0 1-3.8-5.8V238h-6l-6.7-.4-1.7-.7-1.4-1.3-1-1.2a6 6 0 0 1-1-2.7V229a8 8 0 0 1 1.3-3.4 9 9 0 0 1 2.5-2.4l1-.5 2.5-.3 4.5-.1h6v-6.7l.4-7.4.8-1.9a8 8 0 0 1 4.4-3.2zm-68.5 73.3a21 21 0 0 0-4.4.6 12 12 0 0 0-3.5 2 14 14 0 0 0-4.5 6.6v1.1l.8 1.2.5.3.5.1h.4q.3 0 .5-.3.3 0 .5-.4l.9-1.3a10 10 0 0 1 1.6-2.5 9 9 0 0 1 5-2.6 11 11 0 0 1 3.2-.1h1.8q.3 0 .5-.3.2 0 .4-.5l.5-.9.1-.7q0-.4-.3-.8l-.7-.7-1.4-.6z" class="a"/><path d="M649.2 255.6a27 27 0 0 0-11.7 3 32 32 0 0 0-8.2 6 32 32 0 0 0-6 9 29 29 0 0 0-1.7 4.9l-.4 3a42 42 0 0 0 .4 10 25 25 0 0 0 2.6 6.7 34 34 0 0 0 7.4 9.4 31 31 0 0 0 12 6 28 28 0 0 0 13.3-.1 24 24 0 0 0 7-3 31 31 0 0 0 12.3-13.7 30 30 0 0 0-1.9-27.5 29 29 0 0 0-11.2-10.5 28 28 0 0 0-13.8-3.2zm1.5 9.4a19 19 0 0 1 12.6 5.3 20 20 0 0 1 5.7 9.8 19 19 0 0 1-2.2 14.8 21 21 0 0 1-12 9.3l-1.6.2a54 54 0 0 1-8.1-.2 13 13 0 0 1-3.6-1.4 23 23 0 0 1-9-8.4 20 20 0 0 1-1.5-15.1 20 20 0 0 1 4.8-8.2 21 21 0 0 1 8.1-5.2 19 19 0 0 1 6.8-1m28.9-10.2h13.9v9.1h-13.9z" class="a"/><path d="M649.9 180.5a173 173 0 0 0-12.5.7 113 113 0 0 0-27.2 7.5 97 97 0 0 0-26.7 17.5 165 165 0 0 0-11 12 103 103 0 0 0-15.8 29.2 107 107 0 0 0-5.4 25 128 128 0 0 0 1 25 109 109 0 0 0 8.4 27 99 99 0 0 0 35.7 41 106 106 0 0 0 35.1 14.9 96 96 0 0 0 31.7 1.4 97 97 0 0 0 44.8-17 104 104 0 0 0 27.8-28.6 100 100 0 0 0 16.3-56.2 106 106 0 0 0-3.5-24.8l-2.5-7.8-2-5.3-1.2.2-1.6.3-.9.1-.2.3v.4l.3 1.5 1 2.6a98 98 0 0 1 1.9 62 102 102 0 0 1-23.6 39.8 103 103 0 0 1-33.3 22 97 97 0 0 1-28.5 6.5 127 127 0 0 1-21.8-1 92 92 0 0 1-29.9-10.5 101 101 0 0 1-30.3-25.6 97 97 0 0 1-5.9-111.1 96 96 0 0 1 28-29 91 91 0 0 1 29.4-12.8 119 119 0 0 1 12.9-2.2 151 151 0 0 1 20.3-.1 110 110 0 0 1 23.6 5.6 91 91 0 0 1 21 11.1l4.6 3.1 1.2-1.6.8-1.5v-.4l-.4-.5q-.5-.6-2.2-1.7a125 125 0 0 0-20.5-11.6 102 102 0 0 0-39-7.4z" class="a"/><path d="m720.8 199.7-2.7.3a12 12 0 0 0-5.9 3.1l-1.7 2.2a12 12 0 0 0-1.6 3.8l-.3 4.2-.2 4.6h4.5v-2.2l.4-7.2.6-1.2a8 8 0 0 1 2.2-2.1l1.3-.8a8 8 0 0 1 3-.7 7 7 0 0 1 2.8.5 8 8 0 0 1 2.5 1.5l1 1.1a8 8 0 0 1 1.5 3.8l.1 5.5v6.2h6l6.6.4 1.7.7 1.4 1.3 1 1.3a6 6 0 0 1 1 2.6v2.8a8 8 0 0 1-1.3 3.4 8 8 0 0 1-3.4 3l-2.6.2-4.5.1h-5.9v4.4h7.4a29 29 0 0 0 6-.7l2.3-1.1a15 15 0 0 0 5.3-6l.6-2.4a16 16 0 0 0-1-7.4l-1.4-2.4a10 10 0 0 0-2.2-2l-2.5-1.4-1.3-.4-1.7-.2-2.6-.2-4.7-.2-.2-5-.6-5-.9-2.4-.7-1a15 15 0 0 0-4.2-3.6 11 11 0 0 0-3.9-1.3zm10.7 50.2.8 1.2v-1.2z" class="w"/></g>';
  const LOGO = h => `<svg width="${h}" height="${Math.round(h * 201.7 / 201.1)}" viewBox="0 0 201.1 201.7" style="display:block" aria-hidden="true"><style>.a{fill:${LOGO_BLUES.a}}.b{fill:${LOGO_BLUES.b}}.c{fill:${LOGO_BLUES.c}}.w{fill:#fff}</style>${LOGO_BODY}</svg>`;
  const WORDMARK = h => `<span class="brand">${LOGO(h)}<span>Next<b>Plaate</b></span></span>`;
  // The one blue of the script: the site's own (theme dark-blue.css of platesmania.com, #4765a0). The page-level pieces that cannot read
  // the tokens below (the hover outline while selecting, the console banner) use this constant.
  const SITE_BLUE = '#4765a0';

  // DESIGN TOKENS. Every colour of the panel, the card and the batch window comes from here: no other file writes a colour.
  //   palette   --primary, --primary-h (hover), --primary-soft (light fill and borders), --primary-tint (very light fill), --ring (focus)
  //             = #4765a0, #324c80, #cad9f6 (the site's "additional colour"), derived tint, derived ring
  //   neutrals  --ink (text), --mute (secondary text), --line / --line2 (borders), --bg (panel), --paper, --soft, --off
  //   states    --danger*, --ok*, --warn* : a fill, a border and a text colour each
  //   shape     --r (radius: 0, PlatesMania is all rectangles; --r-round only for the member's profile picture in the bar), --h (control height), --h-sm
  //   type      11 (small caps labels) 12 (help, small) 13 (controls, chips) 14 (text) 16 (titles, the cross) 18 (the star): no other size
  // Where the site and the script differ on purpose: the secondary text is darker than the site's grey (#7c8082) to stay readable at
  // 12 px; every control has the same height scale, the same square corners and the same focus ring.
  const UI_BASE = `
    :host{--primary:#4765a0;--primary-h:#324c80;--primary-soft:#cad9f6;--primary-tint:#eef2fb;--on-primary:#fff;--ring:rgba(71,101,160,.28);
          --ink:#2d2d2d;--mute:#626a70;--line:#e4e4e4;--line2:#cfcfcf;--bg:#f5f5f5;--paper:#fafafa;--soft:#f0f0f0;--off:#e8e8e8;--off-ink:#8f9498;
          --danger:#d9534f;--danger-soft:#fde2e1;--danger-line:#f3b5b2;--danger-ink:#8a1c17;
          --ok-soft:#e6f4ea;--ok-line:#b7dfc1;--ok-ink:#1e6b34;--warn-soft:#fff3cd;--warn-line:#f0dc9a;--warn-ink:#7a4f00;
          --r:0;--r-round:50%;--h:38px;--h-sm:32px;--h-rail:40px;
          font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink)}
    *{box-sizing:border-box}
    [hidden]{display:none!important}
    button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:none;box-shadow:0 0 0 3px var(--ring)}
    .btn{height:var(--h);padding:0 14px;border-radius:var(--r);border:1px solid var(--primary);background:var(--primary);color:var(--on-primary);font:inherit;font-weight:600;cursor:pointer;white-space:nowrap}
    .btn:hover{background:var(--primary-h);border-color:var(--primary-h)}
    .btn.ghost{background:#fff;color:var(--ink);border-color:var(--line2)}
    .btn.ghost:hover{background:var(--primary-tint);border-color:var(--primary-soft)}
    .btn.danger{background:#fff;color:var(--danger);border-color:var(--danger)}
    .btn.danger:hover{background:var(--danger);color:#fff}
    .btn.sm{height:var(--h-sm);padding:0 12px;font-size:13px}
    .btn.lg{height:44px;padding:0 22px}
    .btn:disabled{background:var(--off);border-color:var(--off);color:var(--off-ink);cursor:not-allowed}
    input,select,textarea{color:var(--ink)}
    input[type=text],input[type=number],select,textarea{padding:0 10px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:inherit;outline:none}
    input[type=text],input[type=number],select{height:var(--h)}
    input[type=text]:focus,input[type=number]:focus,select:focus,textarea:focus{border-color:var(--primary)}
    input[type=checkbox],input[type=range]{accent-color:var(--primary);cursor:pointer}
    .brand{display:flex;align-items:center;gap:10px;font-weight:500;letter-spacing:-.01em;color:var(--ink)}
    .brand svg{display:block;flex:none}
    .brand b{font-weight:800;color:var(--primary)}
    .mute{color:var(--mute)}
    .iconbtn{width:var(--h-sm);height:var(--h-sm);padding:0;display:grid;place-items:center;font:inherit;font-size:16px;line-height:1;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--mute);cursor:pointer}
    .iconbtn:hover{background:var(--primary-tint);color:var(--ink);border-color:var(--primary-soft)}
    .iconbtn svg{display:block;margin:auto}
    .chip{width:100%;min-height:var(--h-sm);padding:5px 10px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:inherit;font-size:13px;text-align:left;cursor:pointer;overflow-wrap:anywhere}
    .chip:hover{background:var(--primary-tint);border-color:var(--primary-soft)}
    .chip.best{border-color:var(--primary-soft);background:var(--primary-soft);color:var(--primary-h);font-weight:600}
    .chip.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
    .pills{display:flex;flex-wrap:wrap;gap:6px}
    .pill{min-height:var(--h-sm);padding:4px 12px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:inherit;font-size:13px;cursor:pointer;overflow-wrap:anywhere}
    .pill:hover{background:var(--primary-tint);border-color:var(--primary-soft)}
    .pill.on{border-color:var(--primary);background:var(--primary-soft);color:var(--primary-h);font-weight:600}
    .pill.removable:hover{background:var(--danger-soft);border-color:var(--danger-line);color:var(--danger-ink)}
    .cardbox{display:flex;flex-direction:column;gap:10px;padding:12px}
    .cardbox textarea{width:100%;min-height:180px;padding:10px;resize:vertical;line-height:1.5}
    .wn-section{margin:0 0 14px}
    .wn-item{margin:4px 0;font-size:13px;line-height:1.45}
    .secs{gap:0}
    .sec{display:flex;flex-direction:column;gap:6px;padding:10px 0;border-top:1px solid var(--line)}
    .secs > .sec:first-child{border-top:0;padding-top:0}
    .ln{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;font-size:13px;color:var(--ink)}
    .ln b{font-weight:600}
    .ln a,.mine-n{color:var(--primary-h);font-weight:600}
    .mine-item{white-space:nowrap}
    details.fold{border-top:1px solid var(--line);padding-top:10px}
    details.fold summary{cursor:pointer;font-size:13px;color:var(--primary-h);font-weight:600}
    details.fold[open] summary{margin-bottom:8px}
    .stats{display:flex;flex-wrap:wrap;gap:12px 28px}
    .stat{display:flex;flex-direction:column}
    .stat b{font-size:18px;color:var(--primary-h)}
    .stat a{font-size:18px;font-weight:700;color:var(--primary-h);text-decoration:none}
    .stat a:hover{text-decoration:underline}
    .stat span{font-size:12px}
    .track{height:8px;background:var(--primary-tint);border:1px solid var(--line)}
    .fill{height:100%;background:var(--primary)}
    details.missing summary{cursor:pointer;font-size:12px;color:var(--mute)}
    .lookups{display:flex;flex-direction:column;gap:6px}
    .vehline{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 8px;font-size:14px}
    .cardrow{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}
    .hint{margin:0;font-size:12px;color:var(--mute)}
    .count{margin-left:auto;font-size:12px;color:var(--mute)}
    .tagbox{display:flex;flex-direction:column;gap:12px;padding:12px}
    .tagbox input[type=text]{width:100%}
    .tagrow{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
    .tagrow .pills{flex:1 1 200px;min-width:0}
    .tagquick,.taggroup{display:flex;flex-direction:column;gap:6px}
    .taggroups{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px 18px}
    .flags{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:6px}
    .mhead{display:flex;align-items:center;gap:8px;min-height:var(--h-sm);margin-bottom:2px}
    .mactions{margin-left:auto;display:flex;align-items:center;gap:8px}
    .star{font-size:18px;line-height:1}
    .star.on{color:var(--primary);border-color:var(--primary-soft);background:var(--primary-tint)}
    .members{display:flex;flex-direction:column;gap:8px}
    .members-panel{display:flex;flex-direction:column;gap:12px}
    .membersadd{display:flex;flex-direction:column;gap:8px}
    .addrow{display:flex;gap:8px}
    .addrow input{flex:1;min-width:0}
    .mlines{display:flex;flex-direction:column}
    .mrow{display:flex;align-items:stretch;gap:8px;position:relative}
    .mrow.dragging{opacity:.4}
    .mrow.before::before,.mrow.after::after{content:'';position:absolute;left:0;right:0;height:3px;background:var(--primary)}
    .mrow.before::before{top:-5px}
    .mrow.after::after{bottom:-5px}
    .grip{flex:none;width:24px;padding:0;border:0;background:none;color:var(--off-ink);font:inherit;font-weight:700;letter-spacing:-2px;cursor:grab}
    .grip:hover,.grip:focus-visible{color:var(--primary-h)}
    .grip.off{cursor:default;color:transparent}
    .member{flex:1;min-width:0;display:flex;align-items:center;gap:12px;padding:6px 8px;border:1px solid var(--line);background:#fff;color:var(--ink);text-decoration:none}
    .member:hover{background:var(--primary-tint);border-color:var(--primary-soft)}
    .member.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
    .mrow.pinned .member{background:var(--primary-tint);border-color:var(--primary-soft)}
    .member img,.member .mav{flex:none;width:40px;height:40px;object-fit:cover;background:var(--soft)}
    .member .mav{display:grid;place-items:center;font-weight:700;font-size:16px;color:var(--primary-h);background:var(--primary-soft)}
    .member .mname{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:600}
    .member .mtag{flex:none;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--primary-h)}
    .mrow .iconbtn{height:auto;min-height:54px}
    .flagpick{display:flex;flex-direction:column;gap:8px}
    .flagpick input[type=text]{width:100%}
    .pickrows{display:flex;flex-direction:column;gap:6px;max-height:340px;overflow-y:auto;padding:2px}
    .pickrows .chk img{flex:none}
    .flagblock{display:flex;flex-direction:column;gap:8px}
    .flagblock input{width:100%}
    .flag{height:var(--h-sm);min-width:0;display:flex;align-items:center;gap:8px;padding:0 8px;border:1px solid var(--line2);background:#fff;color:var(--ink);font-size:12px;text-decoration:none}
    .flag .fname{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .flag .flagcode{font-weight:700}
    .flag:hover{background:var(--primary-tint);border-color:var(--primary)}
    .flag.on{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
    .flag img{display:block;flex:none;width:22px;height:15px;object-fit:contain}
    .csearch{display:flex;align-items:center;gap:12px}
    .csearch input{flex:1;min-width:0}
    .cgroup{display:flex;flex-direction:column;gap:8px;margin-top:12px}
    .cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}
    .ctile{height:var(--h-rail);min-width:0;display:flex;align-items:center;gap:10px;padding:0 10px;border:1px solid var(--line2);background:#fff;color:var(--ink);font-size:14px;text-decoration:none}
    .ctile:hover,.ctile:focus-visible{background:var(--primary-tint);border-color:var(--primary)}
    .ctile.first{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary)}
    .ctile img{display:block;flex:none;width:40px;height:27px;object-fit:contain}
    .ctile .flagcode{flex:none;width:40px;text-align:center;font-weight:700;font-size:12px}
    .ctile .cname{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .cat{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
  `;

