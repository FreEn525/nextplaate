  /* =====================================================================
   *  TAGS  (the site's tag pickers, made quick to use)
   *    The site hides its 52 tags in a closed accordion on the upload page and in a pop-up on a photo page ("add tags"), each a long
   *    list with a "+" to press for every tag. Here one picker replaces both: every tag is a button, grouped like the site groups
   *    them; a search box finds one by typing; what is chosen is shown as removable chips; the tags used most and the ones of the
   *    last upload are one click away.
   *      - upload page: a card above the site's section (which is hidden);
   *      - photo page: the "add tags" / "edit tags" link opens a window of ours (ui/07-modal.js) instead of the site's pop-up; Save
   *        presses the site's own Save button, so the site saves the tags exactly as before; Cancel gives the boxes back as they were.
   *    The site's own check boxes stay the source of truth: a click only checks or unchecks the real box and fires its change event,
   *    so the form is sent as before and the site's own counter keeps working. Switching the feature off brings the site's own back.
   * ===================================================================== */
  const TAGS_OFTEN = 6;           // how many of the most used tags the picker offers up front

  // The tags of a picker: from the site's own check boxes (name CheckBox[id], one label each) and its group headings
  function siteTags(picker) {
    if (!picker) return [];
    const groups = {};
    picker.querySelectorAll('.pm-tag-type1-group').forEach(g => {
      const name = g.querySelector('.pm-tag-type1-toggle span');
      groups[g.dataset.groupId] = name ? name.textContent.trim() : '';
    });
    return [...picker.querySelectorAll('input[name^="CheckBox["]')].map(input => {
      const label = input.closest('label');
      const span = label && label.querySelector('span');
      const id = (input.name.match(/\[(\d+)\]/) || [])[1];
      const group = label && label.dataset.groupId;
      return { id, name: span ? span.textContent.trim() : input.id, group: group || '0', groupName: groups[group] || 'Other', input };
    });
  }

  const tagsCount = () => { try { return JSON.parse(store.get('tags_count', '{}')); } catch (e) { return {}; } };
  const tagsLast = () => { try { return JSON.parse(store.get('tags_last', '[]')); } catch (e) { return []; } };

  // A tag is chosen or not by its real box; the change event is what the site's own code (and its counter) listens to
  function tagToggle(tag, on) {
    const want = on === undefined ? !tag.input.checked : on;
    if (tag.input.checked === want) return;
    tag.input.checked = want;
    tag.input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // What was used is remembered when the tags are sent (the form, or Save in the window)
  function tagsRemember(tags) {
    const ids = tags.filter(t => t.input.checked).map(t => t.id);
    if (!ids.length) return;
    const count = tagsCount();
    ids.forEach(id => { count[id] = (count[id] || 0) + 1; });
    store.set('tags_count', JSON.stringify(count));
    store.set('tags_last', JSON.stringify(ids));
  }

  // The picker: { el, sync }. say(text) tells how many are chosen (the title bar of the card or of the window).
  function tagPicker(tags, say) {
    const byId = Object.fromEntries(tags.map(t => [t.id, t]));
    const pill = tag => h('button', { type: 'button', class: 'pill', 'data-id': tag.id, text: tag.name, onclick: () => { tagToggle(tag); sync(); } });

    const chosen = h('div', { class: 'pills' });
    const clear = h('button', { type: 'button', class: 'btn ghost sm', text: 'Clear', onclick: () => { tags.forEach(t => tagToggle(t, false)); sync(); } });
    const find = h('input', { type: 'text', placeholder: 'Find a tag…' });
    const quick = h('div', { class: 'tagquick' });
    const groups = h('div', { class: 'taggroups' });

    const groupEls = [...new Set(tags.map(t => t.group))].map(g => {
      const list = tags.filter(t => t.group === g).sort((a, b) => a.name.localeCompare(b.name));
      return h('div', { class: 'taggroup' }, h('div', { class: 'cat', text: list[0].groupName }), h('div', { class: 'pills' }, list.map(pill)));
    });
    groups.append(...groupEls);

    // what is shown depends on the choice: chips on top, the groups with the chosen ones marked
    function sync() {
      const on = tags.filter(t => t.input.checked);
      chosen.replaceChildren(...(on.length
        ? on.map(t => h('button', { type: 'button', class: 'pill on removable', text: t.name + '  ×', title: 'Remove', onclick: () => { tagToggle(t, false); sync(); } }))
        : [h('span', { class: 'mute', text: 'No tag chosen' })]));
      clear.hidden = !on.length;
      say(on.length ? `${on.length} tag${on.length > 1 ? 's' : ''} chosen` : 'Choose the tags of the photo');
      [groups, quick].forEach(box => box.querySelectorAll('.pill').forEach(p => p.classList.toggle('on', byId[p.dataset.id].input.checked)));
    }

    // the most used tags, and the ones of the last upload (the site never remembers them)
    const often = Object.entries(tagsCount()).filter(([id]) => byId[id]).sort((a, b) => b[1] - a[1]).slice(0, TAGS_OFTEN).map(([id]) => byId[id]);
    const last = tagsLast().filter(id => byId[id]).map(id => byId[id]);
    if (often.length) quick.append(h('div', { class: 'cat', text: 'Most used' }), h('div', { class: 'pills' }, often.map(pill)));
    if (last.length) quick.append(h('div', { class: 'cat', text: 'Last upload' }), h('div', { class: 'pills' }, last.map(pill),
      h('button', { type: 'button', class: 'btn sm', text: 'Use again', onclick: () => { last.forEach(t => tagToggle(t, true)); sync(); } })));
    quick.hidden = !quick.children.length;

    // search: filters the groups; Enter chooses the first tag that matches
    find.addEventListener('input', () => {
      const q = find.value.trim().toLowerCase();
      groupEls.forEach(g => {
        let any = false;
        g.querySelectorAll('.pill').forEach(p => { const hide = !!q && !byId[p.dataset.id].name.toLowerCase().includes(q); p.hidden = hide; any = any || !hide; });
        g.hidden = !any;
      });
      quick.hidden = !!q || !quick.children.length;
    });
    find.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();                                        // not the form's own Enter
      const first = groups.querySelector('.pill:not([hidden])');
      if (first) { tagToggle(byId[first.dataset.id]); find.select(); sync(); }
    });

    const el = h('div', { class: 'tagbox' }, h('div', { class: 'tagrow' }, chosen, clear), find, quick, groups);
    sync();
    return { el, sync, find };
  }

  // ---- the upload page: a card above the site's section
  function tagsCard() {
    const picker = document.getElementById('add-tags-picker');
    const tags = siteTags(picker);
    if (!tags.length) return;
    const site = picker.closest('.panel-group') || picker;          // the site's whole section
    const card = inlineCard({ id: 'pmg-tags', title: 'Tags', before: site, closable: false });
    if (!card) return;
    site.hidden = true;
    site.style.display = 'none';
    const { el, sync } = tagPicker(tags, card.message);
    card.body.append(el);
    // the site's own code may change a box too (a related tag, its undo): the card follows
    picker.addEventListener('change', sync);
    new MutationObserver(sync).observe(picker, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    const form = picker.closest('form');
    if (form) form.addEventListener('submit', () => tagsRemember(tags), true);
  }

  // ---- a photo page: the "add tags" link opens our window instead of the site's pop-up
  function tagsWindow() {
    const picker = document.querySelector('#tagedit .pm-tag-type1');
    const tags = siteTags(picker);
    if (!tags.length || !document.getElementById('tags-edit-link')) return;
    document.addEventListener('click', e => {
      if (!(e.target.closest && e.target.closest('#tags-edit-link'))) return;
      e.preventDefault();
      e.stopPropagation();                                          // the site's own pop-up does not open
      const start = tags.map(t => t.input.checked);                 // what the boxes were: Cancel gives it back
      let modal = null;                                              // the picker says how many are chosen before the window exists
      const { el, sync, find } = tagPicker(tags, text => { if (modal) modal.message(text); });
      modal = modalOpen({
        id: 'pmg-tags-modal', title: 'Tags', body: el,
        onDismiss: () => { tags.forEach((t, i) => tagToggle(t, start[i])); },
        actions: [
          { label: 'Save', run: () => {
            tagsRemember(tags);
            const save = document.getElementById('submit');          // the site's own Save: it sends the tags as it always did
            if (save) save.click();
            modal.close();
            setStatus('Saving the tags…', 3000);
          } }
        ]
      });
      sync();
      find.focus();
    }, true);
  }

  registerFeature({
    id: 'tags', label: 'Tag picker',
    init: () => { if (here.add) tagsCard(); else if (here.photo) tagsWindow(); }
  });
