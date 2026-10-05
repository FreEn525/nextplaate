  /* =====================================================================
   *  DETAILS  (location and hashtags written at the top of every description)
   * ===================================================================== */
  registerFeature({
    id: 'details', label: 'Location and hashtags',
    groups: [{
      drawer: 'pair', title: 'Details',
      build: () => [
        h('div', { class: 'field' }, h('label', { for: 'place', text: 'Location' }),
          h('input', { type: 'text', id: 'place', autocomplete: 'off' })),
        h('div', { class: 'field' }, h('label', { for: 'tag', text: 'Hashtags (comma separated)' }),
          h('input', { type: 'text', id: 'tag', autocomplete: 'off', placeholder: 'oldtimer,tuning' }))
      ]
    }],
    init: () => {
      $('place').value = store.get('place', 'Mainz - Germany');
      $('tag').value = store.get('tag', 'oldtimer');
      $('place').oninput = () => store.set('place', $('place').value);
      $('tag').oninput = () => store.set('tag', $('tag').value);
    }
  });
