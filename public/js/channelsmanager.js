// channelsManager.js
// Channel list manager using beta.adstrim.ru (API) and viewembed.ru (player)

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const channelList = document.getElementById('channel-list');
    const countryFilter = document.getElementById('country-filter');
    const channelSearch = document.getElementById('channel-search');
    const loadingIndicator = document.getElementById('channels-loading');
    const errorMessage = document.getElementById('channels-error');

    const API_BASE = window.API_BASE || 'https://beta.adstrim.ru';
    const EMBED_BASE = window.EMBED_BASE || 'https://viewembed.ru';

    window.API_BASE = API_BASE;
    window.EMBED_BASE = EMBED_BASE;

    let channelsData = [];
    let isLoading = false;

    const flagCache = new Map();

    function normalizeChannelValue(value) {
      if (!value) return '';
      return String(value).trim();
    }

    function buildChannelUrl(value) {
      const cleaned = normalizeChannelValue(value);
      if (!cleaned) return '';
      if (/^https?:\/\//i.test(cleaned)) {
        if (/^https?:\/\/beta\.adstrim\.ru/i.test(cleaned)) {
          return cleaned.replace(/^(https?:\/\/)beta\.adstrim\.ru/i, '$1viewembed.ru');
        }
        return cleaned;
      }
      const path = cleaned.replace(/^\/+/, '');
      if (path.toLowerCase().startsWith('channel/')) {
        const slug = path.slice('channel/'.length);
        return `${EMBED_BASE}/channel/${encodeURIComponent(slug)}`;
      }
      return `${EMBED_BASE}/channel/${encodeURIComponent(path)}`;
    }

    function getFlag(countryName) {
      if (!countryName) return '🌍';
      if (flagCache.has(countryName)) return flagCache.get(countryName);

      const flag = window.getCountryFlag ? window.getCountryFlag(countryName) : '🌍';
      flagCache.set(countryName, flag);
      return flag;
    }

    function extractCountry(channelName) {
      const match = channelName.match(/\[([^\]]+)\]$/);
      return match ? match[1] : 'International';
    }

    function cleanChannelName(channelName) {
      return channelName.replace(/\[[^\]]+\]$/, '').trim();
    }

    function buildFlagOption(option) {
      const item = document.createElement('div');
      item.className = 'custom-select-option';
      item.dataset.value = option.value;

      if (option.flag) {
        const flagSpan = document.createElement('span');
        flagSpan.className = 'select-emoji';
        flagSpan.textContent = option.flag;
        item.appendChild(flagSpan);
      } else {
        const fallback = document.createElement('span');
        fallback.className = 'select-fallback';
        fallback.innerHTML = '<i class="fas fa-globe"></i>';
        item.appendChild(fallback);
      }

      const label = document.createElement('span');
      label.className = 'custom-select-label';
      label.textContent = option.label;
      item.appendChild(label);

      return item;
    }

    function enhanceSelectWithFlags(selectEl, options, placeholderLabel) {
      if (!selectEl) return;

      const parent = selectEl.parentElement;
      if (!parent) return;

      const existing = parent.querySelector(`.custom-select[data-for="${selectEl.id}"]`);
      if (existing) existing.remove();

      selectEl.classList.add('select-hidden');

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select';
      wrapper.dataset.for = selectEl.id;

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'custom-select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');

      const triggerIcon = document.createElement('span');
      triggerIcon.className = 'custom-select-icon';

      const triggerText = document.createElement('span');
      triggerText.className = 'custom-select-text';
      triggerText.textContent = placeholderLabel;

      const triggerChevron = document.createElement('i');
      triggerChevron.className = 'fas fa-chevron-down';

      trigger.appendChild(triggerIcon);
      trigger.appendChild(triggerText);
      trigger.appendChild(triggerChevron);

      const menu = document.createElement('div');
      menu.className = 'custom-select-menu';
      menu.setAttribute('role', 'listbox');

      options.forEach((option) => {
        const optionEl = buildFlagOption(option);
        optionEl.addEventListener('click', () => {
          selectEl.value = option.value;
          selectEl.dispatchEvent(new Event('change'));
          updateTrigger(option);
          wrapper.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        });
        menu.appendChild(optionEl);
      });

      function updateTrigger(option) {
        triggerIcon.innerHTML = '';
        if (option.flag) {
          const flagSpan = document.createElement('span');
          flagSpan.className = 'select-emoji';
          flagSpan.textContent = option.flag;
          triggerIcon.appendChild(flagSpan);
        } else {
          const fallback = document.createElement('span');
          fallback.className = 'select-fallback';
          fallback.innerHTML = '<i class="fas fa-globe"></i>';
          triggerIcon.appendChild(fallback);
        }
        triggerText.textContent = option.label;
      }

      updateTrigger(options[0]);

      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const isOpen = wrapper.classList.toggle('open');
        trigger.setAttribute('aria-expanded', String(isOpen));
      });

      document.addEventListener('click', (event) => {
        if (!wrapper.contains(event.target)) {
          wrapper.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });

      wrapper.appendChild(trigger);
      wrapper.appendChild(menu);
      parent.appendChild(wrapper);

      const selectedOption = options.find((option) => option.value === selectEl.value) || options[0];
      updateTrigger(selectedOption);
    }

    async function loadChannels(showSkeleton = true) {
      if (isLoading) return;
      isLoading = true;

      try {
        if (showSkeleton && window.UXEnhancements) {
          loadingIndicator.style.display = 'none';
          window.UXEnhancements.SkeletonLoader.show(channelList, 'channels');
        } else {
          loadingIndicator.style.display = 'block';
        }

        if (window.UXEnhancements) {
          window.UXEnhancements.ErrorState.hide(errorMessage);
        } else {
          errorMessage.style.display = 'none';
        }

        const response = await fetch(`${API_BASE}/api/channels`);
        if (!response.ok) {
          throw new Error('Network error while fetching channels.');
        }
        const apiResponse = await response.json();

        if (apiResponse.status !== 'success' || !apiResponse.channels) {
          throw new Error('Invalid API response.');
        }

        channelsData = apiResponse.channels
          .filter((ch) => ch.show_on_livetv === true && ch.hide === false)
          .map((ch) => {
            const canonicalName = ch.name || ch.title || ch.link || '';
            const fullName = canonicalName;
            const country = ch.country || extractCountry(fullName);
            return {
              name: cleanChannelName(fullName),
              fullName,
              url: buildChannelUrl(canonicalName),
              country,
              image: ch.image || ''
            };
          });

        const countries = [...new Set(channelsData.map((ch) => ch.country))].sort();
        countryFilter.innerHTML = '<option value="">All Countries</option>';
        countries.forEach((country) => {
          const option = document.createElement('option');
          option.value = country;
          option.textContent = country;
          countryFilter.appendChild(option);
        });

        const countryOptions = [
          { value: '', label: 'All Countries', flag: '' },
          ...countries.map((country) => ({
            value: country,
            label: country,
            flag: getFlag(country)
          }))
        ];

        enhanceSelectWithFlags(countryFilter, countryOptions, 'All Countries');

        displayChannels(channelsData);
      } catch (error) {
        console.error('Error loading channels:', error);

        if (window.UXEnhancements) {
          channelList.innerHTML = '';
          window.UXEnhancements.ErrorState.show(
            errorMessage,
            'Unable to load channels. Please check your connection and try again.',
            () => { loadChannels(true); }
          );
        } else {
          channelList.innerHTML = '<div class="empty-message">Unable to load channels. Please try again later.</div>';
          errorMessage.textContent = 'Unable to load channels from the API. Please check your connection and try again.';
          errorMessage.style.display = 'block';
        }
      } finally {
        loadingIndicator.style.display = 'none';
        isLoading = false;
      }
    }

    function displayChannels(channels) {
      channelList.innerHTML = '';

      if (channels.length === 0) {
        if (window.UXEnhancements) {
          window.UXEnhancements.EmptyState.showInContainer(
            channelList,
            'No channels found. Try adjusting your search.'
          );
        } else {
          channelList.innerHTML = '<div class="empty-message">No channels found.</div>';
        }
        return;
      }

      channels.forEach((channel, index) => {
        const cardId = `channel-card-${index}`;
        const previewId = `${cardId}-preview`;
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
          <div class="channel-card-shell">
            <div class="channel-card-main">
              <div class="channel-card-header">
                <span class="country-flag flag-icon">${window.getCountryFlag ? window.getCountryFlag(channel.country) : '🌍'}</span>
                <span class="channel-name">${channel.name}</span>
              </div>
              <div class="channel-card-actions">
                <button
                  class="channel-action-btn channel-action-preview"
                  type="button"
                  aria-expanded="false"
                  aria-controls="${previewId}"
                >
                  <span class="channel-action-text">Preview</span>
                  <span class="channel-action-icon" aria-hidden="true"><i class="fas fa-chevron-down"></i></span>
                </button>
                <button class="channel-action-btn channel-action-play" type="button">
                  <span class="channel-action-icon" aria-hidden="true"><i class="fas fa-play"></i></span>
                  <span class="channel-action-text">Play</span>
                </button>
              </div>
            </div>
            <div class="channel-card-body">
              <div class="channel-preview-panel" id="${previewId}" hidden>
                <div class="channel-preview-frame" aria-hidden="true">
                  <iframe
                    class="channel-preview-iframe"
                    src="${channel.url}"
                    title="${channel.name} preview"
                    loading="lazy"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowfullscreen
                    referrerpolicy="no-referrer"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        `;
        channelList.appendChild(card);

        const previewButton = card.querySelector('.channel-action-preview');
        const playButton = card.querySelector('.channel-action-play');
        const previewPanel = card.querySelector('.channel-preview-panel');

        if (previewButton && previewPanel) {
          previewButton.addEventListener('click', () => {
            const isExpanded = card.classList.toggle('is-expanded');
            previewButton.setAttribute('aria-expanded', String(isExpanded));
            previewPanel.hidden = !isExpanded;
            const label = previewButton.querySelector('.channel-action-text');
            if (label) label.textContent = isExpanded ? 'Close Preview' : 'Preview';
          });
        }

        if (playButton) {
          playButton.addEventListener('click', () => {
            if (typeof window.loadStream === 'function') {
              window.loadStream(channel.url);
            }
          });
        }
      });
    }

    function filterChannels() {
      const selectedCountry = countryFilter.value;
      const searchQuery = channelSearch.value.toLowerCase();

      const filteredChannels = channelsData.filter((channel) => {
        const matchesCountry = selectedCountry ? channel.country === selectedCountry : true;
        const matchesSearch = channel.name.toLowerCase().includes(searchQuery) ||
          channel.fullName.toLowerCase().includes(searchQuery);
        return matchesCountry && matchesSearch;
      });

      displayChannels(filteredChannels);
    }

    if (countryFilter) countryFilter.addEventListener('change', filterChannels);
    if (channelSearch) channelSearch.addEventListener('input', filterChannels);

    if (window.UXEnhancements && window.UXEnhancements.isMobile()) {
      setTimeout(() => {
        window.UXEnhancements.PullToRefresh.init('page-channels', async () => {
          await loadChannels(false);
          filterChannels();
        });
      }, 500);
    }

    loadChannels();
  });
})();
