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
      const blocked = settings.on(d.id) && f && !featureOn(f.id);   // on, but something it needs is off: shown as off and not clickable
      box.checked = settings.on(d.id) && !blocked;
      box.disabled = !!blocked;
      box.onchange = () => { settings.set(d.id, box.checked ? '1' : '0'); $('setApply').hidden = false; renderSettings(); };
      const note = blocked ? ' (off: it needs ' + needs.join(', ') + ')' : needs.length ? ' (needs ' + needs.join(', ') + ')' : '';
      const info = (f && FEATURE_INFO[f.id]) || {};
      return h('label', { class: 'chk fx' + (blocked ? ' dim' : '') }, box,
        h('span', { class: 'ftext' }, h('b', { text: d.label + note }),
          info.about ? h('span', { class: 'fabout', text: info.about }) : null,
          info.scope ? h('span', { class: 'fscope', text: 'Works for: ' + info.scope }) : null));
    });
    $('setList').replaceChildren(...rows);
  }

  registerFeature({
    id: 'settings', locked: true,
    groups: [{
      drawer: 'settings', title: 'Features', about: "Every feature, what it does and where it works. Switch off what you do not use.",
      build: () => [
        h('p', { class: 'presult', text: 'Switch a feature off to remove its controls and keys. The page reloads to apply the change.' }),
        h('div', { id: 'setList', class: 'chklist' }),
        h('button', { id: 'setApply', class: 'btn', hidden: true, text: 'Apply (reload the page)', onclick: () => location.reload() })
      ]
    }],
    init: () => renderSettings()
  });
