  /* =====================================================================
   *  PAGE STYLE (hover highlight while selecting)
   * ===================================================================== */
  const pageStyle = document.createElement('style');
  pageStyle.textContent = '.pmg-hover{outline:4px solid ' + SITE_BLUE + '!important;outline-offset:3px!important;cursor:crosshair!important}'
    + '.pmg-busy, .pmg-busy * {user-select:none!important;-webkit-user-select:none!important}'
    // the site's "brand and model" box (63-vehicle-box.js) and the list its autocomplete opens
    + `.pmg-vbox{max-width:620px}
       .pmg-vbox label{display:block;margin:0 0 6px;font-weight:600;color:${SITE_BLUE}}
       .pmg-vbox .ui-widget{position:relative}
       .pmg-vbox .ui-widget > span{display:none}
       .pmg-vbox #markamodtype{box-sizing:border-box;width:100%;height:38px;margin:0;padding:0 40px 0 12px;border:1px solid ${PAGE_GREY.line};border-radius:0;background:#fff;color:${PAGE_GREY.ink};font-size:14px;outline:none}
       .pmg-vbox #markamodtype:focus{border-color:${SITE_BLUE};box-shadow:0 0 0 3px color-mix(in srgb,${SITE_BLUE} 28%,transparent)}
       .pmg-vbox .pmg-clear{position:absolute;right:0;top:0;width:38px;height:38px;padding:0;border:0;background:none;color:${PAGE_GREY.mute};font-size:18px;line-height:1;cursor:pointer}
       .pmg-vbox .pmg-clear:hover{color:${SITE_BLUE}}
       .pmg-vbox .pmg-hint{margin:6px 0 0;font-size:12px;color:${PAGE_GREY.mute}}
       ul.ui-autocomplete{max-height:320px;overflow-x:hidden;overflow-y:auto;padding:4px 0;border:1px solid ${PAGE_GREY.line};border-radius:0;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.18);font-size:14px}
       ul.ui-autocomplete .ui-menu-item-wrapper{margin:0;padding:8px 12px;border:0;border-radius:0;color:${PAGE_GREY.ink}}
       ul.ui-autocomplete .ui-menu-item-wrapper.ui-state-active,ul.ui-autocomplete .ui-state-active{margin:0;border:0;background:color-mix(in srgb,${SITE_BLUE} 14%,#fff);color:${SITE_BLUE};font-weight:600}`;
  document.head.appendChild(pageStyle);

