  /* =====================================================================
   *  EDIT FLOW:  photo page --(auto edit)--> edit page --(auto fill)--> (auto save)
   * ===================================================================== */
  // The edit page is detected in 20-here.js (here.edit)
  const descBox = document.querySelector('textarea[name="dop"]');
  const photoIdInput = document.querySelector('form input[name="id"]');

  function fillDescription() {
    if (!here.edit) return;
    const id = photoIdInput.value;
    if (!(state.front && state.rear)) {
      // no pair chosen: the description is only your details (hashtags, then place), still worth writing, but never over a text that is there
      if (descBox.value.trim()) { setStatus(`Photo <b>#${id}</b> already has a description: left as it is. Choose a front and a rear photo (<b>${keyOf('select')}</b>) to write the pair’s description.`); return; }
      descBox.value = detailsHead();
      descBox.dispatchEvent(new Event('input', { bubbles: true }));
      setStatus(`Description filled for <b>#${id}</b> with your details only. Choose a front and a rear photo (<b>${keyOf('select')}</b>) to add the other side.`);
      return;
    }
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

  // On a photo page of the selected pair, click the site's own "edit" button (once per photo)
  function autoEdit() {
    if (!$('autoEdit').checked || here.edit) return;
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

  /* =====================================================================
   *  BACK TO THE GALLERY WHEN EVERYTHING IS DONE
   * ===================================================================== */
  // Remember the last gallery / user page visited (and how far it was scrolled)
  if (here.gallery) {
    store.set('lastGallery', location.href);
    if (store.get('restoreScroll', '0') === '1') {
      store.set('restoreScroll', '0');
      const y = Number(store.get('lastGalleryScroll', '0')) || 0;
      setTimeout(() => window.scrollTo(0, y), 150);
    }
    window.addEventListener('pagehide', () => store.set('lastGalleryScroll', String(window.scrollY)));
  }

  // After the second photo is saved the site shows its photo page: that is the signal to go back
  function backToGallery() {
    if (!$('autoReturn').checked || here.edit) return false;
    if (store.get('returnPending', '0') !== '1') return false;
    if (!(state.front && state.rear)) return false;
    const m = location.pathname.match(/\/nomer(\d+)/i);
    if (!m || (m[1] !== state.front.id && m[1] !== state.rear.id)) return false;
    store.set('returnPending', '0');
    const url = store.get('lastGallery', '');
    if (!url) { setStatus('All done. (No gallery page remembered to go back to.)'); return true; }
    store.set('restoreScroll', '1');
    setStatus('All done. Going back to your gallery…');
    setTimeout(() => { location.href = url; }, 600);
    return true;
  }


  registerFeature({
    id: 'description', label: 'Descriptions and auto-fill', requires: ['details'],
    groups: [
      {
        drawer: 'pair', title: 'Description', about: "Step 3. On a photo’s edit page: writes the description (your details, then the other side of the pair as a link and a thumbnail). With no pair chosen it writes your details only.", pages: ['edit'],
        build: () => [
          h('button', { id: 'fillBtn', class: 'btn ghost', disabled: true, text: 'Fill description' }),
          h('button', { id: 'backGallery', class: 'btn ghost', text: 'Back to my gallery', title: 'Go back to the last gallery you visited' })
        ]
      },
      {
        drawer: 'pair', title: 'Automation', about: "Step 4, optional. Let the script do the clicks: open the edit page, fill it, save, and go back to your gallery.",
        build: () => [
          h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'autoEdit' }), 'Auto-click “edit” on my photos'),
          h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'autoFill' }), 'Auto-fill on the edit page'),
          h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'autoSave' }), 'Auto-click “Save” after filling'),
          h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'autoReturn' }), 'Return to my gallery when finished')
        ]
      }
    ],
    keys: {
      fill: { code: 'KeyF', label: 'Fill the description', run: () => { if (!here.edit) return false; $('fillBtn').click(); return true; }, hintOrder: 20 }
    },
    init: () => {
      const fillText = () => { $('fillBtn').textContent = `Fill description (${keyOf('fill')})`; };
      fillText();
      window.addEventListener('pmg-keys', fillText);
      $('fillBtn').disabled = !here.edit;
      $('fillBtn').title = here.edit ? 'Fill the description of this photo' : 'Only available on the edit page';
      $('fillBtn').onclick = fillDescription;
      $('backGallery').onclick = () => {
        const url = store.get('lastGallery', '');
        if (!url) { setStatus('No gallery visited yet in this browser.'); return; }
        store.set('restoreScroll', '1');
        location.href = url;
      };
      // Options: always visible, remembered
      [['autoEdit', '0'], ['autoFill', '0'], ['autoSave', '0'], ['autoReturn', '1']].forEach(([id, def]) => {
        $(id).checked = store.get(id, def) === '1';
        $(id).onchange = () => store.set(id, $(id).checked ? '1' : '0');
      });
    }
  });
