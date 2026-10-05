  /* =====================================================================
   *  PAGE STYLE (hover highlight while selecting)
   * ===================================================================== */
  const pageStyle = document.createElement('style');
  pageStyle.textContent = '.pmg-hover{outline:4px solid #3781c5!important;outline-offset:3px!important;cursor:crosshair!important}'
    + '.pmg-busy, .pmg-busy * {user-select:none!important;-webkit-user-select:none!important}';
  document.head.appendChild(pageStyle);

