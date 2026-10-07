  /* =====================================================================
   *  SETTINGS  (the user's choices, in one place)
   *    A setting is defined once, with its default and the label shown in the Settings drawer:
   *      settings.define('feature_pages', '1', 'Gallery page keys', 'features')
   *    and read anywhere with settings.get(id) (a string) or settings.on(id) (true when '1').
   *    The value is kept in the browser (key pmg_set_<id>). Every feature that has an id and a label
   *    gets a "feature_<id>" setting from registerFeature: that is how a feature is switched off.
   * ===================================================================== */
  const settings = (() => {
    const defs = [];
    const find = id => defs.find(d => d.id === id);
    const api = {
      define(id, def, label, group) { if (!find(id)) defs.push({ id, def: String(def), label, group: group || 'general' }); },
      list: group => defs.filter(d => !group || d.group === group),
      get: id => store.get('set_' + id, (find(id) || { def: '' }).def),
      on: id => api.get(id) === '1',
      set: (id, value) => store.set('set_' + id, String(value)),
      isDefault: id => api.get(id) === (find(id) || { def: '' }).def
    };
    return api;
  })();
