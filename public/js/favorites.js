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
    document.querySelectorAll('#event-list tr').forEach((row, _index) => {
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
    button.textContent = '';
    const heartIcon = document.createElement('i');
    heartIcon.className = (isFav ? 'fas' : 'far') + ' fa-heart';
    button.appendChild(heartIcon);
    
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
    window.SharedUtils.showToast(message, type);
  }

  showFavoritesPanel() {
    const self = this;
    let panel = document.getElementById('favorites-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'favorites-panel';
      panel.className = 'favorites-panel';
      document.body.appendChild(panel);
    }

    const favorites = this.getAllFavorites();
    panel.textContent = '';

    // Header
    const header = document.createElement('div');
    header.className = 'favorites-header';
    const h3 = document.createElement('h3');
    const heartIcon = document.createElement('i');
    heartIcon.className = 'fas fa-heart';
    h3.appendChild(heartIcon);
    h3.appendChild(document.createTextNode(' My Favorites (' + favorites.length + ')'));
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-favorites';
    closeBtn.addEventListener('click', function () {
      panel.classList.remove('open');
    });
    closeBtn.appendChild(Sanitize.createIcon('fa-times'));
    header.appendChild(h3);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // List
    const list = document.createElement('div');
    list.className = 'favorites-list';

    if (favorites.length === 0) {
      const noFav = document.createElement('div');
      noFav.className = 'no-favorites';
      const emptyHeart = document.createElement('i');
      emptyHeart.className = 'far fa-heart';
      noFav.appendChild(emptyHeart);
      const p = document.createElement('p');
      p.textContent = 'No favorites yet! Click the heart icon to add favorites.';
      noFav.appendChild(p);
      list.appendChild(noFav);
    } else {
      favorites.forEach(function (fav) {
        const item = document.createElement('div');
        item.className = 'favorite-item';

        const info = document.createElement('div');
        info.className = 'favorite-info';
        const typeIcon = document.createElement('i');
        typeIcon.className = 'fas fa-' + (fav.type === 'event' ? 'futbol' : 'tv');
        info.appendChild(typeIcon);
        const textWrap = document.createElement('div');
        const titleEl = document.createElement('div');
        titleEl.className = 'favorite-title';
        titleEl.textContent = fav.title || '';
        const metaEl = document.createElement('div');
        metaEl.className = 'favorite-meta';
        metaEl.textContent = fav.type === 'event' ? (fav.sport || '') + ' \u2022 ' + (fav.date || '') : 'Channel';
        textWrap.appendChild(titleEl);
        textWrap.appendChild(metaEl);
        info.appendChild(textWrap);

        const actions = document.createElement('div');
        actions.className = 'favorite-actions';

        const playBtn = document.createElement('button');
        playBtn.className = 'play-button';
        playBtn.style.minWidth = '60px';
        playBtn.style.padding = '6px 12px';
        playBtn.appendChild(Sanitize.createIcon('fa-play'));
        playBtn.addEventListener('click', function () {
          var urlInput = document.getElementById('stream-url');
          if (urlInput) urlInput.value = Sanitize.sanitizeURL(fav.url);
          var loadBtn = document.getElementById('load-stream');
          if (loadBtn) loadBtn.click();
          panel.classList.remove('open');
          if (typeof window.navigateTo === 'function') window.navigateTo('page-stream');
        });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'favorite-remove';
        removeBtn.appendChild(Sanitize.createIcon('fa-trash'));
        removeBtn.addEventListener('click', function () {
          self.removeFavorite(fav.url);
          self.showFavoritesPanel();
        });

        actions.appendChild(playBtn);
        actions.appendChild(removeBtn);
        item.appendChild(info);
        item.appendChild(actions);
        list.appendChild(item);
      });
    }

    panel.appendChild(list);
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
    this.observer = new MutationObserver((_mutations) => {
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
let _favoritesManager;
document.addEventListener('DOMContentLoaded', () => {
  _favoritesManager = new FavoritesManager();
});
