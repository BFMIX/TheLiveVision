/**
 * UX Enhancements - TheLiveVision
 * Skeleton loaders, Pull-to-refresh, Empty states, Error handling
 */

(function() {
  'use strict';

  // ============================================
  // UTILITY: Check if mobile
  // ============================================
  const isMobile = () => window.innerWidth <= 768;

  // ============================================
  // SKELETON LOADER UTILITY
  // ============================================
  const SkeletonLoader = {
    /**
     * Show skeleton in a container
     * @param {HTMLElement} container 
     * @param {string} type 
     */
    show(container, type) {
      if (!container) return;
      container.textContent = '';
      const count = isMobile() ? 4 : 6;
      for (let i = 0; i < count; i++) {
        const card = document.createElement('div');
        if (type === 'events') {
          card.className = 'skeleton-card skeleton-event';
          ['skeleton-badge', 'skeleton-line skeleton-date', 'skeleton-line skeleton-title', 'skeleton-line skeleton-subtitle'].forEach(function (cls) {
            const div = document.createElement('div');
            div.className = cls + ' skeleton-animate';
            card.appendChild(div);
          });
          const btns = document.createElement('div');
          btns.className = 'skeleton-buttons';
          for (let j = 0; j < 2; j++) {
            const btn = document.createElement('div');
            btn.className = 'skeleton-btn skeleton-animate';
            btns.appendChild(btn);
          }
          card.appendChild(btns);
        } else if (type === 'channels') {
          card.className = 'skeleton-card skeleton-channel';
          ['skeleton-flag', 'skeleton-line skeleton-name', 'skeleton-btn'].forEach(function (cls) {
            const div = document.createElement('div');
            div.className = cls + ' skeleton-animate';
            card.appendChild(div);
          });
        }
        container.appendChild(card);
      }
      container.classList.add('skeleton-container');
    },

    /**
     * Hide skeleton (container will be replaced by real content)
     * @param {HTMLElement} container 
     */
    hide(container) {
      if (!container) return;
      container.classList.remove('skeleton-container');
    }
  };

  // ============================================
  // EMPTY STATE UTILITY
  // ============================================
  const EmptyState = {
    /**
     * Show empty state in any container used by the page lists
     * @param {HTMLElement} container
     * @param {string} message
     * @param {string} icon - FontAwesome icon class
     */
    showInContainer(container, message, icon) {
      if (!container) return;
      container.textContent = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'empty-message';
      const state = document.createElement('div');
      state.className = 'empty-state';
      const iconEl = document.createElement('i');
      iconEl.className = 'fas ' + (icon || 'fa-search');
      state.appendChild(iconEl);
      const p = document.createElement('p');
      p.textContent = message;
      state.appendChild(p);
      wrapper.appendChild(state);
      container.appendChild(wrapper);
    }
  };

  // ============================================
  // ERROR STATE UTILITY
  // ============================================
  const ErrorState = {
    /**
     * Show error with retry button
     * @param {HTMLElement} container - Error message container
     * @param {string} message
     * @param {Function} retryFn - Function to call on retry
     */
    show(container, message, retryFn) {
      if (!container) return;
      container.textContent = '';
      const state = document.createElement('div');
      state.className = 'error-state';
      const icon = document.createElement('i');
      icon.className = 'fas fa-exclamation-triangle';
      state.appendChild(icon);
      const p = document.createElement('p');
      p.textContent = message;
      state.appendChild(p);
      const btn = document.createElement('button');
      btn.className = 'retry-btn';
      const redoIcon = document.createElement('i');
      redoIcon.className = 'fas fa-redo';
      btn.appendChild(redoIcon);
      btn.appendChild(document.createTextNode(' Retry'));
      btn.addEventListener('click', function () { retryFn(); });
      state.appendChild(btn);
      container.appendChild(state);
      container.style.display = 'block';
    },

    /**
     * Hide error
     * @param {HTMLElement} container 
     */
    hide(container) {
      if (!container) return;
      container.style.display = 'none';
    }
  };

  // ============================================
  // PULL TO REFRESH
  // ============================================
  const PullToRefresh = {
    instances: new Map(),
    
    /**
     * Initialize pull-to-refresh on a page
     * @param {string} pageId - ID of the page section
     * @param {Function} refreshFn - Async function to refresh data
     */
    init(pageId, refreshFn) {
      if (!isMobile()) return;
      
      const page = document.getElementById(pageId);
      if (!page || this.instances.has(pageId)) return;

      let startY = 0;
      let currentY = 0;
      let isPulling = false;
      let isRefreshing = false;

      // Create pull indicator
      const indicator = document.createElement('div');
      indicator.className = 'pull-indicator';
      indicator.appendChild(Sanitize.createIcon('fa-arrow-down'));
      indicator.appendChild(document.createTextNode(' '));
      const indicatorText = document.createElement('span');
      indicatorText.textContent = 'Pull to refresh';
      indicator.appendChild(indicatorText);
      page.insertBefore(indicator, page.firstChild);

      function updateIndicator(el, iconClass, text) {
        el.textContent = '';
        el.appendChild(Sanitize.createIcon(iconClass));
        el.appendChild(document.createTextNode(' '));
        var span = document.createElement('span');
        span.textContent = text;
        el.appendChild(span);
      }

      const tableContainer = page.querySelector('.table-container');
      if (!tableContainer) return;

      const handleTouchStart = (e) => {
        if (isRefreshing) return;
        if (window.scrollY <= 0 || tableContainer.scrollTop <= 0) {
          startY = e.touches[0].clientY;
          isPulling = true;
        }
      };

      const handleTouchMove = (e) => {
        if (!isPulling || isRefreshing) return;
        
        currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;

        if (pullDistance > 0 && pullDistance < 150) {
          // Show indicator sliding down from top
          indicator.style.transform = `translateY(${Math.max(-100 + pullDistance * 0.5, 0)}%)`;
          indicator.style.opacity = Math.min(pullDistance / 60, 1);
          
          if (pullDistance > 60) {
            updateIndicator(indicator, 'fa-sync-alt', 'Release to refresh');
            indicator.classList.add('ready');
          } else {
            updateIndicator(indicator, 'fa-arrow-down', 'Pull to refresh');
            indicator.classList.remove('ready');
          }
        }
      };

      const handleTouchEnd = async () => {
        if (!isPulling || isRefreshing) return;
        
        const pullDistance = currentY - startY;
        isPulling = false;

        if (pullDistance > 60) {
          isRefreshing = true;
          updateIndicator(indicator, 'fa-spinner fa-spin', 'Refreshing...');
          indicator.classList.add('refreshing');
          // Keep indicator visible while refreshing
          indicator.style.transform = 'translateY(0)';
          indicator.style.opacity = '1';
          
          try {
            await refreshFn();
          } catch (e) {
            console.error('Refresh failed:', e);
          }
          
          setTimeout(() => {
            indicator.style.transform = 'translateY(-100%)';
            indicator.style.opacity = '0';
            indicator.classList.remove('ready', 'refreshing');
            isRefreshing = false;
          }, 500);
        } else {
          indicator.style.transform = 'translateY(-100%)';
          indicator.style.opacity = '0';
          indicator.classList.remove('ready');
        }

        startY = 0;
        currentY = 0;
      };

      tableContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
      tableContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
      tableContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

      this.instances.set(pageId, { indicator, tableContainer });
    }
  };

  // ============================================
  // HAPTIC FEEDBACK
  // ============================================
  const HapticFeedback = {
    /**
     * Trigger a light haptic feedback (10-20ms vibration)
     * Safe fallback if not supported
     */
    light() {
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate(15);
        }
      } catch (e) {
        // Silently fail if not supported
      }
    },
    
    /**
     * Trigger a medium haptic feedback
     */
    medium() {
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate(25);
        }
      } catch (e) {
        // Silently fail
      }
    },
    
    /**
     * Trigger a success pattern
     */
    success() {
      try {
        if ('vibrate' in navigator) {
          navigator.vibrate([10, 50, 10]);
        }
      } catch (e) {
        // Silently fail
      }
    }
  };

  // ============================================
  // BOTTOM NAVIGATION
  // ============================================
  const BottomNav = {
    init() {
      // Only on mobile
      if (!isMobile()) return;
      
      // Check if already exists
      if (document.querySelector('.bottom-nav')) return;

      const nav = document.createElement('nav');
      nav.className = 'bottom-nav';
      nav.setAttribute('aria-label', 'Bottom navigation');

      const navItems = [
        { page: 'page-stream', icon: 'fa-play-circle', label: 'Stream', active: true },
        { page: 'page-football', icon: 'fa-futbol', label: 'Sports Events', active: false },
        { page: 'page-channels', icon: 'fa-tv', label: 'TV Channels', active: false }
      ];

      navItems.forEach(function (item) {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'bottom-nav-item' + (item.active ? ' active' : '');
        a.dataset.page = item.page;
        a.appendChild(Sanitize.createIcon(item.icon));
        const span = document.createElement('span');
        span.textContent = item.label;
        a.appendChild(span);
        a.addEventListener('click', function (event) {
          window.navigateToWithBottomNav(item.page, event);
        });
        nav.appendChild(a);
      });

      document.body.appendChild(nav);

      // Add body padding for bottom nav
      document.body.classList.add('has-bottom-nav');

      // Sync with header tabs
      this.syncWithHeaderTabs();
    },

    syncWithHeaderTabs() {
      // Navigation is handled in navigation.js
      return;
    },

    setActive(pageId) {
      const items = document.querySelectorAll('.bottom-nav-item');
      items.forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageId);
      });
    }
  };

  // Global navigation function that syncs both navs
  window.navigateToWithBottomNav = function(pageId, event) {
    if (event) event.preventDefault();
    
    // Haptic feedback on navigation
    HapticFeedback.light();
    
    // Call original navigateTo
    if (typeof window.navigateTo === 'function') {
      window.navigateTo(pageId);
    }
    
    // Sync bottom nav
    BottomNav.setActive(pageId);
    
    // Sync header tabs
    const tabs = document.querySelectorAll('.tabbed-menu .tab');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.page === pageId);
    });
  };

  // ============================================
  // MICRO-ANIMATIONS
  // ============================================
  const MicroAnimations = {
    init() {
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduce-motion');
        return;
      }

      // Add animation class to body
      document.body.classList.add('animations-enabled');

      // Observe cards for entrance animations
      this.setupIntersectionObserver();
    },

    setupIntersectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      // Observe dynamic cards and loading placeholders
      const observeElements = () => {
        document.querySelectorAll('.event-card, .channel-card, .skeleton-card, .empty-message').forEach(el => {
          if (!el.classList.contains('animate-in')) {
            observer.observe(el);
          }
        });
      };

      // Initial observation
      observeElements();

      // Re-observe after data loads
      const originalMutationObserver = new MutationObserver(() => {
        observeElements();
      });

      const eventList = document.getElementById('event-list');
      const channelList = document.getElementById('channel-list');
      
      if (eventList) originalMutationObserver.observe(eventList, { childList: true });
      if (channelList) originalMutationObserver.observe(channelList, { childList: true });
    }
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    // Bottom navigation (mobile only)
    BottomNav.init();

    // Micro-animations
    MicroAnimations.init();

    // Header logo animation (load + click)
    const headerLogo = document.querySelector('.header-logo');
    if (headerLogo) {
      headerLogo.classList.add('logo-animate-in');
      headerLogo.addEventListener('click', () => {
        headerLogo.classList.remove('logo-clicked');
        void headerLogo.offsetWidth;
        headerLogo.classList.add('logo-clicked');
      });
      headerLogo.addEventListener('animationend', (event) => {
        if (event.animationName === 'logoPulse') {
          headerLogo.classList.remove('logo-clicked');
        }
      });
    }

    // Re-init on resize (for bottom nav)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (isMobile() && !document.querySelector('.bottom-nav')) {
          BottomNav.init();
        } else if (!isMobile()) {
          const bottomNav = document.querySelector('.bottom-nav');
          if (bottomNav) {
            bottomNav.remove();
            document.body.classList.remove('has-bottom-nav');
          }
        }
      }, 250);
    });
  }

  // Export utilities for use in other scripts
  window.UXEnhancements = {
    SkeletonLoader,
    EmptyState,
    ErrorState,
    PullToRefresh,
    BottomNav,
    MicroAnimations,
    HapticFeedback,
    isMobile
  };

  // Initialize when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
