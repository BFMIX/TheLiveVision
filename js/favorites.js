// favorites.js
// Favorites/Bookmarks management system

class FavoritesManager {
  constructor() {
    this.favorites = this.loadFavorites();
    this.init();
  }

  loadFavorites() {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  }

  saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  addFavorite(item) {
    const exists = this.favorites.find(fav => fav.url === item.url);
    if (!exists) {
      this.favorites.push({
        ...item,
        addedAt: new Date().toISOString()
      });
      this.saveFavorites();
      return true;
    }
    return false;
  }

  removeFavorite(url) {
    this.favorites = this.favorites.filter(fav => fav.url !== url);
    this.saveFavorites();
  }

  isFavorite(url) {
    return this.favorites.some(fav => fav.url === url);
  }

  toggleFavorite(item) {
    if (this.isFavorite(item.url)) {
      this.removeFavorite(item.url);
      return false;
    } else {
      this.addFavorite(item);
      return true;
    }
  }

  getAllFavorites() {
    return this.favorites;
  }

  // Add star icons to all relevant buttons
  addFavoriteIcons() {
    // Disconnect observer to prevent infinite loop
    if (this.observer) {
      this.observer.disconnect();
    }

    // Add to event table rows
    document.querySelectorAll('#event-list tr').forEach((row, index) => {
      const actionsCell = row.querySelector('td:last-child');
      if (actionsCell) {
        // Check if star button already exists
        if (actionsCell.querySelector('.favorite-button')) {
          return; // Skip if already added
        }

        const playButton = actionsCell.querySelector('.play-button');
        if (playButton) {
          const url = playButton.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
          if (url) {
            const starBtn = this.createStarButton({
              url: url,
              title: row.cells[4]?.textContent || 'Event',
              type: 'event',
              sport: row.cells[2]?.textContent,
              date: row.cells[0]?.textContent
            });
            actionsCell.insertBefore(starBtn, playButton);
          }
        }
      }
    });

    // Add to channel table rows
    document.querySelectorAll('#channel-list tr').forEach(row => {
      const actionsCell = row.querySelector('td:last-child');
      if (actionsCell) {
        // Check if star button already exists
        if (actionsCell.querySelector('.favorite-button')) {
          return; // Skip if already added
        }

        const urlInput = row.querySelector('.channel-link-input');
        if (urlInput) {
          const url = urlInput.value;
          const starBtn = this.createStarButton({
            url: url,
            title: row.cells[0]?.textContent || 'Channel',
            type: 'channel'
          });
          actionsCell.insertBefore(starBtn, actionsCell.firstChild);
        }
      }
    });

    // Reconnect observer after DOM manipulation
    if (this.observer) {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  createStarButton(item) {
    const button = document.createElement('button');
    button.className = 'favorite-button play-button';
    button.style.minWidth = '40px';
    button.style.padding = '8px 12px';
    button.style.marginRight = '6px';
    button.setAttribute('data-tooltip', 'Add to favorites');
    
    const isFav = this.isFavorite(item.url);
    button.innerHTML = `<i class="fa${isFav ? 's' : 'r'} fa-heart"></i>`;
    
    if (isFav) {
      button.classList.add('favorited');
      button.style.background = 'linear-gradient(135deg, #FF4444, #CC0000)';
      button.setAttribute('data-tooltip', 'Remove from favorites');
    }

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const added = this.toggleFavorite(item);
      const icon = button.querySelector('i');
      
      if (added) {
        icon.className = 'fas fa-heart';
        button.classList.add('favorited');
        button.style.background = 'linear-gradient(135deg, #FF4444, #CC0000)';
        button.setAttribute('data-tooltip', 'Remove from favorites');
        this.showToast('Added to favorites!', 'success');
        
        // Trigger confetti!
        if (window.triggerConfetti) {
          window.triggerConfetti();
        }
        
        // Update badge count
        if (this.favBadge) {
          this.favBadge.textContent = this.favorites.length;
        }
      } else {
        icon.className = 'far fa-heart';
        button.classList.remove('favorited');
        button.style.background = '';
        button.setAttribute('data-tooltip', 'Add to favorites');
        this.showToast('Removed from favorites', 'info');
        
        // Update badge count
        if (this.favBadge) {
          this.favBadge.textContent = this.favorites.length;
        }
      }
      
      // Refresh favorites panel if open
      if (document.getElementById('favorites-panel')?.classList.contains('open')) {
        this.showFavoritesPanel();
      }
    });

    return button;
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

  showFavoritesPanel() {
    let panel = document.getElementById('favorites-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'favorites-panel';
      panel.className = 'favorites-panel';
      document.body.appendChild(panel);
    }

    const favorites = this.getAllFavorites();
    
    panel.innerHTML = `
      <div class="favorites-header">
        <h3><i class="fas fa-heart"></i> My Favorites (${favorites.length})</h3>
        <button class="close-favorites" onclick="document.getElementById('favorites-panel').classList.remove('open')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="favorites-list">
        ${favorites.length === 0 ? 
          '<div class="no-favorites"><i class="far fa-heart"></i><p>No favorites yet!<br>Click the heart icon to add favorites.</p></div>' :
          favorites.map(fav => `
            <div class="favorite-item">
              <div class="favorite-info">
                <i class="fas fa-${fav.type === 'event' ? 'futbol' : 'tv'}"></i>
                <div>
                  <div class="favorite-title">${fav.title}</div>
                  <div class="favorite-meta">${fav.type === 'event' ? `${fav.sport} • ${fav.date}` : 'Channel'}</div>
                </div>
              </div>
              <div class="favorite-actions">
                <button class="play-button" style="min-width: 60px; padding: 6px 12px;" onclick="document.getElementById('stream-url').value='${fav.url}'; document.getElementById('load-stream').click(); document.getElementById('favorites-panel').classList.remove('open'); navigateTo('page-stream');">
                  <i class="fas fa-play"></i>
                </button>
                <button class="favorite-remove" onclick="favoritesManager.removeFavorite('${fav.url}'); favoritesManager.showFavoritesPanel();">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('')
        }
      </div>
    `;

    panel.classList.add('open');

    // Close on overlay/outside click
    setTimeout(() => {
      const closeOnOutside = (e) => {
        if (e.target === panel) {
          panel.classList.remove('open');
          document.removeEventListener('click', closeOnOutside);
        }
      };
      document.addEventListener('click', closeOnOutside);
    }, 100);

    // Close on ESC key
    const closeOnEsc = (e) => {
      if (e.key === 'Escape') {
        panel.classList.remove('open');
        document.removeEventListener('keydown', closeOnEsc);
      }
    };
    document.addEventListener('keydown', closeOnEsc);
  }

  init() {
    // Use header button instead of creating floating button
    const headerFavButton = document.getElementById('favorites-header-btn');
    const favBadge = headerFavButton?.querySelector('.fav-badge');
    
    if (headerFavButton && favBadge) {
      favBadge.textContent = this.favorites.length;
      headerFavButton.onclick = () => this.showFavoritesPanel();
    }

    // Store badge reference for updates
    this.favBadge = favBadge;

    // Create and configure MutationObserver with better performance
    this.observer = new MutationObserver((mutations) => {
      // Use debounce to prevent too many calls
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.addFavoriteIcons();
      }, 500); // Wait 500ms after last mutation
    });

    // Store observer reference for disconnect/reconnect
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial icon addition after page loads
    setTimeout(() => this.addFavoriteIcons(), 2000);
  }
}

// Initialize favorites manager
let favoritesManager;
document.addEventListener('DOMContentLoaded', () => {
  favoritesManager = new FavoritesManager();
});
