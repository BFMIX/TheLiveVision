// searchStream.js
// Real-time search for sports events ONLY

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

  // Load events data ONLY from API
  async function loadSearchData() {
    if (isLoading) return;
    isLoading = true;

    try {
      const eventsController = new AbortController();
      const eventsTimeout = setTimeout(() => eventsController.abort(), 15000);
      
      try {
        const eventsResponse = await fetch('https://topembed.pw/api.php?format=json', {
          signal: eventsController.signal
        });
        clearTimeout(eventsTimeout);
        
        if (eventsResponse.ok) {
          const apiData = await eventsResponse.json();
          
          // The API returns { events: { "date": [...events] } } structure
          // Parse correctly based on the sportsEventManager.js logic
          if (apiData && apiData.events) {
            allEvents = [];
            for (const dateKey in apiData.events) {
              apiData.events[dateKey].forEach(event => {
                // Each event has multiple channels, create one search entry per event
                const date = new Date(event.unix_timestamp * 1000);
                const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                
                allEvents.push({
                  type: 'event',
                  title: event.match || 'Match',
                  meta: `${event.sport || 'Sport'} • ${event.tournament || 'Tournament'} • ${dateKey} ${timeStr}`,
                  url: event.channels && event.channels.length > 0 ? event.channels[0] : '',
                  sport: event.sport || '',
                  tournament: event.tournament || '',
                  match: event.match || '',
                  date: dateKey,
                  time: timeStr,
                  channels: event.channels || []
                });
              });
            }
            console.log(`✅ Loaded ${allEvents.length} sports events for search`);
          } else {
            console.warn('⚠️ API returned unexpected format:', apiData);
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
    
    // Search ONLY in events (matches, sports, tournaments)
    const filtered = allEvents.filter(event => {
      const titleMatch = (event.title || '').toLowerCase().includes(lowerQuery);
      const sportMatch = (event.sport || '').toLowerCase().includes(lowerQuery);
      const tournamentMatch = (event.tournament || '').toLowerCase().includes(lowerQuery);
      const matchMatch = (event.match || '').toLowerCase().includes(lowerQuery);
      
      return titleMatch || sportMatch || tournamentMatch || matchMatch;
    }).slice(0, 10); // Show max 10 results

    console.log(`🔍 Search "${query}": found ${filtered.length} events`);
    displayResults(filtered);
  }

  // Display search results - events only with sports icon
  function displayResults(results) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results"><i class="fas fa-search"></i><br>Aucun résultat trouvé</div>';
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
  function navigateResults(direction) {
    const items = document.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    // Remove active class
    items.forEach(item => item.classList.remove('active'));

    // Update index
    if (direction === 'down') {
      selectedIndex = (selectedIndex + 1) % items.length;
    } else if (direction === 'up') {
      selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
    }

    // Add active class
    items[selectedIndex].classList.add('active');
    items[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // Select active result
  function selectActiveResult() {
    const activeItem = document.querySelector('.search-result-item.active');
    if (activeItem) {
      activeItem.click();
      return true;
    }
    return false;
  }

  // Event listeners
  streamUrlInput.addEventListener('input', (e) => {
    performSearch(e.target.value);
  });

  streamUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateResults('down');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateResults('up');
    } else if (e.key === 'Enter') {
      if (!selectActiveResult()) {
        // If no search result selected, proceed with URL load
        document.getElementById('load-stream').click();
      }
    } else if (e.key === 'Escape') {
      searchResults.classList.add('hidden');
      selectedIndex = -1;
    }
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!streamUrlInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });

  // Load data on page load
  loadSearchData();
});
