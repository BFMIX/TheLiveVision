// themeToggle.js
// Dark/light theme toggle with localStorage persistence

(function() {
  'use strict';

  // ============================================
  // THEME TOGGLE
  // ============================================

  function initThemeToggle() {
    const themeToggle = document.getElementById('header-theme-toggle') || document.querySelector('.theme-toggle');
    if (!themeToggle) {
      console.warn('Theme toggle button not found');
      return;
    }

    // Initialize theme on load
    initializeTheme();

    // Click handler
    themeToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleTheme();
    });

    // Keyboard navigation
    themeToggle.setAttribute('tabindex', '0');
    themeToggle.setAttribute('role', 'button');
    themeToggle.setAttribute('aria-label', 'Toggle dark/light mode');

    themeToggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Apply the new theme
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update button state
    const themeToggle = document.getElementById('header-theme-toggle') || document.querySelector('.theme-toggle');
    if (themeToggle) {
      triggerThemeAnimation(themeToggle);
      updateThemeButton(themeToggle, newTheme);
    }

    console.log('[Theme] Switched to:', newTheme);
  }

  function initializeTheme() {
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Default to dark mode
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }

    // Update initial button state
    const themeToggle = document.getElementById('header-theme-toggle') || document.querySelector('.theme-toggle');
    if (themeToggle) {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      updateThemeButton(themeToggle, currentTheme);
    }
  }

  function updateThemeButton(themeToggle, currentTheme) {
    themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');

    const icon = themeToggle.querySelector('.theme-icon');
    if (!icon) return;

    icon.classList.remove('fa-sun', 'fa-moon');
    icon.classList.add(currentTheme === 'dark' ? 'fa-moon' : 'fa-sun');
  }

  function triggerThemeAnimation(themeToggle) {
    themeToggle.classList.remove('animating');
    // Force reflow so rapid clicks can replay the animation.
    void themeToggle.offsetWidth;
    themeToggle.classList.add('animating');

    setTimeout(() => {
      themeToggle.classList.remove('animating');
    }, 300);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
