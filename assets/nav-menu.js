/*
  Shared Work dropdown behaviour (all 11 pages).
  - Hover (mouse, trackpad): opens on enter and closes after a short grace period
    on leave, so moving diagonally into the menu doesn't close it.
  - Click on Work: opens and keeps the menu open; a second click closes it.
    A click straight after a hover-open keeps it open instead of toggling it shut.
  - Touch: tap to open or close, tap outside to close.
  - Keyboard: Enter/Space toggles, ArrowDown opens and moves into the menu,
    arrows/Home/End move between links, Escape closes and returns focus to Work,
    tabbing out closes.
  - Keeps the menu inside the viewport.
*/
(function () {
  var CLOSE_DELAY = 280;
  var hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');

  document.querySelectorAll('details.nav-projects').forEach(function (menu) {
    var summary = menu.querySelector('summary');
    var panel = menu.querySelector('.nav-projects-menu');
    if (!summary || !panel) return;
    var links = function () { return Array.prototype.slice.call(panel.querySelectorAll('a')); };
    var closeTimer = null;
    var pinned = false;        // opened by click, tap or keyboard
    var hoverOpened = false;   // opened by the pointer resting on it

    summary.setAttribute('aria-expanded', 'false');

    function fit() {
      menu.style.setProperty('--nav-menu-shift', '0px');
      if (!menu.open || getComputedStyle(panel).position === 'fixed') return;
      var r = panel.getBoundingClientRect();
      var gap = 8, shift = 0;
      if (r.right > window.innerWidth - gap) shift = window.innerWidth - gap - r.right;
      if (r.left + shift < gap) shift = gap - r.left;
      menu.style.setProperty('--nav-menu-shift', Math.round(shift) + 'px');
    }
    function open(how) {
      clearTimeout(closeTimer);
      if (how === 'hover') hoverOpened = !pinned; else { pinned = true; hoverOpened = false; }
      if (!menu.open) menu.open = true;
      summary.setAttribute('aria-expanded', 'true');
      fit();
    }
    function close(returnFocus) {
      clearTimeout(closeTimer);
      pinned = false; hoverOpened = false;
      if (menu.open) menu.open = false;
      summary.setAttribute('aria-expanded', 'false');
      if (returnFocus) summary.focus();
    }

    // Hover, with a grace period on leave
    menu.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !hoverCapable.matches) return;
      clearTimeout(closeTimer);
      if (!menu.open) open('hover');
    });
    menu.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse' || !hoverCapable.matches || pinned) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { close(false); }, CLOSE_DELAY);
    });

    // Click, tap and Enter/Space (summary activation) all arrive here
    summary.addEventListener('click', function (e) {
      e.preventDefault();
      if (menu.open && hoverOpened) { open('click'); return; }   // keep it open, now pinned
      if (menu.open) close(false); else open('click');
    });

    // Keyboard
    menu.addEventListener('keydown', function (e) {
      var items = links();
      var i = items.indexOf(document.activeElement);
      if (e.key === 'Escape' && menu.open) { e.preventDefault(); close(true); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!menu.open) open('key');
        (items[i + 1] || items[0]).focus();
      } else if (e.key === 'ArrowUp' && menu.open) {
        e.preventDefault();
        if (i <= 0) summary.focus(); else items[i - 1].focus();
      } else if (e.key === 'Home' && i >= 0) { e.preventDefault(); items[0].focus(); }
      else if (e.key === 'End' && i >= 0) { e.preventDefault(); items[items.length - 1].focus(); }
    });
    menu.addEventListener('focusout', function (e) {
      if (menu.open && !menu.contains(e.relatedTarget) && e.relatedTarget) close(false);
    });

    // Click or tap anywhere else closes it
    document.addEventListener('pointerdown', function (e) {
      if (menu.open && !menu.contains(e.target)) close(false);
    });
    window.addEventListener('resize', fit);
  });
})();
