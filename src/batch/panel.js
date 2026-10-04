  // ---- panel summary + buttons ----
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
  $('qDelay').value = Math.min(120, Math.max(5, +store.get('qDelay', '10') || 10));
  $('qDelay').onchange = () => { const v = Math.min(120, Math.max(5, Math.round(+$('qDelay').value) || 10)); $('qDelay').value = v; store.set('qDelay', String(v)); };
  $('qOpen').onclick = openManager;
  $('qGo').onclick = startMulti;
  $('qStop').onclick = () => stopMulti('Stopped. Photos already opened stay in their tabs; the others are still waiting.');

