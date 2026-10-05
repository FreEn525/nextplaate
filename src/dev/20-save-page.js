  /* =====================================================================
   *  DEVELOPER  (only in nextplaate.dev.user.js: not in the published script)
   * ===================================================================== */
  // Saves the page you are on as an HTML file, to build the tests from the real markup
  function savePage() {
    const name = 'platesmania-' + (location.pathname + location.search).replace(/[^\w]+/g, '_').replace(/^_|_$/g, '') + '.html';
    const blob = new Blob(['<!-- ' + location.href + ' -->\n' + document.documentElement.outerHTML], { type: 'text/html' });
    const link = h('a', { href: URL.createObjectURL(blob), download: name });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
    setStatus(`Page saved as <b>${name}</b>.`);
  }

  registerFeature({
    groups: [{
      drawer: 'dev', title: 'Save the page',
      build: () => [h('button', { id: 'savePage', class: 'btn ghost', text: 'Save this page (HTML)' })]
    }],
    init: () => { $('savePage').onclick = savePage; }
  });
