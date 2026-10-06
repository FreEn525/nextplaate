  /* =====================================================================
   *  TAGS  (the site's "Add tags" section, made quick to use)
   *    The site hides its 52 tags in a closed accordion, with a list to scroll and a "+" to press for each. This replaces what is
   *    seen with a card above it: every tag is a button, grouped like the site groups them; a search box finds one by typing; what
   *    is chosen is shown as removable chips; the tags used most and the ones of the last upload are one click away.
   *    The site's own check boxes stay the source of truth: a click only checks or unchecks the real box and fires its change
   *    event, so the form is sent exactly as before, and the site's own counter ("Tags (3)") keeps working. The site's section is
   *    only hidden: switching the feature off in Settings brings it back.
   * ===================================================================== */
  const TAGS_OFTEN = 6;           // how many of the most used tags the card offers up front

  // The tags of the page: from the site's own check boxes (name CheckBox[id], one label each) and its group headings
  function siteTags() {
    const picker = document.getElementById('add-tags-picker');
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

  function tagsCard() {
    const picker = document.getElementById('add-tags-picker');
    if (!picker) return;
    const tags = siteTags();
    if (!tags.length) return;
    const site = picker.closest('.panel-group') || picker;          // the site's whole section
    const card = inlineCard({ id: 'pmg-tags', title: 'Tags', before: site, closable: false });
    if (!card) return;
    site.hidden = true;
    site.style.display = 'none';

    const byId = Object.fromEntries(tags.map(t => [t.id, t]));
    const pill = (tag, extra) => h('button', { type: 'button', class: 'pill' + (extra ? ' ' + extra : ''), 'data-id': tag.id, text: tag.name, onclick: () => { tagToggle(tag); sync(); } });

    // ---- the parts of the card
    const chosen = h('div', { class: 'pills' });
    const clear = h('button', { type: 'button', class: 'btn ghost sm', text: 'Clear', onclick: () => { tags.forEach(t => tagToggle(t, false)); sync(); } });
    const find = h('input', { type: 'text', placeholder: 'Find a tag…' });
    const quick = h('div', { class: 'tagquick' });
    const groups = h('div', { class: 'taggroups' });

    const names = [...new Set(tags.map(t => t.group))];
    const groupEls = names.map(g => {
      const list = tags.filter(t => t.group === g).sort((a, b) => a.name.localeCompare(b.name));
      const el = h('div', { class: 'taggroup' }, h('div', { class: 'cat', text: list[0].groupName }), h('div', { class: 'pills' }, list.map(t => pill(t))));
      return el;
    });
    groups.append(...groupEls);

    // ---- what is shown depends on the choice: chips on top, "often" and "last time" rows, the groups
    function sync() {
      const on = tags.filter(t => t.input.checked);
      chosen.replaceChildren(...(on.length
        ? on.map(t => h('button', { type: 'button', class: 'pill on removable', text: t.name + '  ×', title: 'Remove', onclick: () => { tagToggle(t, false); sync(); } }))
        : [h('span', { class: 'mute', text: 'No tag chosen' })]));
      clear.hidden = !on.length;
      card.message(on.length ? `${on.length} tag${on.length > 1 ? 's' : ''} chosen` : 'Choose the tags of the photo');
      groups.querySelectorAll('.pill').forEach(p => p.classList.toggle('on', byId[p.dataset.id].input.checked));
      quick.querySelectorAll('.pill').forEach(p => p.classList.toggle('on', byId[p.dataset.id].input.checked));
    }

    // the most used tags, and the ones of the last upload (the site never remembers them)
    const often = Object.entries(tagsCount()).filter(([id]) => byId[id]).sort((a, b) => b[1] - a[1]).slice(0, TAGS_OFTEN).map(([id]) => byId[id]);
    const last = tagsLast().filter(id => byId[id]).map(id => byId[id]);
    if (often.length) quick.append(h('div', { class: 'cat', text: 'Most used' }), h('div', { class: 'pills' }, often.map(t => pill(t))));
    if (last.length) quick.append(h('div', { class: 'cat', text: 'Last upload' }), h('div', { class: 'pills' }, last.map(t => pill(t)),
      h('button', { type: 'button', class: 'btn sm', text: 'Use again', onclick: () => { last.forEach(t => tagToggle(t, true)); sync(); } })));
    quick.hidden = !quick.children.length;

    // ---- search: filters the groups; Enter chooses the first tag that matches
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

    card.body.append(h('div', { class: 'tagbox' },
      h('div', { class: 'tagrow' }, chosen, clear),
      find, quick, groups));

    // ---- the site's own code may change a box too (a related tag, its undo): the card follows
    picker.addEventListener('change', sync);
    new MutationObserver(sync).observe(picker, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    sync();

    // ---- what was used is remembered when the form is sent
    const form = picker.closest('form');
    if (form) form.addEventListener('submit', () => {
      const ids = tags.filter(t => t.input.checked).map(t => t.id);
      if (!ids.length) return;
      const count = tagsCount();
      ids.forEach(id => { count[id] = (count[id] || 0) + 1; });
      store.set('tags_count', JSON.stringify(count));
      store.set('tags_last', JSON.stringify(ids));
    }, true);
  }

  registerFeature({
    id: 'tags', label: 'Tag picker',
    init: () => { if (here.add) tagsCard(); }
  });
