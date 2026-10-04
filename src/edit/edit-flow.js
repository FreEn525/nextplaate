  /* =====================================================================
   *  EDIT FLOW:  photo page --(auto edit)--> edit page --(auto fill)--> (auto save)
   * ===================================================================== */
  // Edit page: <textarea name="dop"> + <input type="hidden" name="id" value="{photo id}">
  const descBox = document.querySelector('textarea[name="dop"]');
  const photoIdInput = document.querySelector('form input[name="id"]');
  const onEditPage = !!(descBox && photoIdInput);
  $('fillBtn').disabled = !onEditPage;
  $('fillBtn').title = onEditPage ? 'Fill the description of this photo' : 'Only available on the edit page';

  function fillDescription() {
    if (!onEditPage) return;
    if (!(state.front && state.rear)) {
      setStatus('Select the front and rear photos first (press <b>S</b>), then come back to edit.');
      return;
    }
    const id = photoIdInput.value;
    // The plate shown in the page title (e.g. "MZ MZ 78") is used for the image alt text
    const h = document.querySelector('.headline h2');
    const plate = h ? h.textContent.replace(/['"<>]/g, '').trim() : '';
    const alt = (o, side) => (((plate || o.alt) ? (plate || o.alt) + ' ' : '') + side).trim();

    let code;
    if (id === state.front.id) code = block('R E A R   V I E W', state.rear, alt(state.rear, 'rear'));
    else if (id === state.rear.id) code = block('F R O N T   V I E W', state.front, alt(state.front, 'front'));
    else { setStatus(`Photo <b>#${id}</b> is not in your selected pair (front #${state.front.id}, rear #${state.rear.id}).`); return; }

    descBox.value = code;
    descBox.dispatchEvent(new Event('input', { bubbles: true }));
    markDone(id);
    markFilled(id);
    // Both photos of the pair filled -> after the next photo page, go back to the gallery
    if (filledSet().has(state.front.id) && filledSet().has(state.rear.id)) store.set('returnPending', '1');

    if ($('autoSave').checked) {
      setStatus(`Description filled for <b>#${id}</b>. Saving…`);
      const btn = descBox.form && descBox.form.querySelector('input[type=submit],button[type=submit]');
      if (btn) setTimeout(() => btn.click(), 300);
    } else {
      setStatus(`Description filled for <b>#${id}</b>. Check it, then click Save.`);
    }
  }
  $('fillBtn').onclick = fillDescription;

  // On a photo page of the selected pair, click the site's own "edit" button (once per photo)
  function autoEdit() {
    if (!$('autoEdit').checked || onEditPage) return;
    if (!(state.front && state.rear)) return;
    const m = location.pathname.match(/\/nomer(\d+)/i);
    if (!m) return;
    const id = m[1];
    if (id !== state.front.id && id !== state.rear.id) return;
    if (doneSet().has(id)) return;
    const btn = document.querySelector('form[action$="edit_dopol.php"] button[type="submit"], form[action$="edit_dopol.php"] input[type="submit"]');
    if (!btn) return;
    markDone(id); // at most one automatic edit per photo: no loops after saving
    setStatus(`Opening the edit page for <b>#${id}</b>…`);
    setTimeout(() => btn.click(), 400);
  }

