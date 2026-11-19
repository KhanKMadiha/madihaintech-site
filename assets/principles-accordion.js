/*
  Principles accordion (homepage principles.md tab and About page).
  Each heading button toggles its own explanation; all start collapsed.
  Content is generated from content/principles.json by scripts/sync_principles.py.
*/
(function () {
  function init() {
    document.querySelectorAll('.pacc__btn').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel || btn.dataset.paccBound) return;
      btn.dataset.paccBound = '1';
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.hidden = !open;
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
