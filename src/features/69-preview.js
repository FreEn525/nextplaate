  /* =====================================================================
   *  PLATE PREVIEW AS YOU TYPE  (the site's "Generate preview" button, pressed for you)
   *    On an upload page the site draws a preview of the plate from the country fields and shows a button to ask for it; any change
   *    in those fields clears it. Here the button is pressed as soon as the user stops typing (PREVIEW_DELAY), so the preview is
   *    always there. The request is the page's own (the script only clicks its button): no other request, never two less than
   *    PREVIEW_GAP apart, and nothing while a preview is loading, while there is no plate yet, or while the one shown is up to date.
   * ===================================================================== */
  const PREVIEW_DELAY = 700;      // ms after the last keystroke
  const PREVIEW_GAP = 2000;       // ms: the least time between two previews
  let previewTimer = null, previewLast = 0, previewSig = '', previewSynthetic = false;

  // The country fields: those before the photo field, like the site's own function (the description and the rest come after it)
  function previewFields() {
    const all = [...document.querySelectorAll('#frm input, #frm select, #frm textarea')];
    const file = all.findIndex(el => el.id === 'filename');
    return file === -1 ? all : all.slice(0, file);
  }
  const previewSignature = () => previewFields().map(el => (el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value)).join('\u0001');

  function previewNow() {
    const btn = document.getElementById('informer-preview-btn');
    if (!btn || btn.disabled || !plateForForm()) return;              // no button here, a preview is loading, or no plate yet
    const shown = btn.offsetParent === null;                          // the button is hidden while a preview is displayed
    const sig = previewSignature();
    if (shown && sig === previewSig) return;                          // the preview on the page is the one of these fields
    const wait = previewLast + PREVIEW_GAP - Date.now();
    if (wait > 0) { previewTimer = setTimeout(previewNow, wait); return; }
    if (shown) {                                                      // a preview that came back late is of older fields: clear it the way the site does
      const first = previewFields()[0];
      previewSynthetic = true;
      if (first) first.dispatchEvent(new Event('input', { bubbles: true }));
      previewSynthetic = false;
    }
    previewLast = Date.now();
    previewSig = sig;
    btn.click();
  }

  function previewLater(e) {
    if (previewSynthetic || !previewFields().includes(e.target)) return;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(previewNow, PREVIEW_DELAY);
  }

  registerFeature({
    id: 'preview', label: 'Plate preview as you type',
    init: () => {
      if (!here.add) return;
      document.addEventListener('input', previewLater, true);
      document.addEventListener('change', previewLater, true);
    }
  });
