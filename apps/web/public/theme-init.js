// Applies the persisted theme before first paint so the shell never flashes the wrong surface colour.
// Kept as an external file (not inline) to satisfy the `script-src 'self'` CSP.
(function () {
  try {
    var t = localStorage.getItem('ezyify-theme');
    document.documentElement.classList.add(t === 'light' || t === 'dark' ? t : 'dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
