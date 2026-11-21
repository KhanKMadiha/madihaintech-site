/*
  Keeps the assistant launcher's aria-expanded in sync with the chat panel,
  and lets any [data-open-assistant] button (the shared CTA's "Ask my AI
  assistant") open it. Each page's own toggleChat() opens the panel by
  toggling `.open` on #chat-window.
*/
(function () {
  function init() {
    var toggle = document.getElementById('chat-toggle');
    var panel = document.getElementById('chat-window');
    if (!toggle || !panel) return;
    var sync = function () {
      toggle.setAttribute('aria-expanded', panel.classList.contains('open') ? 'true' : 'false');
    };
    sync();
    new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ['class'] });

    // "Ask my AI assistant" buttons (shared CTA) open this same panel with the page's own toggleChat().
    var opener = null;
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-open-assistant]');
      if (!btn || typeof window.toggleChat !== 'function') return;
      opener = btn;
      if (panel.classList.contains('open')) {
        var input = document.getElementById('chat-input');
        if (input) input.focus();
      } else {
        window.toggleChat();   // opens the panel and moves focus to the message box
      }
    });
    // When the panel closes, return focus to the button that opened it (if focus was left inside the panel).
    new MutationObserver(function () {
      if (panel.classList.contains('open') || !opener) return;
      var a = document.activeElement;
      if (!a || a === document.body || panel.contains(a)) opener.focus({ preventScroll: true });
      opener = null;
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
