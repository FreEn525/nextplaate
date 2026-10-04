(function () {
  'use strict';
  if (window.top !== window.self) return;           // ignore iframes
  if (document.getElementById('pmg-host')) return;  // already loaded

