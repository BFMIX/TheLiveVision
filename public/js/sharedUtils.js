// sharedUtils.js
// Shared utility functions used across multiple modules

(function () {
  'use strict';

  var API_BASE = window.API_BASE || 'https://beta.adstrim.ru';
  var EMBED_BASE = window.EMBED_BASE || 'https://viewembed.ru';

  window.API_BASE = API_BASE;
  window.EMBED_BASE = EMBED_BASE;

  function normalizeChannelValue(value) {
    if (!value) return '';
    return String(value).trim();
  }

  function buildChannelUrl(value) {
    var cleaned = normalizeChannelValue(value);
    if (!cleaned) return '';
    if (/^https?:\/\//i.test(cleaned)) {
      if (/^https?:\/\/beta\.adstrim\.ru/i.test(cleaned)) {
        return cleaned.replace(/^(https?:\/\/)beta\.adstrim\.ru/i, '$1viewembed.ru');
      }
      return cleaned;
    }
    var path = cleaned.replace(/^\/+/, '');
    if (path.toLowerCase().startsWith('channel/')) {
      var slug = path.slice('channel/'.length);
      return EMBED_BASE + '/channel/' + encodeURIComponent(slug);
    }
    return EMBED_BASE + '/channel/' + encodeURIComponent(path);
  }

  function extractCountry(channelName) {
    var match = String(channelName || '').match(/\[([^\]]+)\]$/);
    return match ? match[1] : 'International';
  }

  function cleanChannelName(channelName) {
    return String(channelName || '').replace(/\[[^\]]+\]$/, '').trim();
  }

  function showToast(message, type) {
    type = type || 'info';
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    var icon = document.createElement('i');
    icon.className = 'fas fa-' + (type === 'success' ? 'check' : 'info') + '-circle';
    toast.appendChild(icon);
    toast.appendChild(document.createTextNode(' ' + message));
    document.body.appendChild(toast);

    setTimeout(function () { toast.classList.add('show'); }, 100);
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  // Export globally
  window.SharedUtils = {
    normalizeChannelValue: normalizeChannelValue,
    buildChannelUrl: buildChannelUrl,
    extractCountry: extractCountry,
    cleanChannelName: cleanChannelName,
    showToast: showToast
  };
})();
