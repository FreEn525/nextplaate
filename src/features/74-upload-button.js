  /* =====================================================================
   *  FLOATING UPLOAD BUTTON  (the form is long: the Upload button follows you while it is out of view)
   *    The site's Upload button is at the very end of a long form (plate, photo, vehicle, extra information, tags). While it is not on
   *    the screen, a button of ours stands at the bottom of the window; it presses the site's own button, so the form's own checks and
   *    options ("upload in a new tab") apply exactly as before. When the real button comes into view, ours goes away.
   * ===================================================================== */
  function uploadButton() {
    const form = document.getElementById('frm');
    return form && form.querySelector('button[type="submit"], input[type="submit"]');
  }

  function floatingUpload() {
    const real = uploadButton();
    if (!real || document.getElementById('pmg-upload-fab')) return;
    const host = h('div', { id: 'pmg-upload-fab', hidden: true });
    host.style.cssText = 'position:fixed;z-index:60;bottom:16px;left:16px';
    const root = host.attachShadow({ mode: 'open' });
    root.append(h('style', { text: UI_BASE + '.btn{box-shadow:0 4px 14px rgba(0,0,0,.25)}' }),
      h('button', { type: 'button', class: 'btn lg', text: 'Upload', title: 'Presses the Upload button of the form', onclick: () => real.click() }));
    document.body.appendChild(host);
    // out of view = ours is shown (a button under the fold, or above it after a scroll)
    const place = () => {
      const content = document.querySelector('.content .container, .container.content') || document.querySelector('.container');
      const left = content ? Math.max(16, Math.round(content.getBoundingClientRect().left)) : 16;
      host.style.left = left + 'px';
    };
    const watch = new IntersectionObserver(entries => { host.hidden = entries[entries.length - 1].isIntersecting; }, { threshold: 0.2 });
    watch.observe(real);
    place();
    window.addEventListener('resize', place);
  }

  registerFeature({
    id: 'floatupload', label: 'Floating upload button',
    init: () => { if (here.add) floatingUpload(); }
  });
