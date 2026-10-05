  /* =====================================================================
   *  SETTINGS DRAWER  (switch a feature off or on; the page is reloaded to apply it)
   *    One line per feature that has an id and a label (registerFeature). A switched-off feature has no control,
   *    no key and no Esc step; whatever it requires switches it off too.
   * ===================================================================== */
  function renderSettings() {
    const rows = settings.list('features').map(d => {
      const f = features.find(x => 'feature_' + x.id === d.id);
      const needs = ((f && f.requires) || []).map(r => (features.find(x => x.id === r) || {}).label || r);
      const box = h('input', { type: 'checkbox', id: 'set_' + d.id });
      box.checked = settings.on(d.id);
      box.onchange = () => { settings.set(d.id, box.checked ? '1' : '0'); $('setApply').hidden = false; renderSettings(); };
      const blocked = box.checked && f && !featureOn(f.id);
      return h('label', { class: 'setrow' }, box,
        h('span', { class: blocked ? 'off' : '', text: d.label + (needs.length ? ' (needs: ' + needs.join(', ') + ')' : '') + (blocked ? ' - off, because something it needs is off' : '') }));
    });
    $('setList').replaceChildren(...rows);
  }

  registerFeature({
    id: 'settings', locked: true,
    groups: [{
      drawer: 'settings', title: 'Features',
      build: () => [
        h('p', { class: 'presult', text: 'Switch a feature off to remove its controls and keys. The page reloads to apply the change.' }),
        h('div', { id: 'setList' }),
        h('button', { id: 'setApply', class: 'btn', hidden: true, text: 'Apply (reload the page)', onclick: () => location.reload() })
      ]
    }],
    init: () => renderSettings()
  });
