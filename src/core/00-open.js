(function () {
  'use strict';
  if (window.top !== window.self) return;           // ignore iframes
  if (document.getElementById('pmg-host')) return;  // already loaded
  // A Google page (the script also matches Google, for Lens): the photo goes into Google's box, nothing else starts here
  if (!/(^|\.)platesmania\.com$/.test(location.hostname)) { lensOnGoogle(); return; }

