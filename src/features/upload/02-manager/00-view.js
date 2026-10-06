  // ---- manager overlay (its own shadow root) ----
  const mhost = document.createElement('div');
  mhost.id = 'pmg-batch';
  mhost.style.cssText = 'position:fixed;inset:0;z-index:2147483646;display:none;';
  const mroot = mhost.attachShadow({ mode: 'open' });
  mroot.innerHTML = `
    <style>${UI_BASE}
      .ov{position:absolute;inset:0;background:rgba(17,17,17,.55);display:flex;justify-content:center;padding:22px}
      .sheet{background:var(--bg);border-radius:4px;width:min(1400px,100%);max-height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.35)}
      .top{display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:56px;padding:0 16px;background:#fff;color:var(--ink);flex-wrap:wrap;border-bottom:1px solid var(--line)}
      .top h2{margin:0;font-size:16px;font-weight:700;display:flex;align-items:center;gap:14px}
      .top h2 small{font-size:14px;font-weight:500;color:var(--mute)}
      .acts{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .inl{display:inline-flex;align-items:center;gap:6px;font-size:13px}

      .paint{padding:12px 18px;background:#fff;border-bottom:1px solid var(--line);display:flex;gap:10px;align-items:center;flex-wrap:wrap}
      .lbl{font-weight:600;font-size:13px}
      .chips{display:flex;gap:8px;flex-wrap:wrap}
      .chip{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 10px;border-radius:4px;border:2px solid var(--line2);background:#fff;color:var(--ink);font:inherit;font-size:13px;cursor:pointer}
      .chip:hover{border-color:var(--primary-soft);background:var(--primary-tint)}
      .chip.on{background:var(--primary-soft);color:var(--primary-h);border-color:var(--primary-soft)}
      .chip kbd{display:inline-grid;place-items:center;min-width:18px;height:18px;border-radius:4px;background:var(--soft);color:var(--ink);font:700 11px system-ui}
      .chip.on kbd{background:#fff}
      .chip .rm{margin-left:2px;opacity:.55;font-size:15px;line-height:1}
      .chip .rm:hover{opacity:1}
      select.more{max-width:210px;font-size:13px}
      .tools{padding:10px 18px;background:var(--paper);border-bottom:1px solid var(--line);display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .tools .inl{margin-left:auto}
      .inl input[type=range]{width:140px}
      .msg{padding:6px 18px 0;min-height:28px;font-size:13px;color:var(--mute)}

      .grid{flex:1 1 0;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:14px 18px 18px;display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--cw,300px),1fr));gap:14px;align-content:start;grid-auto-rows:max-content}
      .grid::-webkit-scrollbar{width:12px}
      .grid::-webkit-scrollbar-thumb{background:var(--line2);border-radius:4px;border:3px solid var(--bg)}
      .empty{grid-column:1/-1;padding:40px 10px;text-align:center;color:var(--mute)}
      .card{position:relative;background:#fff;border:2px solid var(--primary-soft);border-radius:var(--r);overflow:hidden;cursor:pointer;user-select:none}
      .card.none{border:2px dashed var(--line2)}
      .card.done,.card.submitted{opacity:.5;cursor:default}
      .card.sel{border:3px solid var(--primary);box-shadow:0 0 0 3px var(--ring);background:var(--primary-tint)}
      .card.sel::after{content:'✓';position:absolute;bottom:34px;right:8px;width:24px;height:24px;border-radius:50%;background:var(--primary);color:var(--on-primary);display:grid;place-items:center;font-weight:800;font-size:14px;pointer-events:none}
      .card.sel img,.card.sel .noprev{filter:brightness(.92) saturate(1.1)}
      .card img,.card .noprev{width:100%;aspect-ratio:4/3;display:block;background:var(--soft)}
      .card img{object-fit:cover}
      .card .noprev{display:flex;align-items:center;justify-content:center;color:var(--mute);font:600 11px system-ui,sans-serif;text-align:center;padding:6px}
      .dupbadge{margin:4px 8px 0;padding:2px 8px;border-radius:4px;background:var(--warn-soft);color:var(--warn-ink);font-size:11px;font-weight:700;align-self:flex-start}
      .name{padding:6px 8px 0;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:6px 8px 8px}
      .badge{min-width:36px;text-align:center;padding:2px 8px;border-radius:var(--r);background:var(--primary-soft);color:var(--primary-h);font-weight:700;font-size:13px}
      .none .badge{background:var(--soft);color:var(--mute)}
      select.cat{flex:1 1 100%;min-width:0;height:28px;padding:0 6px;font-size:12px;border-radius:4px}
      .st{position:absolute;top:6px;left:6px;padding:2px 8px;border-radius:4px;background:#fff;border:1px solid var(--line2);font-size:11px;font-weight:700}
      .mini{position:absolute;top:6px;height:24px;border-radius:4px;border:1px solid var(--line2);font-size:11px;font-weight:700;cursor:pointer}
      .mini.rt{right:36px;padding:0 8px;background:var(--primary-soft);border-color:var(--primary-soft);color:var(--primary-h)}
      .mini.x{right:6px;width:24px;padding:0;background:#fff;color:var(--mute);font-size:15px;line-height:1;display:none}
      .card:hover .mini.x{display:block}
      .mini.x:hover{background:var(--danger);border-color:var(--danger);color:#fff}

      .zoom{position:fixed;top:50%;transform:translateY(-50%);z-index:5;width:min(760px,52vw);pointer-events:none;border:3px solid var(--ink);border-radius:4px;background:var(--ink);box-shadow:0 18px 50px rgba(0,0,0,.5);overflow:hidden}
      .zoom img{display:block;width:100%;max-height:88vh;object-fit:contain;background:var(--ink)}
      .zoom .zl{position:absolute;left:8px;bottom:8px;background:rgba(0,0,0,.65);color:#fff;font:600 12px system-ui,sans-serif;padding:3px 8px;border-radius:4px}

      .foot{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 18px;background:#fff;border-top:1px solid var(--line);flex-wrap:wrap}
      #mInfo{font-size:13px;color:var(--mute)}
      .cfm{position:absolute;inset:0;z-index:6;background:rgba(17,17,17,.45);display:flex;align-items:center;justify-content:center;padding:16px}
      .cbox{background:#fff;border-radius:6px;padding:20px;max-width:420px;width:100%;box-shadow:0 18px 50px rgba(0,0,0,.3)}
      .cbox h3{margin:0 0 8px;font-size:16px}
      .cbox p{margin:0 0 16px;color:var(--mute);font-size:14px}
      .cbox .acts{display:flex;justify-content:flex-end;gap:8px}
      @media (max-width:640px){ .ov{padding:0} .sheet{border-radius:0} .top h2 small{display:none} .tools .inl{margin-left:0} .grid{grid-template-columns:repeat(auto-fill,minmax(min(var(--cw,300px),100%),1fr))} }
    </style>
    <div class="zoom" id="zoom" hidden><img alt=""><span class="zl"></span></div>
    <div class="ov" id="ov">
      <div class="sheet">
        <div class="top">
          <h2>${WORDMARK(38)}<small>Batch upload</small></h2>
          <div class="acts">
            <button class="btn" id="mAdd">Add photos</button>
            <button class="btn ghost" id="mFolder">Add a folder</button>
            <label class="inl"><input type="checkbox" id="mSub"> with sub-folders</label>
            <button class="btn ghost" id="mClear">Clear all</button>
            <button class="btn ghost" id="mClose" title="Close (Esc)">Close</button>
          </div>
        </div>
        <div class="paint">
          <span class="lbl">1 · Click photos to select them (blue)</span>
          <span class="lbl">2 · Then give them a country:</span>
          <div class="chips" id="chips"></div>
          <select class="more" id="more"></select>
        </div>
        <div class="tools">
          <button class="btn ghost sm" id="mSelAll">Select all</button>
          <button class="btn ghost sm" id="mSelUn">Select without country</button>
          <button class="btn ghost sm" id="mSelNone">Deselect</button>
          <button class="btn danger sm" id="mDel" disabled>Delete selected</button>
          <label class="inl">Size <input type="range" id="mSize" min="200" max="560" step="10"></label>
        </div>
        <div class="msg" id="mMsg">Click photos to select them, then press a country (or its number key). Shift+click = range · Ctrl+A = all · 0 = remove country · Del = delete · Hover a photo to zoom.</div>
        <div class="grid" id="grid"></div>
        <div class="foot">
          <span id="mInfo"></span>
          <button class="btn lg" id="mStart" disabled>Start uploading</button>
        </div>
      </div>
    </div>
    <div class="cfm" id="cfm" hidden><div class="cbox" role="dialog" aria-modal="true"><h3 id="cfmTitle"></h3><p id="cfmText"></p><div class="acts"><button class="btn ghost" id="cfmNo">Cancel</button><button class="btn danger" id="cfmYes">Clear</button></div></div></div>
    <input type="file" id="fMulti" multiple accept="image/*" hidden>
    <input type="file" id="fFolder" webkitdirectory multiple hidden>`;
  document.body.appendChild(mhost);
  const M = id => mroot.getElementById(id);

