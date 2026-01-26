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
     * Generate skeleton HTML for a list/table
     * @param {string} type - 'events' or 'channels'
     * @param {number} count - Number of skeleton items
     * @returns {string} HTML string
     */
    generate(type, count = 5) {
      let html = '';
      for (let i = 0; i < count; i++) {
        if (type === 'events') {
          html += `
            <div class="skeleton-card skeleton-event">
              <div class="skeleton-badge skeleton-animate"></div>
              <div class="skeleton-line skeleton-date skeleton-animate"></div>
              <div class="skeleton-line skeleton-title skeleton-animate"></div>
              <div class="skeleton-line skeleton-subtitle skeleton-animate"></div>
              <div class="skeleton-buttons">
                <div class="skeleton-btn skeleton-animate"></div>
                <div class="skeleton-btn skeleton-animate"></div>
              </div>
            </div>
          `;
        } else if (type === 'channels') {
          html += `
            <div class="skeleton-card skeleton-channel">
              <div class="skeleton-flag skeleton-animate"></div>
              <div class="skeleton-line skeleton-name skeleton-animate"></div>
              <div class="skeleton-btn skeleton-animate"></div>
            </div>
          `;
        }
      }
      return html;
    },

    /**
     * Show skeleton in a container
     * @param {HTMLElement} container 
     * @param {string} type 
     */
    show(container, type) {
      if (!container) return;
      container.innerHTML = this.generate(type, isMobile() ? 4 : 6);
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
     * Generate empty state HTML
     * @param {string} message 
     * @param {string} icon - FontAwesome icon class
     * @returns {string} HTML string
     */
    generate(message, icon = 'fa-search') {
      return `
        <div class="empty-state">
          <i class="fas ${icon}"></i>
          <p>${message}</p>
        </div>
      `;
    },

    /**
     * Show empty state in table body
     * @param {HTMLElement} tbody 
     * @param {string} message 
     * @param {number} colspan 
     */
    showInTable(tbody, message, colspan = 4) {
      if (!tbody) return;
      tbody.innerHTML = `
        <tr class="empty-state-row">
          <td colspan="${colspan}">
            ${this.generate(message)}
          </td>
        </tr>
      `;
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
      container.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>${message}</p>
          <button class="retry-btn" onclick="(${retryFn.toString()})()">
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>
      `;
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
      indicator.innerHTML = '<i class="fas fa-arrow-down"></i> <span>Pull to refresh</span>';
      page.insertBefore(indicator, page.firstChild);

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
          indicator.style.transform = `translateY(${Math.min(pullDistance, 80)}px)`;
          indicator.style.opacity = Math.min(pullDistance / 60, 1);
          
          if (pullDistance > 60) {
            indicator.innerHTML = '<i class="fas fa-sync-alt"></i> <span>Release to refresh</span>';
            indicator.classList.add('ready');
          } else {
            indicator.innerHTML = '<i class="fas fa-arrow-down"></i> <span>Pull to refresh</span>';
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
          indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Refreshing...</span>';
          indicator.classList.add('refreshing');
          
          try {
            await refreshFn();
          } catch (e) {
            console.error('Refresh failed:', e);
          }
          
          setTimeout(() => {
            indicator.style.transform = 'translateY(0)';
            indicator.style.opacity = '0';
            indicator.classList.remove('ready', 'refreshing');
            isRefreshing = false;
          }, 500);
        } else {
          indicator.style.transform = 'translateY(0)';
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
      nav.innerHTML = `
        <a href="#" class="bottom-nav-item active" data-page="page-stream" onclick="navigateToWithBottomNav('page-stream', event)">
          <i class="fas fa-play-circle"></i>
          <span>Stream</span>
        </a>
        <a href="#" class="bottom-nav-item" data-page="page-football" onclick="navigateToWithBottomNav('page-football', event)">
          <i class="fas fa-futbol"></i>
          <span>Events</span>
        </a>
        <a href="#" class="bottom-nav-item" data-page="page-channels" onclick="navigateToWithBottomNav('page-channels', event)">
          <i class="fas fa-tv"></i>
          <span>Channels</span>
        </a>
      `;
      document.body.appendChild(nav);

      // Add body padding for bottom nav
      document.body.classList.add('has-bottom-nav');

      // Sync with header tabs
      this.syncWithHeaderTabs();
    },

    syncWithHeaderTabs() {
      const headerTabs = document.querySelectorAll('.tabbed-menu .tab');
      headerTabs.forEach(tab => {
        const originalOnclick = tab.getAttribute('onclick');
        tab.setAttribute('onclick', originalOnclick.replace('navigateTo(', 'navigateToWithBottomNav('));
      });
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
      const tabPageId = tab.getAttribute('onclick')?.match(/page-\w+/)?.[0];
      tab.classList.toggle('active', tabPageId === pageId);
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

      // Observe table rows and cards
      const observeElements = () => {
        document.querySelectorAll('#event-table tbody tr, #channel-table tbody tr, .skeleton-card').forEach(el => {
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
