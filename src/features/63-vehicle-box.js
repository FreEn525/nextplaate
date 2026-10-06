  /* =====================================================================
   *  BRAND AND MODEL BOX  (the site's "Specify brand and model of vehicle:" text box, upload pages)
   *    The site's box is a plain input with a bold X after it. Here it keeps its autocomplete (the site's own) but looks like the rest
   *    of the script: a short label, a full-width field with a hint of what to type, a real clear button inside the field, and the
   *    list of suggestions styled to match (src/ui/03-page-style.js). Nothing about what it does changes.
   * ===================================================================== */
  function vehicleBoxInit() {
    const input = document.getElementById('markamodtype');
    const section = input && input.closest('section');
    if (!input || !section || section.classList.contains('pmg-vbox')) return;
    section.classList.add('pmg-vbox');
    input.removeAttribute('size');
    input.placeholder = 'Type a brand or a model, for example Golf';
    const label = section.querySelector('label[for="markamodtype"]');
    if (label) label.textContent = 'Brand and model';
    const clear = h('button', { type: 'button', class: 'pmg-clear', title: 'Clear', 'aria-label': 'Clear the brand and model box', text: '×', onclick: () => {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      try { const jq = vehiclePage().jQuery; if (jq) jq(input).autocomplete('close'); } catch (e) { /* no list open */ }
      input.focus();
    } });
    input.after(clear);
    (input.closest('.ui-widget') || section).after(h('p', { class: 'pmg-hint', text: 'Type a few letters: choosing a suggestion fills the brand and model menus below.' }));
  }

  registerFeature({ init: vehicleBoxInit });
