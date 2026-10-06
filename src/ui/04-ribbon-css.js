  const RIBBON_CSS = `
    .side{display:flex;justify-content:flex-end;height:100%;align-items:stretch;pointer-events:none}
    .side>*{pointer-events:auto}
    .rail{width:56px;flex:none;display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 0;background:#fff;border-left:1px solid var(--line2);box-shadow:-6px 0 20px rgba(0,0,0,.08)}
    .rail .logo{align-self:stretch;display:flex;justify-content:center;padding:4px 0 12px;margin-bottom:4px;border-bottom:1px solid var(--line)}   /* the brand: its own cell, a line under it */
    .rme{flex:none;width:var(--h-rail);height:var(--h-rail);display:grid;place-items:center;overflow:hidden;border:2px solid var(--primary-soft);border-radius:var(--r-round);background:var(--primary-soft);color:var(--primary-h);font-size:16px;font-weight:700;text-decoration:none}
    .rme img{display:block;width:100%;height:100%;object-fit:cover}
    .rme:hover{border-color:var(--primary)}
    .rme.on{border-color:var(--primary);box-shadow:0 0 0 2px var(--ring)}
    .rsep{width:24px;height:1px;background:var(--line2);margin:auto 0 4px}
    .rbtn{width:var(--h-rail);height:var(--h-rail);display:grid;place-items:center;border:0;border-radius:var(--r);background:none;color:var(--mute);cursor:pointer}
    .rbtn:hover{background:var(--primary-tint);color:var(--primary-h)}
    .rbtn[aria-pressed="true"]{background:var(--primary);color:var(--on-primary)}
    .drawer.passive{pointer-events:none!important;opacity:.82}
    .drawer{width:min(340px,calc(100vw - 56px));display:flex;flex-direction:column;background:var(--bg);border-left:1px solid var(--line2);box-shadow:-10px 0 30px rgba(0,0,0,.14);position:relative}
    .dhead{display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:56px;padding:0 16px;background:#fff;border-bottom:1px solid var(--line)}
    .dhead h2{margin:0;font-size:16px;font-weight:700;color:var(--primary-h)}
    .dbody{flex:1;min-height:0;overflow-y:auto;padding:12px;display:flex;flex-direction:column}
    .dsec{display:flex;flex-direction:column;gap:10px}
    .group{background:#fff;border:1px solid var(--line);border-radius:var(--r);display:flex;flex-direction:column;overflow:hidden}
    .gbody{display:flex;flex-direction:column;gap:8px;padding:10px}
    .gtitle{order:-1;padding:7px 10px;border-bottom:1px solid var(--line);background:#fff;color:var(--primary-h);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}
    .gbody .btn:not(.sm):not(.fit){width:100%;height:auto;min-height:var(--h);padding-top:6px;padding-bottom:6px;line-height:1.25;white-space:normal}   /* a long label wraps instead of widening the drawer */
    .pnote{margin:0;padding:6px 8px;border-radius:var(--r);background:var(--primary-tint);color:var(--mute);font-size:12px}
    .btnrow{display:flex;flex-wrap:wrap;gap:8px}
    .btnrow .btn{flex:1 1 110px;min-width:0}
    .row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;font-size:12px}
    .row label{font-weight:600;white-space:nowrap}
    .row input{width:90px}
    .field{display:flex;flex-direction:column;gap:4px}
    .field label{font-size:12px;font-weight:600}
    .field input{width:100%}
    .gbody textarea{width:100%;min-height:64px;resize:vertical;padding:8px;font-size:13px}
    .lens-out{display:flex;flex-direction:column;gap:6px;min-width:0}
    
    .lens-cands{display:flex;flex-direction:column;gap:6px}
    
    
    
    
    .lens-none{font-size:13px;color:var(--mute)}
    .chk{display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer}
    .chk input{width:16px;height:16px;margin:0;flex:none}
    .slots{display:flex;flex-direction:column;gap:8px}
    .slot{display:flex;align-items:center;gap:8px;min-height:52px;padding:6px 8px;border:1px solid var(--line);border-radius:var(--r);background:var(--paper)}
    .slot img{width:52px;height:40px;object-fit:cover;border-radius:var(--r);border:1px solid var(--line);flex:none}
    .slot .t{flex:1;min-width:0;font-size:12px}
    .slot .t small{display:block;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .slot .x{background:none;border:0;font-size:16px;color:var(--mute);cursor:pointer}
    .slot .x:hover{color:var(--ink)}
    .slot.empty{color:var(--mute);border-style:dashed;background:#fff;font-size:12px;justify-content:center}
    .qinfo{font-size:12px;color:var(--mute)}
    .lbl{font-size:12px;font-weight:600}
    .presult{margin:0;font-size:13px}
    .presult{padding:6px 8px;border-radius:var(--r);background:#fff;border:1px solid var(--line)}
    .chk.dim{color:var(--mute)}
    .chklist{display:flex;flex-direction:column;gap:8px}
    .kv{display:flex;justify-content:space-between;gap:12px;font-size:13px;padding:2px 0}
    .sub{margin:10px 0 2px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--mute)}
    .presult.warn{background:var(--danger-soft);border-color:var(--danger-line);color:var(--danger-ink);font-weight:600}
    .presult.ok{background:var(--ok-soft);border-color:var(--ok-line);color:var(--ok-ink)}
    .toast{position:absolute;left:50%;transform:translateX(-50%);bottom:16px;width:min(420px,calc(100vw - 32px));box-sizing:border-box;overflow-wrap:anywhere;padding:10px 16px;text-align:center;background:var(--ink);border-radius:var(--r);box-shadow:0 8px 24px rgba(0,0,0,.35);font-size:14px;line-height:1.4;color:#fff}
    .toast:empty{display:none}
    .toast b{color:#fff;text-decoration:underline;text-decoration-color:var(--primary-soft)}
    .kblist{display:flex;flex-direction:column;gap:6px}
    .kbrow{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px}
        .kbright{display:flex;align-items:center;gap:4px}
    .kbkey{width:84px;height:var(--h-sm);padding:0 8px;border:1px solid var(--line2);border-radius:var(--r);background:#fff;color:var(--ink);font:700 12px system-ui,sans-serif;cursor:pointer}
    .kbkey:hover{border-color:var(--primary-soft);background:var(--primary-tint)}
    .kbkey.static{cursor:default}
    .kbkey.static:hover{border-color:var(--line2);background:#fff}
    .kbspacer{width:26px;flex:none}
    .kbreset{width:26px;height:var(--h-sm);border:0;background:none;color:var(--mute);cursor:pointer;font-size:14px}
    .kbreset:hover{color:var(--ink)}
    .kbreset.off{visibility:hidden}
    @media (max-width:520px){ .drawer{width:calc(100vw - 56px)} .rail{width:48px} }
  `;

