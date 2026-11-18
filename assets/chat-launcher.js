/*
  Keeps the assistant launcher's aria-expanded in sync with the chat panel.
  Each page's own toggleChat() opens the panel by toggling `.open` on
  #chat-window; this only mirrors that state for assistive technology.
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
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
