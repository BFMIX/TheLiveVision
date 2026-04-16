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

    var buildChannelUrl = window.SharedUtils.buildChannelUrl;
    var extractCountry = window.SharedUtils.extractCountry;
    var cleanChannelName = window.SharedUtils.cleanChannelName;

    const API_BASE = window.API_BASE;

    let channelsData = [];
    let isLoading = false;

    const flagCache = new Map();

    function getFlag(countryName) {
      if (!countryName) return '🌍';
      if (flagCache.has(countryName)) return flagCache.get(countryName);

      const flag = window.getCountryFlag ? window.getCountryFlag(countryName) : '🌍';
      flagCache.set(countryName, flag);
      return flag;
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
        fallback.appendChild(Sanitize.createIcon('fa-globe'));
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
        triggerIcon.textContent = '';
        if (option.flag) {
          const flagSpan = document.createElement('span');
          flagSpan.className = 'select-emoji';
          flagSpan.textContent = option.flag;
          triggerIcon.appendChild(flagSpan);
        } else {
          const fallback = document.createElement('span');
          fallback.className = 'select-fallback';
          fallback.appendChild(Sanitize.createIcon('fa-globe'));
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
          channelList.textContent = '';
          const errDiv = document.createElement('div');
          errDiv.className = 'empty-message';
          errDiv.textContent = 'Unable to load channels. Please try again later.';
          channelList.appendChild(errDiv);
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
          channelList.textContent = '';
          const noChMsg = document.createElement('div');
          noChMsg.className = 'empty-message';
          noChMsg.textContent = 'No channels found.';
          channelList.appendChild(noChMsg);
        }
        return;
      }

      channels.forEach((channel, index) => {
        const cardId = 'channel-card-' + index;
        const previewId = cardId + '-preview';
        const safeUrl = Sanitize.sanitizeURL(channel.url);

        const card = document.createElement('div');
        card.className = 'channel-card';

        const shell = document.createElement('div');
        shell.className = 'channel-card-shell';

        // Main
        const main = document.createElement('div');
        main.className = 'channel-card-main';

        // Header
        const headerEl = document.createElement('div');
        headerEl.className = 'channel-card-header';
        const flagSpan = document.createElement('span');
        flagSpan.className = 'country-flag flag-icon';
        flagSpan.textContent = window.getCountryFlag ? window.getCountryFlag(channel.country) : '\u{1F30D}';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'channel-name';
        nameSpan.textContent = channel.name;
        headerEl.appendChild(flagSpan);
        headerEl.appendChild(nameSpan);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'channel-card-actions';

        const previewButton = document.createElement('button');
        previewButton.className = 'channel-action-btn channel-action-preview';
        previewButton.type = 'button';
        previewButton.setAttribute('aria-expanded', 'false');
        previewButton.setAttribute('aria-controls', previewId);
        const previewText = document.createElement('span');
        previewText.className = 'channel-action-text';
        previewText.textContent = 'Preview';
        const previewIcon = document.createElement('span');
        previewIcon.className = 'channel-action-icon';
        previewIcon.setAttribute('aria-hidden', 'true');
        previewIcon.appendChild(Sanitize.createIcon('fa-chevron-down'));
        previewButton.appendChild(previewText);
        previewButton.appendChild(previewIcon);

        const playButton = document.createElement('button');
        playButton.className = 'channel-action-btn channel-action-play';
        playButton.type = 'button';
        const playIcon = document.createElement('span');
        playIcon.className = 'channel-action-icon';
        playIcon.setAttribute('aria-hidden', 'true');
        playIcon.appendChild(Sanitize.createIcon('fa-play'));
        const playText = document.createElement('span');
        playText.className = 'channel-action-text';
        playText.textContent = 'Play';
        playButton.appendChild(playIcon);
        playButton.appendChild(playText);

        actions.appendChild(previewButton);
        actions.appendChild(playButton);
        main.appendChild(headerEl);
        main.appendChild(actions);

        // Body with preview panel
        const bodyEl = document.createElement('div');
        bodyEl.className = 'channel-card-body';
        const previewPanel = document.createElement('div');
        previewPanel.className = 'channel-preview-panel';
        previewPanel.id = previewId;
        previewPanel.hidden = true;
        const previewFrame = document.createElement('div');
        previewFrame.className = 'channel-preview-frame';
        previewFrame.setAttribute('aria-hidden', 'true');
        const iframe = document.createElement('iframe');
        iframe.className = 'channel-preview-iframe';
        iframe.dataset.src = safeUrl;
        iframe.title = (channel.name || '') + ' preview';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'no-referrer';
        previewFrame.appendChild(iframe);
        previewPanel.appendChild(previewFrame);
        bodyEl.appendChild(previewPanel);

        shell.appendChild(main);
        shell.appendChild(bodyEl);
        card.appendChild(shell);
        channelList.appendChild(card);

        // Event listeners
        previewButton.addEventListener('click', function () {
          const isExpanded = card.classList.toggle('is-expanded');
          previewButton.setAttribute('aria-expanded', String(isExpanded));
          previewPanel.hidden = !isExpanded;
          if (isExpanded) {
            if (!iframe.src) {
              iframe.src = iframe.dataset.src || '';
            }
          } else {
            iframe.src = '';
          }
          previewText.textContent = isExpanded ? 'Close Preview' : 'Preview';
        });

        playButton.addEventListener('click', function () {
          if (typeof window.loadStream === 'function') {
            window.loadStream(safeUrl);
          }
        });
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
    if (channelSearch) {
      let filterDebounce;
      channelSearch.addEventListener('input', () => {
        clearTimeout(filterDebounce);
        filterDebounce = setTimeout(filterChannels, 250);
      });
    }

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
