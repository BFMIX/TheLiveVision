// sanitize.js
// Centralized XSS protection utilities

(function () {
  'use strict';

  /**
   * Escape a string for safe insertion into HTML text content.
   * Use this when inserting user/API data into template literals.
   */
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Escape a string for safe use inside an HTML attribute value.
   * Same as escapeHTML but explicit naming for clarity.
   */
  function escapeAttr(str) {
    return escapeHTML(str);
  }

  /**
   * Sanitize a full HTML string using DOMPurify.
   * Allows safe structural HTML (tags, attributes) but strips XSS vectors.
   */
  function sanitizeHTML(html) {
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(html, {
        ADD_ATTR: ['loading', 'decoding', 'aria-hidden', 'aria-expanded',
                   'aria-controls', 'aria-haspopup', 'data-tooltip',
                   'data-stream-url', 'data-event-id', 'data-src',
                   'data-page', 'data-index', 'data-value', 'data-for',
                   'allowfullscreen', 'referrerpolicy'],
        ADD_TAGS: ['iframe'],
        FORBID_TAGS: ['script', 'style'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover',
                      'onfocus', 'onblur', 'onsubmit', 'onchange']
      });
    }
    // Fallback: strip all tags if DOMPurify not loaded
    return escapeHTML(html);
  }

  /**
   * Validate that a URL is safe (http/https only).
   */
  function sanitizeURL(url) {
    if (!url) return '';
    var str = String(url).trim();
    if (/^https?:\/\//i.test(str)) return str;
    if (/^\/[^/]/.test(str)) return str; // relative path
    return '';
  }

  /**
   * Create a Font Awesome icon element safely.
   */
  function createIcon(iconClass) {
    var i = document.createElement('i');
    i.className = 'fas ' + iconClass;
    return i;
  }

  // Export globally
  window.Sanitize = {
    escapeHTML: escapeHTML,
    escapeAttr: escapeAttr,
    sanitizeHTML: sanitizeHTML,
    sanitizeURL: sanitizeURL,
    createIcon: createIcon
  };
})();
