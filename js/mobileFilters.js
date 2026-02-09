// mobileFilters.js
// Handles mobile filter accordion functionality

document.addEventListener('DOMContentLoaded', function() {
  // Event filter toggle
  const eventFilterToggle = document.getElementById('event-filter-toggle');
  const eventFilterBox = document.getElementById('event-filter-box');
  
  // Channel filter toggle
  const channelFilterToggle = document.getElementById('channel-filter-toggle');
  const channelFilterBox = document.getElementById('channel-filter-box');
  
  // Setup event filter accordion
  if (eventFilterToggle && eventFilterBox) {
    eventFilterToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      eventFilterBox.classList.toggle('expanded');
    });
  }
  
  // Setup channel filter accordion
  if (channelFilterToggle && channelFilterBox) {
    channelFilterToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      channelFilterBox.classList.toggle('expanded');
    });
  }
  
  // Close filters when clicking outside on mobile
  document.addEventListener('click', function(e) {
    if (window.innerWidth > 768) return;
    
    // Check if click is outside event filter area
    if (eventFilterToggle && eventFilterBox) {
      if (!eventFilterToggle.contains(e.target) && !eventFilterBox.contains(e.target)) {
        eventFilterToggle.classList.remove('active');
        eventFilterBox.classList.remove('expanded');
      }
    }
    
    // Check if click is outside channel filter area
    if (channelFilterToggle && channelFilterBox) {
      if (!channelFilterToggle.contains(e.target) && !channelFilterBox.contains(e.target)) {
        channelFilterToggle.classList.remove('active');
        channelFilterBox.classList.remove('expanded');
      }
    }
  });
  
  // Handle resize - show filters on desktop, hide on mobile
  function handleResize() {
    if (window.innerWidth > 768) {
      // Desktop: always show filters
      if (eventFilterBox) {
        eventFilterBox.style.maxHeight = 'none';
        eventFilterBox.style.opacity = '1';
        eventFilterBox.style.overflow = 'visible';
      }
      if (channelFilterBox) {
        channelFilterBox.style.maxHeight = 'none';
        channelFilterBox.style.opacity = '1';
        channelFilterBox.style.overflow = 'visible';
      }
    } else {
      // Mobile: reset to CSS controlled
      if (eventFilterBox) {
        eventFilterBox.style.maxHeight = '';
        eventFilterBox.style.opacity = '';
        eventFilterBox.style.overflow = '';
      }
      if (channelFilterBox) {
        channelFilterBox.style.maxHeight = '';
        channelFilterBox.style.opacity = '';
        channelFilterBox.style.overflow = '';
      }
    }
  }
  
  // Initial check
  handleResize();
  
  // Listen for resize
  window.addEventListener('resize', handleResize);
});
