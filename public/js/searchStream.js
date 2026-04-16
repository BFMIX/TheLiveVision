// searchStream.js
// Real-time search for sports events using beta.adstrim.ru (API) and viewembed.ru (player)

(function () {
  'use strict';

  var buildChannelUrl = window.SharedUtils.buildChannelUrl;

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
      searchResults.textContent = '';
      const noResults = document.createElement('div');
      noResults.className = 'search-no-results';
      noResults.appendChild(Sanitize.createIcon('fa-search'));
      noResults.appendChild(document.createElement('br'));
      noResults.appendChild(document.createTextNode('No results found'));
      searchResults.appendChild(noResults);
      searchResults.classList.remove('hidden');
      return;
    }

    searchResults.textContent = '';
    results.forEach(function (item, index) {
      const row = document.createElement('div');
      row.className = 'search-result-item';
      row.dataset.index = index;
      row.dataset.url = Sanitize.sanitizeURL(item.url);

      const iconEl = Sanitize.createIcon('fa-futbol');
      iconEl.classList.add('search-result-icon');
      row.appendChild(iconEl);

      const info = document.createElement('div');
      info.className = 'search-result-info';
      const title = document.createElement('div');
      title.className = 'search-result-title';
      title.textContent = item.title;
      const meta = document.createElement('div');
      meta.className = 'search-result-meta';
      meta.textContent = item.meta;
      info.appendChild(title);
      info.appendChild(meta);
      row.appendChild(info);

      row.appendChild(Sanitize.createIcon('fa-play'));

      row.addEventListener('click', function () {
        var url = this.dataset.url;
        if (url) {
          streamUrlInput.value = url;
          searchResults.classList.add('hidden');
          document.getElementById('load-stream').click();
        }
      });

      searchResults.appendChild(row);
    });

    searchResults.classList.remove('hidden');
    selectedIndex = -1;
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

/* =========================================================
   HEADER GLOBAL SEARCH: events + channels
   ========================================================= */
(function () {
  'use strict';

  var buildChannelUrl = window.SharedUtils.buildChannelUrl;
  var extractCountry = window.SharedUtils.extractCountry;
  var cleanChannelName = window.SharedUtils.cleanChannelName;

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('header-global-search');
    const results = document.getElementById('header-search-results');

    if (!input || !results) return;

    let allItems = [];
    let selectedIndex = -1;
    let loading = false;
    let loaded = false;

    function renderEmpty(message) {
      results.textContent = '';
      const el = document.createElement('div');
      el.className = 'header-search-empty';
      el.textContent = message;
      results.appendChild(el);
      results.classList.remove('hidden');
    }

    function hideResults() {
      selectedIndex = -1;
      results.classList.add('hidden');
    }

    async function loadData() {
      if (loading || loaded) return;
      loading = true;

      try {
        const [eventsResponse, channelsResponse] = await Promise.allSettled([
          fetch(`${API_BASE}/api/events`),
          fetch(`${API_BASE}/api/channels`)
        ]);

        const items = [];

        if (eventsResponse.status === 'fulfilled' && eventsResponse.value.ok) {
          const eventPayload = await eventsResponse.value.json();
          if (eventPayload.status === 'success' && Array.isArray(eventPayload.data)) {
            eventPayload.data.forEach((event) => {
              const dateObj = new Date(event.timestamp * 1000);
              const timeStr = dateObj.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
              });
              const dateStr = dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short'
              });

              const sportName = event.sport || event.sport_name || event.sportName || 'Sport';
              const leagueName =
                event.league || event.tournament || event.league_name || event.leagueName || 'Tournament';
              const homeTeam = event.home_team || event.homeTeam || event.home || '';
              const awayTeam = event.away_team || event.awayTeam || event.away || '';
              const title =
                homeTeam && awayTeam
                  ? `${homeTeam} vs ${awayTeam}`
                  : event.match || event.name || event.title || 'Event';

              items.push({
                type: 'event',
                title,
                meta: `${sportName} - ${leagueName} - ${dateStr} ${timeStr}`,
                queryValue: title,
                icon: 'fa-futbol'
              });
            });
          }
        }

        if (channelsResponse.status === 'fulfilled' && channelsResponse.value.ok) {
          const channelPayload = await channelsResponse.value.json();
          if (channelPayload.status === 'success' && Array.isArray(channelPayload.channels)) {
            channelPayload.channels
              .filter((ch) => ch.show_on_livetv === true && ch.hide === false)
              .forEach((channel) => {
                const canonicalName = channel.name || channel.title || channel.link || '';
                const country = channel.country || extractCountry(canonicalName);
                const title = cleanChannelName(canonicalName);
                items.push({
                  type: 'channel',
                  title,
                  meta: country,
                  queryValue: title,
                  url: buildChannelUrl(canonicalName),
                  icon: 'fa-tv'
                });
              });
          }
        }

        allItems = items;
        loaded = true;
      } catch (error) {
        console.error('Header search failed to load:', error);
      } finally {
        loading = false;
      }
    }

    function updateSelection(items) {
      items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedIndex);
      });
    }

    function navigateToItem(item) {
      hideResults();

      if (item.type === 'event') {
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('page-football');
        }
        const eventSearch = document.getElementById('event-search');
        if (eventSearch) {
          eventSearch.value = item.queryValue;
          eventSearch.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else {
        if (typeof window.navigateTo === 'function') {
          window.navigateTo('page-channels');
        }
        const channelSearch = document.getElementById('channel-search');
        if (channelSearch) {
          channelSearch.value = item.queryValue;
          channelSearch.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }

    function displayResults(list) {
      if (!list.length) {
        renderEmpty('No results found');
        return;
      }

      results.textContent = '';
      list.forEach(function (item, index) {
        const row = document.createElement('div');
        row.className = 'header-search-result-item';
        row.dataset.index = index;

        const iconWrap = document.createElement('span');
        iconWrap.className = 'header-result-icon';
        iconWrap.appendChild(Sanitize.createIcon(item.icon));
        row.appendChild(iconWrap);

        const copy = document.createElement('div');
        copy.className = 'header-result-copy';
        const titleEl = document.createElement('div');
        titleEl.className = 'header-result-title';
        titleEl.textContent = item.title;
        const metaEl = document.createElement('div');
        metaEl.className = 'header-result-meta';
        metaEl.textContent = item.meta;
        copy.appendChild(titleEl);
        copy.appendChild(metaEl);
        row.appendChild(copy);

        const typeEl = document.createElement('span');
        typeEl.className = 'header-result-type';
        typeEl.textContent = item.type;
        row.appendChild(typeEl);

        row.addEventListener('click', function () {
          navigateToItem(item);
        });

        results.appendChild(row);
      });

      selectedIndex = -1;
      results.classList.remove('hidden');
    }

    function search(query) {
      const trimmed = String(query || '').trim();
      if (trimmed.length < 2) {
        hideResults();
        return;
      }

      const lower = trimmed.toLowerCase();
      const filtered = allItems
        .filter((item) => {
          return item.title.toLowerCase().includes(lower) || item.meta.toLowerCase().includes(lower);
        })
        .slice(0, 8);

      displayResults(filtered);
    }

    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => search(input.value), 180);
    });

    input.addEventListener('focus', async () => {
      await loadData();
      if (input.value.trim().length >= 2) {
        search(input.value);
      }
    });

    input.addEventListener('keydown', (event) => {
      const items = Array.from(results.querySelectorAll('.header-search-result-item'));
      if (!items.length) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelection(items);
      } else if (event.key === 'Enter' && selectedIndex >= 0) {
        event.preventDefault();
        const chosen = items[selectedIndex];
        if (chosen) chosen.click();
      } else if (event.key === 'Escape') {
        hideResults();
      }
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.header-search')) {
        hideResults();
      }
    });

    loadData();
  });
})();
