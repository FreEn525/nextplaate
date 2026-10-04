  /* =====================================================================
   *  PANEL  (shadow DOM keeps the site CSS out)
   * ===================================================================== */
  const host = document.createElement('div');
  host.id = 'pmg-host';
  host.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>${UI_BASE}
      .p{width:340px;background:var(--bg);border:1px solid var(--line2);border-radius:4px;box-shadow:0 8px 30px rgba(0,0,0,.18);overflow:hidden}
      .bar{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#fff;color:var(--ink);border-top:3px solid var(--brand-b);border-bottom:1px solid var(--line)}
      .bar{font-size:16px}
      .bar button{background:none;border:0;color:var(--mute);font-size:20px;line-height:1;cursor:pointer;padding:0 4px}
      .body{padding:10px;display:flex;flex-direction:column;gap:8px;max-height:calc(100vh - 90px);overflow-y:auto}
      .p.min .body{display:none}
      .status{min-height:20px;padding:2px 4px;font-size:13px;color:var(--mute)}
      .status b{color:var(--ink)}

      details.sec{background:#fff;border:1px solid var(--line);border-radius:4px}
      details.sec>summary{display:flex;justify-content:space-between;align-items:center;padding:9px 12px;cursor:pointer;
         font-weight:600;font-size:13px;list-style:none;user-select:none}
      details.sec>summary::-webkit-details-marker{display:none}
      details.sec>summary::after{content:"+";color:var(--mute);font-weight:400;font-size:16px}
      details.sec[open]>summary::after{content:"–"}
      .in{padding:0 12px 12px;display:flex;flex-direction:column;gap:8px}

      .slot{display:flex;align-items:center;gap:10px;min-height:56px;padding:6px 10px;border:1px solid var(--line);border-radius:var(--r);background:#f7f7f7}
      .slot img{width:64px;height:48px;object-fit:cover;border-radius:4px;border:1px solid var(--line)}
      .slot .t{flex:1;min-width:0;font-size:13px}
      .slot .t small{display:block;color:var(--mute)}
      .slot .x{background:none;border:0;font-size:18px;color:var(--mute);cursor:pointer}
      .slot .x:hover{color:var(--ink)}
      .slot.empty{color:var(--mute);border-style:dashed;background:#fff}

      label{font-size:12px;font-weight:600;margin-bottom:-4px}
      input[type=text]{width:100%}
      .chk{display:flex;align-items:center;gap:8px;margin:0;font-size:13px;font-weight:400;cursor:pointer}
      .chk input{width:16px;height:16px;margin:0}
      .row{display:flex;align-items:center;gap:8px;font-size:12px}
      .row label{margin:0;white-space:nowrap}
      .row input{width:90px}
      .foot{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:2px 2px 0}
      .foot small{color:var(--mute);font-size:11px}
      .qinfo{font-size:12px;color:var(--mute)}
    </style>

    <div class="p" id="panel">
      <div class="bar">${WORDMARK(30)}<button id="min" title="Minimize">–</button></div>
      <div class="body">

        <div class="status" id="status"></div>

        <!-- BATCH UPLOAD -->
        <details class="sec" open>
          <summary>Batch upload</summary>
          <div class="in">
            <div class="qinfo" id="qInfo">No photos queued yet.</div>
            <button class="btn ghost" id="qOpen">Choose photos &amp; countries (U)</button>
            <button class="btn" id="qGo" disabled>Start uploading</button>
            <div class="row"><label for="qDelay">Delay between tabs (s)</label><input type="number" id="qDelay" min="5" max="120" step="1"></div>
            <button class="btn ghost" id="qStop" hidden>Stop opening tabs</button>
          </div>
        </details>

        <!-- 1 · PAIR -->
        <details class="sec" open>
          <summary>1 · Photo pair</summary>
          <div class="in">
            <button class="btn ghost" id="sel">Select photos (S)</button>
            <div class="slot" id="sFront"></div>
            <div class="slot" id="sRear"></div>
          </div>
        </details>

        <!-- 2 · DETAILS -->
        <details class="sec" open>
          <summary>2 · Post details</summary>
          <div class="in">
            <label for="place">Location</label>
            <input type="text" id="place" autocomplete="off">
            <label for="tag">Hashtags (comma separated)</label>
            <input type="text" id="tag" autocomplete="off" placeholder="oldtimer,tuning">
          </div>
        </details>

        <!-- 3 · DESCRIPTION -->
        <details class="sec" open>
          <summary>3 · Description</summary>
          <div class="in">
            <button class="btn ghost" id="fillBtn" disabled title="Available on the edit page">Fill description (F)</button>
            <label class="chk"><input type="checkbox" id="autoEdit"> Auto-click “edit” on my photos</label>
            <label class="chk"><input type="checkbox" id="autoFill"> Auto-fill on the edit page</label>
            <label class="chk"><input type="checkbox" id="autoSave"> Auto-click “Save” after filling</label>
            <label class="chk"><input type="checkbox" id="autoReturn"> Return to my gallery when finished</label>
          </div>
        </details>

        <!-- LIKES -->
        <details class="sec" open>
          <summary>Likes</summary>
          <div class="in">
            <button class="btn ghost" id="likeAll" disabled>Like this page</button>
            <div class="row"><label for="pages">Pages to like</label><input type="number" id="pages" min="1" step="1"></div>
            <div class="row"><label for="delay">Delay between likes (ms)</label><input type="number" id="delay" min="100" step="50"></div>
          </div>
        </details>

        <div class="foot">
          <small id="hint"></small>
          <button class="btn ghost sm" id="reset">Reset</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(host);
  const $ = id => root.getElementById(id);

  $('place').value = store.get('place', 'Mainz - Germany');
  $('tag').value = store.get('tag', 'oldtimer');
  $('delay').value = store.get('delay', '200');
  if (store.get('min', '0') === '1') $('panel').classList.add('min');

  // Options: always visible, remembered
  [['autoEdit', '0'], ['autoFill', '0'], ['autoSave', '0'], ['autoReturn', '1']].forEach(([id, def]) => {
    $(id).checked = store.get(id, def) === '1';
    $(id).onchange = () => store.set(id, $(id).checked ? '1' : '0');
  });

