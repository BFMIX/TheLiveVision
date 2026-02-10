// searchStream.js
// Real-time search for sports events using beta.adstrim.ru (API) and viewembed.ru (player)

(function () {
  'use strict';

  const API_BASE = window.API_BASE || "https://beta.adstrim.ru";
  const EMBED_BASE = window.EMBED_BASE || "https://viewembed.ru";

  window.API_BASE = API_BASE;
  window.EMBED_BASE = EMBED_BASE;

  function normalizeChannelValue(value) {
    if (!value) return "";
    return String(value).trim();
  }

  function buildChannelUrl(value) {
    const cleaned = normalizeChannelValue(value);
    if (!cleaned) return "";
    if (/^https?:\/\//i.test(cleaned)) {
      if (/^https?:\/\/beta\.adstrim\.ru/i.test(cleaned)) {
        return cleaned.replace(/^(https?:\/\/)beta\.adstrim\.ru/i, "$1viewembed.ru");
      }
      return cleaned;
    }
    const path = cleaned.replace(/^\/+/, "");
    if (path.toLowerCase().startsWith("channel/")) {
      const slug = path.slice("channel/".length);
      return `${EMBED_BASE}/channel/${encodeURIComponent(slug)}`;
    }
    return `${EMBED_BASE}/channel/${encodeURIComponent(path)}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
  const streamUrlInput = document.getElementById("stream-url");
  const searchResults = document.getElementById("search-results");
  
  // Guard: check if elements exist
  if (!streamUrlInput || !searchResults) {
    console.warn('Search elements not found, skipping search initialization');
    return;
  }

  let allEvents = [];
  let selectedIndex = -1;
  let isLoading = false;

  // Load events data from new API
  async function loadSearchData() {
    if (isLoading) return;
    isLoading = true;

    try {
      const eventsController = new AbortController();
      const eventsTimeout = setTimeout(() => eventsController.abort(), 15000);
      
      try {
        const eventsResponse = await fetch(`${API_BASE}/api/events`, {
          signal: eventsController.signal
        });
        clearTimeout(eventsTimeout);
        
        if (eventsResponse.ok) {
          const apiResponse = await eventsResponse.json();
          
          if (apiResponse.status === 'success' && apiResponse.data) {
            allEvents = apiResponse.data.map(event => {
              const dateObj = new Date(event.timestamp * 1000);
              const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
              const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              
              const sportName = event.sport || event.sport_name || event.sportName || 'Sport';
              const leagueName = event.league || event.tournament || event.league_name || event.leagueName || 'League';
              const homeTeam = event.home_team || event.homeTeam || event.home || '';
              const awayTeam = event.away_team || event.awayTeam || event.away || '';

              // Build match name
              const matchName = homeTeam && awayTeam
                ? `${homeTeam} vs ${awayTeam}`
                : event.match || event.name || event.title || 'TBD';

              // Get first channel URL
              const channelValue = event.channels && event.channels.length > 0
                ? (event.channels[0].name || event.channels[0].link)
                : '';
              const channelUrl = buildChannelUrl(channelValue);

              return {
                type: 'event',
                title: matchName,
                meta: `${sportName} - ${leagueName} - ${dateStr} ${timeStr}`,
                url: channelUrl,
                sport: sportName,
                tournament: leagueName,
                match: matchName,
                home_team: homeTeam,
                away_team: awayTeam,
                date: dateStr,
                time: timeStr,
                channels: event.channels || []
              };
            });
            console.log(`Loaded ${allEvents.length} sports events for search`);
          } else {
            console.warn('API returned unexpected format:', apiResponse);
          }
        }
      } catch (error) {
        console.warn('Could not load events for search:', error.message);
      }
    } finally {
      isLoading = false;
    }
  }

  // Perform search - ONLY events, no channels
  function performSearch(query) {
    if (!query || query.length < 2) {
      searchResults.classList.add('hidden');
      return;
    }

    // Check if it's a URL - don't search, user wants to play directly
    if (query.startsWith('http://') || query.startsWith('https://')) {
      searchResults.classList.add('hidden');
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // Search in events (matches, sports, tournaments, teams)
    const filtered = allEvents.filter(event => {
      const titleMatch = (event.title || '').toLowerCase().includes(lowerQuery);
      const sportMatch = (event.sport || '').toLowerCase().includes(lowerQuery);
      const tournamentMatch = (event.tournament || '').toLowerCase().includes(lowerQuery);
      const homeTeamMatch = (event.home_team || '').toLowerCase().includes(lowerQuery);
      const awayTeamMatch = (event.away_team || '').toLowerCase().includes(lowerQuery);
      
      return titleMatch || sportMatch || tournamentMatch || homeTeamMatch || awayTeamMatch;
    }).slice(0, 10); // Show max 10 results

    console.log(`Search "${query}": found ${filtered.length} events`);
    displayResults(filtered);
  }

  // Display search results - events only with sports icon
  function displayResults(results) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results"><i class="fas fa-search"></i><br>No results found</div>';
      searchResults.classList.remove('hidden');
      return;
    }

    searchResults.innerHTML = results.map((item, index) => `
      <div class="search-result-item" data-index="${index}" data-url="${item.url}">
        <i class="fas fa-futbol search-result-icon"></i>
        <div class="search-result-info">
          <div class="search-result-title">${item.title}</div>
          <div class="search-result-meta">${item.meta}</div>
        </div>
        <i class="fas fa-play"></i>
      </div>
    `).join('');

    searchResults.classList.remove('hidden');
    selectedIndex = -1;

    // Add click handlers
    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.getAttribute('data-url');
        if (url) {
          streamUrlInput.value = url;
          searchResults.classList.add('hidden');
          document.getElementById('load-stream').click();
        }
      });
    });
  }

  // Keyboard navigation
  function handleKeyDown(e) {
    const items = document.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection(items);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      items[selectedIndex].click();
    } else if (e.key === 'Escape') {
      searchResults.classList.add('hidden');
    }
  }

  function updateSelection(items) {
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  // Event listeners
  let debounceTimer;
  streamUrlInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      performSearch(e.target.value);
    }, 300);
  });

  streamUrlInput.addEventListener('keydown', handleKeyDown);

  streamUrlInput.addEventListener('focus', () => {
    if (allEvents.length === 0) {
      loadSearchData();
    }
    if (streamUrlInput.value.length >= 2) {
      performSearch(streamUrlInput.value);
    } else {
      searchResults.classList.add('hidden');
    }
  });

  // Hide results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.stream-input-box')) {
      searchResults.classList.add('hidden');
    }
  });

  // Load data on page load
  loadSearchData();
  });
})();

/* =========================================================
   PATCH: Fixed dropdown (portal) above the player
   ========================================================= */
(function() {
  function positionSearchDropdown() {
    const input = document.getElementById('stream-url');
    const dropdown = document.getElementById('search-results');
    if (!input || !dropdown) return;
    
    // Only position when the dropdown is visible
    if (dropdown.classList.contains('hidden')) return;
    
    const rect = input.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    
    // Fixed position relative to the viewport (portal)
    dropdown.style.position = 'fixed';
    dropdown.style.top = (rect.bottom + 4) + 'px';
    dropdown.style.zIndex = '2147483647';
    
    if (isMobile) {
      dropdown.style.left = rect.left + 'px';
      dropdown.style.width = rect.width + 'px';
      dropdown.style.right = 'auto';
    } else {
      // Desktop: align with the input
      dropdown.style.left = rect.left + 'px';
      dropdown.style.width = rect.width + 'px';
      dropdown.style.right = 'auto';
    }
    
    // Ensure the dropdown is attached to the body (portal)
    if (dropdown.parentElement !== document.body) {
      document.body.appendChild(dropdown);
    }
  }

  function showDropdown() {
    const dropdown = document.getElementById('search-results');
    if (!dropdown) return;
    dropdown.classList.remove('hidden');
    positionSearchDropdown();
  }

  // Event delegation
  document.addEventListener('focus', function(e) {
    if (e.target && e.target.id === 'stream-url') {
      showDropdown();
    }
  }, true);
  
  document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'stream-url') {
      setTimeout(showDropdown, 10);
    }
  });
  
  // Reposition on scroll/resize (capture scroll on any container)
  const scheduleReposition = () => requestAnimationFrame(positionSearchDropdown);
  window.addEventListener('scroll', scheduleReposition, { passive: true });
  document.addEventListener('scroll', scheduleReposition, true);
  window.addEventListener('touchmove', scheduleReposition, { passive: true });
  window.addEventListener('resize', scheduleReposition);
  
  // Click outside to close
  document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('search-results');
    const input = document.getElementById('stream-url');
    if (!dropdown || !input) return;
    
    if (!dropdown.contains(e.target) && e.target !== input) {
      dropdown.classList.add('hidden');
    }
  });
})();
