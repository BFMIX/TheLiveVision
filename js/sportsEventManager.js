// sportsEventManager.js
// Gestion des événements sportifs via la nouvelle API beta.adstrim.ru

document.addEventListener('DOMContentLoaded', () => {
  const eventList = document.getElementById('event-list');
  const sportFilter = document.getElementById('sport-filter');
  const dateFilter = document.getElementById('date-filter');
  const tournamentFilter = document.getElementById('tournament-filter');
  const eventSearch = document.getElementById('event-search');
  const loadingIndicator = document.getElementById('sports-loading');
  const errorMessage = document.getElementById('sports-error');
  let eventsData = [];
  let isLoading = false;

  // Fonction pour charger les événements depuis la nouvelle API
  async function loadEvents(showSkeleton = true) {
    if (isLoading) return;
    isLoading = true;
    
    try {
      // Show skeleton loader instead of old loading indicator
      if (showSkeleton && window.UXEnhancements) {
        loadingIndicator.style.display = 'none';
        window.UXEnhancements.SkeletonLoader.show(eventList, 'events');
      } else {
        loadingIndicator.style.display = 'block';
      }
      
      if (window.UXEnhancements) {
        window.UXEnhancements.ErrorState.hide(errorMessage);
      } else {
        errorMessage.style.display = 'none';
      }

      const response = await fetch('https://beta.adstrim.ru/api/events');
      if (!response.ok) {
        throw new Error('Network error while fetching events.');
      }
      const apiResponse = await response.json();

      if (apiResponse.status !== 'success' || !apiResponse.data) {
        throw new Error('Invalid API response.');
      }

      // Transform API data
      eventsData = apiResponse.data.map(event => {
        // Parse date from timestamp
        const dateObj = new Date(event.timestamp * 1000);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Build match name from home_team vs away_team
        const matchName = event.home_team && event.away_team 
          ? `${event.home_team} vs ${event.away_team}`
          : event.match || 'TBD';

        // Build channels array with proper format
        const channels = event.channels ? event.channels.map(ch => {
          // Build the stream URL using ch.name with proper encoding
          return `https://topembed.pw/channel/${encodeURIComponent(ch.name)}`;
        }) : [];

        return {
          id: event.id,
          date: dateStr,
          unix_timestamp: event.timestamp,
          sport: event.sport || 'Unknown',
          tournament: event.league || 'Unknown',
          match: matchName,
          channels: channels,
          home_team_image: event.home_team_image || '',
          away_team_image: event.away_team_image || '',
          league_image: event.league_image || ''
        };
      });

      console.log(`✅ Loaded ${eventsData.length} events from new API`);

      // Populate filters
      const sports = [...new Set(eventsData.map(event => event.sport))].sort();
      sports.forEach(sport => {
        const option = document.createElement('option');
        option.value = sport;
        option.textContent = sport;
        sportFilter.appendChild(option);
      });

      const dates = [...new Set(eventsData.map(event => event.date))].sort();
      dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateFilter.appendChild(option);
      });

      const tournaments = [...new Set(eventsData.map(event => event.tournament))].sort();
      tournaments.forEach(tournament => {
        const option = document.createElement('option');
        option.value = tournament;
        option.textContent = tournament;
        tournamentFilter.appendChild(option);
      });

      // Display all events initially
      displayEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      eventList.innerHTML = '<tr><td colspan="5">Unable to load events. Please try again later.</td></tr>';
      errorMessage.textContent = 'Unable to load events from API. Please check your connection and try again.';
      errorMessage.style.display = 'block';
    } finally {
      loadingIndicator.style.display = 'none';
    }
  }

  // Display events in table
  function displayEvents(events) {
    eventList.innerHTML = '';
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Function to extract country code from stream URL and return flag emoji
    function getCountryFlag(streamUrl) {
      // Decode URL first (e.g., %5B becomes [, %5D becomes ])
      const decodedUrl = decodeURIComponent(streamUrl);
      
      // Extract country code from URL like: https://topembed.pw/channel/SkySportsNews[UK]
      const countryMatch = decodedUrl.match(/\[([^\]]+)\]$/);
      if (!countryMatch) return '';
      
      const countryCode = countryMatch[1].toUpperCase();
      
      // Map country names/codes to flag emojis
      const countryFlags = {
        'UK': '🇬🇧', 'USA': '🇺🇸', 'CANADA': '🇨🇦', 'FRANCE': '🇫🇷', 'SPAIN': '🇪🇸',
        'GERMANY': '🇩🇪', 'ITALY': '🇮🇹', 'PORTUGAL': '🇵🇹', 'BRAZIL': '🇧🇷', 'ARGENTINA': '🇦🇷',
        'MEXICO': '🇲🇽', 'TURKEY': '🇹🇷', 'NETHERLANDS': '🇳🇱', 'BELGIUM': '🇧🇪', 'POLAND': '🇵🇱',
        'RUSSIA': '🇷🇺', 'GREECE': '🇬🇷', 'ROMANIA': '🇷🇴', 'BULGARIA': '🇧🇬', 'SERBIA': '🇷🇸',
        'CROATIA': '🇭🇷', 'SWEDEN': '🇸🇪', 'NORWAY': '🇳🇴', 'DENMARK': '🇩🇰', 'FINLAND': '🇫🇮',
        'IRELAND': '🇮🇪', 'SCOTLAND': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'WALES': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'AUSTRALIA': '🇦🇺', 'JAPAN': '🇯🇵',
        'KOREA': '🇰🇷', 'CHINA': '🇨🇳', 'INDIA': '🇮🇳', 'PAKISTAN': '🇵🇰', 'UAE': '🇦🇪',
        'SAUDI ARABIA': '🇸🇦', 'QATAR': '🇶🇦', 'EGYPT': '🇪🇬', 'SOUTH AFRICA': '🇿🇦', 'NIGERIA': '🇳🇬',
        'ALGERIA': '🇩🇿', 'MOROCCO': '🇲🇦', 'TUNISIA': '🇹🇳', 'ISRAEL': '🇮🇱', 'CZECH': '🇨🇿',
        'SLOVAKIA': '🇸🇰', 'HUNGARY': '🇭🇺', 'AUSTRIA': '🇦🇹', 'SWITZERLAND': '🇨🇭', 'ALBANIA': '🇦🇱',
        'CHILE': '🇨🇱', 'COLOMBIA': '🇨🇴', 'PERU': '🇵🇪', 'VENEZUELA': '🇻🇪',
        'URUGUAY': '🇺🇾', 'ECUADOR': '🇪🇨', 'BOLIVIA': '🇧🇴', 'PARAGUAY': '🇵🇾', 'COSTA RICA': '🇨🇷',
        'PANAMA': '🇵🇦', 'JAMAICA': '🇯🇲', 'HONDURAS': '🇭🇳', 'EL SALVADOR': '🇸🇻', 'GUATEMALA': '🇬🇹',
        'INTERNATIONAL': '🌍', 'WORLD': '🌎', 'GLOBAL': '🌏'
      };
      
      // Return flag if found, otherwise empty string (no globe fallback)
      return countryFlags[countryCode] || '';
    }
    
    events.forEach(event => {
      // Parse date
      const dateParts = event.date.split('-');
      const year = dateParts[0];
      const monthIndex = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      const formattedDate = `${day} ${monthNames[monthIndex]} ${year}`;
      
      // Parse time
      const dateObj = new Date(event.unix_timestamp * 1000);
      const time = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="date-time-cell">
          <div class="date-line"><i class="fas fa-calendar-alt"></i> ${formattedDate}</div>
          <div class="time-line"><i class="fas fa-clock"></i> ${time}</div>
        </td>
        <td class="sport-cell">${event.sport}</td>
        <td class="match-cell">
          <div class="match-name"><i class="fas fa-futbol"></i> ${event.match}</div>
          <div class="match-tournament"><i class="fas fa-trophy"></i> ${event.tournament}</div>
        </td>
        <td>
          <div class="stream-buttons">
            ${event.channels.map(channel => {
              const flag = getCountryFlag(channel);
              const flagHtml = flag ? `<span class="flag-emoji">${flag}</span> ` : '';
              return `<button class="play-button stream-btn" onclick="loadStream('${channel}')" oncontextmenu="copyStreamLink(event, '${channel}')" data-stream-url="${channel}" title="Right-click to copy link">${flagHtml}Play</button>`;
      // Data-labels for mobile card layout (CSS uses td[data-label])
      const labels = ['DATE & TIME', 'SPORT', 'MATCH & TOURNAMENT', 'STREAM LINK'];
      row.querySelectorAll('td').forEach((td, i) => {
        td.setAttribute('data-label', labels[i] || '');
      });

            }).join('')}
          </div>
        </td>
      `;
      eventList.appendChild(row);
    });
  }

  // Filter events
  function filterEvents() {
    const selectedSport = sportFilter.value;
    const selectedDate = dateFilter.value;
    const selectedTournament = tournamentFilter.value;
    const searchQuery = eventSearch.value.toLowerCase();

    const filteredEvents = eventsData.filter(event => {
      const matchesSport = selectedSport ? event.sport === selectedSport : true;
      const matchesDate = selectedDate ? event.date === selectedDate : true;
      const matchesTournament = selectedTournament ? event.tournament === selectedTournament : true;
      const matchesSearch = event.match.toLowerCase().includes(searchQuery) || 
                           event.tournament.toLowerCase().includes(searchQuery);
      return matchesSport && matchesDate && matchesTournament && matchesSearch;
    });

    displayEvents(filteredEvents);
  }

  // Event listeners for filters
  if (sportFilter) sportFilter.addEventListener('change', filterEvents);
  if (dateFilter) dateFilter.addEventListener('change', filterEvents);
  if (tournamentFilter) tournamentFilter.addEventListener('change', filterEvents);
  if (eventSearch) eventSearch.addEventListener('input', filterEvents);

  // Load events on page load
  loadEvents();
});

// Global function to copy stream link on right-click
window.copyStreamLink = function(event, streamUrl) {
  event.preventDefault(); // Prevent default context menu
  
  // Copy to clipboard
  navigator.clipboard.writeText(streamUrl).then(() => {
    // Show success toast
    showToast('Link copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Failed to copy link:', err);
    showToast('Failed to copy link', 'error');
  });
  
  return false;
};

// Toast notification function
function showToast(message, type = 'info') {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Hide and remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
