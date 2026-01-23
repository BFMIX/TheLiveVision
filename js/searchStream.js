// searchStream.js
// Real-time search for sports events ONLY - Using new beta.adstrim.ru API

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
        const eventsResponse = await fetch('https://beta.adstrim.ru/api/events', {
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
              
              // Build match name
              const matchName = event.home_team && event.away_team 
                ? `${event.home_team} vs ${event.away_team}`
                : 'TBD';

              // Get first channel URL
              const channelUrl = event.channels && event.channels.length > 0 
                ? `https://topembed.pw/channel/${event.channels[0].link || event.channels[0].name}`
                : '';

              return {
                type: 'event',
                title: matchName,
                meta: `${event.sport || 'Sport'} • ${event.league || 'League'} • ${dateStr} ${timeStr}`,
                url: channelUrl,
                sport: event.sport || '',
                tournament: event.league || '',
                match: matchName,
                home_team: event.home_team || '',
                away_team: event.away_team || '',
                date: dateStr,
                time: timeStr,
                channels: event.channels || []
              };
            });
            console.log(`✅ Loaded ${allEvents.length} sports events for search`);
          } else {
            console.warn('⚠️ API returned unexpected format:', apiResponse);
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not load events for search:', error.message);
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

    console.log(`🔍 Search "${query}": found ${filtered.length} events`);
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
