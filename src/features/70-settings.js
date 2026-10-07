  /* =====================================================================
   *  SETTINGS DRAWER  (switch a feature off or on; the page is reloaded to apply it)
   *    One line per feature that has an id and a label (registerFeature). A switched-off feature has no control,
   *    no key and no Esc step; whatever it requires switches it off too.
   * ===================================================================== */
  function renderSettings() {
    const row = d => {
      const f = features.find(x => 'feature_' + x.id === d.id);
      const needs = ((f && f.requires) || []).map(r => (features.find(x => x.id === r) || {}).label || r);
      const box = h('input', { type: 'checkbox', id: 'set_' + d.id });
      const blocked = settings.on(d.id) && f && !featureOn(f.id);   // on, but something it needs is off: shown as off and not clickable
      box.checked = settings.on(d.id) && !blocked;
      box.disabled = !!blocked;
      box.onchange = () => { settings.set(d.id, box.checked ? '1' : '0'); $('setApply').hidden = false; renderSettings(); };
      const note = blocked ? ' (off: it needs ' + needs.join(', ') + ')' : needs.length ? ' (needs ' + needs.join(', ') + ')' : '';
      const info = (f && FEATURE_INFO[f.id]) || {};
      return { on: box.checked, el: h('label', { class: 'chk fx' + (blocked ? ' dim' : '') }, box,
        h('span', { class: 'ftext' }, h('b', { text: d.label + note }),
          info.about ? h('span', { class: 'fabout', text: info.about }) : null,
          info.scope ? h('span', { class: 'fscope', text: 'Works for: ' + info.scope }) : null)) };
    };
    const byId = Object.fromEntries(settings.list('features').map(d => [d.id.replace(/^feature_/, ''), d]));
    const grouped = new Set(FEATURE_GROUPS.flatMap(g => g.ids));
    const families = [...FEATURE_GROUPS, { title: 'Others', ids: Object.keys(byId).filter(id => !grouped.has(id)) }];      // a feature no family names is not lost
    $('setList').replaceChildren(...families.map(g => {
      const rows = g.ids.filter(id => byId[id]).map(id => row(byId[id]));
      if (!rows.length) return null;
      const key = 'open_' + g.title;
      const fold = h('details', { class: 'sgroup' },
        h('summary', null, h('span', { text: g.title }), h('span', { class: 'scount', text: `${rows.filter(r => r.on).length} of ${rows.length} on` })),
        h('div', { class: 'chklist' }, rows.map(r => r.el)));
      fold.open = settings.get(key) === '1';
      fold.addEventListener('toggle', () => settings.set(key, fold.open ? '1' : '0'));
      return fold;
    }).filter(Boolean));                                                           // a family with no feature is not drawn
  }

  registerFeature({
    id: 'settings', locked: true,
    groups: [{
      drawer: 'settings', rank: 10, title: 'Features', about: "Every feature by family, what it does and where it works. Switch off what you do not use.",
      build: () => [
        h('p', { class: 'presult', text: 'Switch a feature off to remove its controls and keys. The page reloads to apply the change.' }),
        h('div', { id: 'setList', class: 'chklist' }),
        h('button', { id: 'setApply', class: 'btn', hidden: true, text: 'Apply (reload the page)', onclick: () => location.reload() })
      ]
    }],
    init: () => renderSettings()
  });
