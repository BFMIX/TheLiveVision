// advancedFeatures.js
// Confetti, Haptic, Page Transitions, Swipe Gestures

class AdvancedFeatures {
  constructor() {
    this.init();
  }

  init() {
    this.setupHapticFeedback();
    this.setupPageTransitions();
    this.setupSwipeGestures();
  }

  // Picture-in-Picture Support
  setupPictureInPicture() {
    const liveStream = document.getElementById('live-stream');
    if (!liveStream) return;

    // Check if PiP is supported
    if (!('pictureInPictureEnabled' in document)) {
      console.log('Picture-in-Picture not supported by browser');
      return;
    }

    // Create PiP button
    const pipButton = document.createElement('button');
    pipButton.className = 'pip-button play-button';
    pipButton.innerHTML = '<i class="fas fa-window-restore"></i> PIP';
    pipButton.style.minWidth = '80px';
    pipButton.style.padding = '8px 16px';
    pipButton.style.fontSize = '14px';
    
    pipButton.addEventListener('click', async () => {
      if (!document.pictureInPictureElement) {
        try {
          // Get the video element inside iframe if possible
          const videoElement = liveStream.contentDocument?.querySelector('video') || liveStream;
          
          if (videoElement.requestPictureInPicture) {
            await videoElement.requestPictureInPicture();
            this.showToast('Picture-in-Picture activated!', 'success');
            this.hapticFeedback('medium');
          } else {
            this.showToast('PiP not available for this stream', 'info');
          }
        } catch (error) {
          console.error('PiP error:', error);
          this.showToast('Cannot activate PiP for iframe content', 'info');
        }
      } else {
        await document.exitPictureInPicture();
        this.showToast('Exited Picture-in-Picture', 'info');
      }
    });

    // Auto PiP on mobile when leaving page
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      document.addEventListener('visibilitychange', async () => {
        if (document.hidden && liveStream.src) {
          try {
            const videoElement = liveStream.contentDocument?.querySelector('video');
            if (videoElement && !document.pictureInPictureElement) {
              await videoElement.requestPictureInPicture();
            }
          } catch (error) {
            console.log('Auto PiP not possible:', error.message);
          }
        }
      });
    }

    // Add button in stream section
    const streamSection = document.querySelector('.stream-section');
    if (streamSection) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'pip-cast-buttons';
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '10px';
      buttonContainer.style.justifyContent = 'center';
      buttonContainer.style.marginTop = '15px';
      
      buttonContainer.appendChild(pipButton);
      streamSection.insertBefore(buttonContainer, streamSection.querySelector('.more-links'));
    }
  }

  // Chromecast / AirPlay Support
  setupChromecast() {
    const liveStream = document.getElementById('live-stream');
    if (!liveStream) return;

    // Create Cast button
    const castButton = document.createElement('button');
    castButton.className = 'cast-button play-button';
    castButton.innerHTML = '<i class="fas fa-cast"></i> CAST';
    castButton.style.minWidth = '80px';
    castButton.style.padding = '8px 16px';
    castButton.style.fontSize = '14px';
    
    castButton.addEventListener('click', () => {
      // Check for WebKit (Safari) AirPlay
      if (window.WebKitPlaybackTargetAvailabilityEvent) {
        try {
          const videoElement = liveStream.contentDocument?.querySelector('video');
          if (videoElement && videoElement.webkitShowPlaybackTargetPicker) {
            videoElement.webkitShowPlaybackTargetPicker();
            this.showToast('Select AirPlay device', 'info');
          } else {
            this.showToast('AirPlay: Switch to video stream', 'info');
          }
        } catch (error) {
          this.showToast('AirPlay not available', 'info');
        }
      }
      // Check for Chrome Cast API
      else if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
        this.initiateCast();
      } 
      // Generic Remote Playback API
      else if ('remote' in HTMLMediaElement.prototype) {
        try {
          const videoElement = liveStream.contentDocument?.querySelector('video');
          if (videoElement && videoElement.remote) {
            videoElement.remote.prompt();
            this.showToast('Select Cast device', 'info');
          } else {
            this.showToast('Cast: Please use a direct video stream', 'info');
          }
        } catch (error) {
          this.showToast('Cast not available for this content', 'info');
        }
      }
      else {
        this.showToast('Cast not supported on this browser. Try Chrome or Safari.', 'info');
      }
    });

    // Add button next to PiP
    const pipCastContainer = document.querySelector('.pip-cast-buttons');
    if (pipCastContainer) {
      pipCastContainer.appendChild(castButton);
    }
  }

  initiateCast() {
    // Simplified Cast implementation
    this.showToast('Looking for Cast devices...', 'info');
    // In production, implement full Cast SDK
  }

  // Haptic Feedback (Mobile)
  hapticFeedback(type = 'light') {
    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        error: [20, 100, 20]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  }

  // Confetti on Add to Favorites
  triggerConfetti() {
    // Create canvas for confetti
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#FFD700', '#FF4444', '#2196F3', '#4CAF50', '#FF9800'];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 1) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 3,
        life: 100
      });
    }

    // Animate
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, index) => {
        if (p.life <= 0) {
          particles.splice(index, 1);
          return;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 100;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity
        p.life -= 2;
      });

      if (particles.length > 0) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    animate();
  }

  // Page Transitions
  setupPageTransitions() {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  }

  // Swipe Gestures
  setupSwipeGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleGesture = () => {
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);

      // Horizontal swipe (change pages)
      if (absX > absY && absX > 50) {
        if (diffX > 0) {
          // Swipe right - previous page
          this.navigatePrevious();
        } else {
          // Swipe left - next page
          this.navigateNext();
        }
      }

      // Pull to refresh
      if (absY > absX && diffY > 150 && window.scrollY === 0) {
        this.pullToRefresh();
      }
    };

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleGesture();
    });
  }

  navigateNext() {
    const tabs = ['page-stream', 'page-football', 'page-channels'];
    const active = document.querySelector('.page.active').id;
    const currentIndex = tabs.indexOf(active);
    const nextIndex = (currentIndex + 1) % tabs.length;
    
    const nextTab = document.querySelector(`[data-page="${tabs[nextIndex]}"]`);
    if (nextTab) {
      nextTab.click();
      this.hapticFeedback('light');
    }
  }

  navigatePrevious() {
    const tabs = ['page-stream', 'page-football', 'page-channels'];
    const active = document.querySelector('.page.active').id;
    const currentIndex = tabs.indexOf(active);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    
    const prevTab = document.querySelector(`[data-page="${tabs[prevIndex]}"]`);
    if (prevTab) {
      prevTab.click();
      this.hapticFeedback('light');
    }
  }

  pullToRefresh() {
    this.showToast('Refreshing...', 'info');
    this.hapticFeedback('medium');
    
    // Show loading animation
    document.body.style.opacity = '0.7';
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize advanced features
let advancedFeatures;
document.addEventListener('DOMContentLoaded', () => {
  advancedFeatures = new AdvancedFeatures();
  window.advancedFeatures = advancedFeatures;
});
