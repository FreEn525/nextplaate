  /* =====================================================================
   *  UPLOAD TAB  (the ribbon controls of the batch upload: summary, open the manager, start, stop)
   * ===================================================================== */
  function updateBatchInfo() {
    const ready = readyCount(), noC = queue.filter(q => q.status === 'pending' && !q.country).length;
    const done = queue.filter(isFinished).length;
    const b = getBatch(), active = !!(b && b.active);
    const opened = queue.filter(q => q.status === 'opened').length;
    $('qInfo').textContent = queue.length
      ? `${queue.length} photo${queue.length > 1 ? 's' : ''} · ${ready} ready · ${noC} without country · ${done} uploaded${opened ? ' · ' + opened + ' open in tabs' : ''}`
      : 'No photos queued yet.';
    const go = $('qGo');
    go.disabled = ready === 0 || !!multi;
    go.textContent = multi ? `Opening tabs… ${multi.opened}/${multi.total}` : `Start uploading${ready ? ' (' + ready + ')' : ''}`;
    $('qStop').hidden = !multi;
  }

  registerFeature({
    id: 'upload', label: 'Batch upload',
    groups: [{
      drawer: 'upload', title: 'Batch upload', about: "Send many photos at once: each gets a country and a category, then one tab per photo opens with a pause between.",
      build: () => [
        h('div', { id: 'qInfo', class: 'qinfo', text: 'No photos queued yet.' }),
        h('button', { id: 'qOpen', class: 'btn ghost', text: 'Choose photos & countries' }),
        h('button', { id: 'qGo', class: 'btn', disabled: true, text: 'Start uploading' }),
        h('button', { id: 'qStop', class: 'btn ghost', hidden: true, text: 'Stop opening tabs' }),
        h('div', { class: 'row' }, h('label', { for: 'qDelay', text: 'Delay between tabs (s)' }),
          h('input', { type: 'number', id: 'qDelay', min: 5, max: 120, step: 1 }))
      ]
    }],
    keys: {
      open: { code: 'KeyU', label: 'Open the batch manager', run: () => { openManager(); return true; }, hintOrder: 40 },            // batch upload manager
      start: { code: 'KeyN', label: 'Start uploading', run: () => { if (!queue.length) return false; startMulti(); return true; }, hintOrder: 50 }, // start uploading
      resume: { code: 'KeyR', label: 'Reload the current photo', run: () => { if (!batchResumable()) return false; resumeCurrent(); return true; }, hintOrder: 55 } // (re)load the current photo
    },
    onEscape: () => { if (!multi) return false; stopMulti('Stopped. The photos not yet opened are still waiting.'); return true; },
    escOrder: 10,
    init: () => {
      $('qDelay').value = Math.min(120, Math.max(5, +store.get('qDelay', '10') || 10));
      $('qDelay').onchange = () => { const v = Math.min(120, Math.max(5, Math.round(+$('qDelay').value) || 10)); $('qDelay').value = v; store.set('qDelay', String(v)); };
      const openText = () => { $('qOpen').textContent = `Choose photos & countries (${keyOf('open')})`; };
      openText();
      window.addEventListener('pmg-keys', openText);
      $('qOpen').onclick = openManager;
      $('qGo').onclick = startMulti;
      $('qStop').onclick = () => stopMulti('Stopped. Photos already opened stay in their tabs; the others are still waiting.');
      updateBatchInfo();
    }
  });
