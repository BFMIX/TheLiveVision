// navigation.js
// SPA page navigation with header and bottom-nav sync

(function () {
  'use strict';

  const DEFAULT_PAGE = 'page-stream';

  function getPageIdFromHash() {
    const hash = (window.location.hash || '').replace('#', '').trim();
    if (!hash) return null;
    const page = document.querySelector(`.page[data-hash="${hash}"]`);
    return page ? page.id : null;
  }

  function setActiveNav(pageId) {
    document.querySelectorAll('.tab').forEach((link) => {
      link.classList.toggle('active', link.dataset.page === pageId);
    });

    document.querySelectorAll('.bottom-nav-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.page === pageId);
    });
  }

  function updateHeaderTitle(pageId) {
    const titleEl = document.getElementById('mobile-header-title');
    if (!titleEl) return;

    const page = document.getElementById(pageId);
    if (!page) return;

    const title = page.getAttribute('data-title') || '';
    titleEl.textContent = title;
  }

  function updateDocumentTitle(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;

    const title = page.getAttribute('data-title') || 'THE LIVE VISION';
    document.title = `The Live Vision - ${title}`;
  }

  function updateHash(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;

    const hash = page.getAttribute('data-hash');
    if (!hash) return;

    if (window.location.hash.replace('#', '') !== hash) {
      history.replaceState(null, '', `#${hash}`);
    }
  }

  function navigateTo(pageId, event) {
    if (event) event.preventDefault();

    const page = document.getElementById(pageId);
    if (!page) return;

    document.querySelectorAll('.page').forEach((p) => p.classList.add('hidden'));
    page.classList.remove('hidden');

    setActiveNav(pageId);
    updateHeaderTitle(pageId);
    updateDocumentTitle(pageId);
    updateHash(pageId);
  }

  window.navigateTo = navigateTo;
  window.navigateToWithBottomNav = navigateTo;

  function bindNavLinks() {
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', (event) => {
        const pageId = tab.dataset.page;
        if (pageId) navigateTo(pageId, event);
      });
    });

    const logo = document.querySelector('.header-logo');
    if (logo) {
      logo.addEventListener('click', (event) => navigateTo(DEFAULT_PAGE, event));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindNavLinks();
    const pageFromHash = getPageIdFromHash();
    navigateTo(pageFromHash || DEFAULT_PAGE);
  });

  window.addEventListener('hashchange', () => {
    const pageFromHash = getPageIdFromHash();
    if (pageFromHash) {
      navigateTo(pageFromHash);
    }
  });
})();
