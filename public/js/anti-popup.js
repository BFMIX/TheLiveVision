// Anti-popup protection for iframe player
// Blocks ads and popups from iframe embeds

(function () {
  'use strict';

  const overlay = document.getElementById('iframe-overlay');
  const player = document.getElementById('live-stream');

  if (!overlay || !player) return;

  let clickCount = 0;
  const requiredClicks = 1; // Number of clicks before removing overlay

  // Show overlay initially to block first popup
  overlay.classList.add('active');

  // Handle overlay clicks
  overlay.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    clickCount++;

    console.log(`Click ${clickCount}/${requiredClicks} on overlay`);

    // Remove overlay after required clicks
    if (clickCount >= requiredClicks) {
      overlay.classList.remove('active');
      overlay.classList.add('hidden');
      console.log('✅ Overlay removed - Player accessible');
    } else {
      // Visual feedback
      overlay.style.background = 'rgba(255, 215, 0, 0.05)';
      setTimeout(() => {
        overlay.style.background = 'transparent';
      }, 200);
    }
  });

  // Reset click count when stream changes
  player.addEventListener('load', function () {
    clickCount = 0;
    overlay.classList.add('active');
    overlay.classList.remove('hidden');
    console.log('🔄 Stream changed - Overlay reset');
  });

  // Block window.open attempts from iframe (if possible)
  const _originalOpen = window.open;
  window.open = function (...args) {
    console.log('🚫 Blocked popup attempt:', args[0]);
    return null;
  };

  console.log('🛡️ Anti-popup protection active');
})();
