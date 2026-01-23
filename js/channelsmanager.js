// channelsManager.js
// Gestion des chaînes via la nouvelle API beta.adstrim.ru

document.addEventListener('DOMContentLoaded', () => {
  const channelList = document.getElementById('channel-list');
  const countryFilter = document.getElementById('country-filter');
  const channelSearch = document.getElementById('channel-search');
  const loadingIndicator = document.getElementById('channels-loading');
  const errorMessage = document.getElementById('channels-error');
  let channelsData = [];

  // Function to extract country from channel name (e.g., "SkySportsNews[UK]" -> "UK")
  function extractCountry(channelName) {
    const match = channelName.match(/\[([^\]]+)\]$/);
    return match ? match[1] : 'International';
  }

  // Function to clean channel name (remove country tag)
  function cleanChannelName(channelName) {
    return channelName.replace(/\[[^\]]+\]$/, '').trim();
  }

  // Load channels from new API
  async function loadChannels() {
    try {
      loadingIndicator.style.display = 'block';
      errorMessage.style.display = 'none';

      const response = await fetch('https://beta.adstrim.ru/api/channels');
      if (!response.ok) {
        throw new Error('Network error while fetching channels.');
      }
      const apiResponse = await response.json();

      if (apiResponse.status !== 'success' || !apiResponse.channels) {
        throw new Error('Invalid API response.');
      }

      // Transform API data - only show channels with show_on_livetv = true and hide = false
      channelsData = apiResponse.channels
        .filter(ch => ch.show_on_livetv === true && ch.hide === false)
        .map(ch => {
          const country = extractCountry(ch.name);
          return {
            name: cleanChannelName(ch.name),
            fullName: ch.name,
            url: `https://topembed.pw/channel/${encodeURIComponent(ch.name)}`,
            country: country,
            image: ch.image || ''
          };
        });

      console.log(`✅ Loaded ${channelsData.length} channels from new API`);

      // Populate country filter
      const countries = [...new Set(channelsData.map(ch => ch.country))].sort();
      countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
      });

      // Display all channels
      displayChannels(channelsData);
    } catch (error) {
      console.error('Error loading channels:', error);
      channelList.innerHTML = '<tr><td colspan="3">Unable to load channels. Please try again later.</td></tr>';
      errorMessage.textContent = 'Unable to load channels from API. Please check your connection and try again.';
      errorMessage.style.display = 'block';
    } finally {
      loadingIndicator.style.display = 'none';
    }
  }

  // Display channels in table
  function displayChannels(channels) {
    channelList.innerHTML = '';
    channels.forEach(channel => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="channel-name-with-flag">
            <span class="country-flag flag-icon">${window.getCountryFlag ? window.getCountryFlag(channel.country) : '🌍'}</span>
            ${channel.name}
          </div>
        </td>
        <td>
          <div class="channel-link-container">
            <input type="text" class="channel-link-input" value="${channel.url}" readonly>
            <button class="channel-link-copy channel-btn">Copy</button>
          </div>
        </td>
        <td>
          <button class="play-button channel-btn" onclick="loadStream('${channel.url}')">Play</button>
        </td>
      `;
      // Data-labels for mobile card layout (CSS uses td[data-label])
      const labels = ['CHANNEL NAME', 'CHANNEL LINK', 'STREAM LINK'];
      row.querySelectorAll('td').forEach((td, i) => {
        td.setAttribute('data-label', labels[i] || '');
      });

      channelList.appendChild(row);
    });

    // Add copy functionality
    document.querySelectorAll('.channel-link-copy').forEach(button => {
      button.addEventListener('click', function() {
        const input = this.parentElement.querySelector('.channel-link-input');
        input.select();
        document.execCommand('copy');
        
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        this.classList.add('copied');
        
        setTimeout(() => {
          this.textContent = originalText;
          this.classList.remove('copied');
        }, 2000);
      });
    });
  }

  // Filter channels
  function filterChannels() {
    const selectedCountry = countryFilter.value;
    const searchQuery = channelSearch.value.toLowerCase();

    const filteredChannels = channelsData.filter(channel => {
      const matchesCountry = selectedCountry ? channel.country === selectedCountry : true;
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery) ||
                           channel.fullName.toLowerCase().includes(searchQuery);
      return matchesCountry && matchesSearch;
    });

    displayChannels(filteredChannels);
  }

  // Event listeners
  if (countryFilter) countryFilter.addEventListener('change', filterChannels);
  if (channelSearch) channelSearch.addEventListener('input', filterChannels);

  // Load channels on page load
  loadChannels();
});
