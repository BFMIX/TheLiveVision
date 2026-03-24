// sportsEventManager.js
// Sports events manager using beta.adstrim.ru (API) and viewembed.ru (player)

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('event-list');
    const sportFilter = document.getElementById('sport-filter');
    const leagueFilter = document.getElementById('league-filter');
    const tournamentFilter = document.getElementById('tournament-filter');
    const eventSearch = document.getElementById('event-search');
    const loadingIndicator = document.getElementById('sports-loading');
    const errorMessage = document.getElementById('sports-error');

    const API_BASE = window.API_BASE || 'https://beta.adstrim.ru';
    const EMBED_BASE = window.EMBED_BASE || 'https://viewembed.ru';

    window.API_BASE = API_BASE;
    window.EMBED_BASE = EMBED_BASE;

    let eventsData = [];
    let isLoading = false;

    function getFirstImage(obj, keys) {
      if (!obj) return '';
      for (const key of keys) {
        if (obj[key]) return obj[key];
      }
      return '';
    }

    function isUrl(value) {
      return /^https?:\/\//i.test(String(value || ''));
    }

    function extractEmoji(value) {
      const text = String(value || '').trim();
      if (!text) return '';
      const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
      return emojiRegex.test(text) && text.length <= 6 ? text : '';
    }

    function getSportFallbackIcon(sportName) {
      const name = String(sportName || '').toLowerCase();
      if (name.includes('basket')) return 'fa-basketball';
      if (name.includes('baseball')) return 'fa-baseball';
      if (name.includes('tennis')) return 'fa-table-tennis-paddle-ball';
      if (name.includes('golf')) return 'fa-golf-ball-tee';
      if (name.includes('hockey')) return 'fa-hockey-puck';
      if (name.includes('rugby')) return 'fa-football';
      if (name.includes('cricket')) return 'fa-baseball';
      if (name.includes('boxing') || name.includes('mma') || name.includes('fight')) return 'fa-hand-fist';
      if (name.includes('motor') || name.includes('racing') || name.includes('auto')) return 'fa-flag-checkered';
      if (name.includes('cycling') || name.includes('bike')) return 'fa-person-biking';
      if (name.includes('athletic') || name.includes('track') || name.includes('run')) return 'fa-person-running';
      if (name.includes('football') || name.includes('soccer') || name.includes('futbol')) return 'fa-futbol';
      return 'fa-futbol';
    }

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

    function extractCountry(value) {
      if (!value) return '';
      const match = String(value).match(/\[([^\]]+)\]\s*$/);
      return match ? match[1] : '';
    }

    function getCountryFlag(countryName) {
      if (!countryName) return '';
      const countryCode = String(countryName).toUpperCase();
      const countryFlags = {
        'UK': '🇬🇧', 'USA': '🇺🇸', 'CANADA': '🇨🇦', 'FRANCE': '🇫🇷', 'SPAIN': '🇪🇸',
        'GERMANY': '🇩🇪', 'ITALY': '🇮🇹', 'PORTUGAL': '🇵🇹', 'BRAZIL': '🇧🇷', 'ARGENTINA': '🇦🇷',
        'MEXICO': '🇲🇽', 'TURKEY': '🇹🇷', 'NETHERLANDS': '🇳🇱', 'BELGIUM': '🇧🇪', 'POLAND': '🇵🇱',
        'RUSSIA': '🇷🇺', 'GREECE': '🇬🇷', 'ROMANIA': '🇷🇴', 'BULGARIA': '🇧🇬', 'SERBIA': '🇷🇸',
        'CROATIA': '🇭🇷', 'SWEDEN': '🇸🇪', 'NORWAY': '🇳🇴', 'DENMARK': '🇩🇰', 'FINLAND': '🇫🇮',
        'IRELAND': '🇮🇪', 'SCOTLAND': '🏴', 'WALES': '🏴', 'AUSTRALIA': '🇦🇺', 'JAPAN': '🇯🇵',
        'KOREA': '🇰🇷', 'CHINA': '🇨🇳', 'INDIA': '🇮🇳', 'PAKISTAN': '🇵🇰', 'UAE': '🇦🇪',
        'SAUDI ARABIA': '🇸🇦', 'QATAR': '🇶🇦', 'EGYPT': '🇪🇬', 'SOUTH AFRICA': '🇿🇦', 'NIGERIA': '🇳🇬',
        'ALGERIA': '🇩🇿', 'MOROCCO': '🇲🇦', 'TUNISIA': '🇹🇳', 'ISRAEL': '🇮🇱', 'CZECH': '🇨🇿',
        'SLOVAKIA': '🇸🇰', 'HUNGARY': '🇭🇺', 'AUSTRIA': '🇦🇹', 'SWITZERLAND': '🇨🇭', 'ALBANIA': '🇦🇱',
        'CHILE': '🇨🇱', 'COLOMBIA': '🇨🇴', 'PERU': '🇵🇪', 'VENEZUELA': '🇻🇪',
        'URUGUAY': '🇺🇾', 'ECUADOR': '🇪🇨', 'BOLIVIA': '🇧🇴', 'PARAGUAY': '🇵🇾', 'COSTA RICA': '🇨🇷',
        'PANAMA': '🇵🇦', 'JAMAICA': '🇯🇲', 'HONDURAS': '🇭🇳', 'EL SALVADOR': '🇸🇻', 'GUATEMALA': '🇬🇹',
        'INTERNATIONAL': '🌍', 'WORLD': '🌎', 'GLOBAL': '🌏'
      };

      return countryFlags[countryCode] || '';
    }

    function formatStreamCode(countryName) {
      const raw = String(countryName || '').trim().toUpperCase();
      if (!raw) return 'GLB';

      const normalized = raw
        .replace(/[()[\]]/g, '')
        .replace(/[^A-Z\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const directCodes = {
        UK: 'EN',
        USA: 'US',
        US: 'US',
        FRANCE: 'FR',
        SPAIN: 'ES',
        GERMANY: 'DE',
        ITALY: 'IT',
        PORTUGAL: 'PT',
        BRAZIL: 'BR',
        ARGENTINA: 'AR',
        JAPAN: 'JP',
        INTERNATIONAL: 'INT',
        WORLD: 'INT',
        GLOBAL: 'INT'
      };

      if (directCodes[normalized]) return directCodes[normalized];
      if (normalized.length <= 3) return normalized;

      const initials = normalized
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 3);

      return initials || normalized.slice(0, 3);
    }

    function showCopyFeedback(button) {
      if (!button) return;
      const originalTooltip = button.getAttribute('data-tooltip') || '';
      const originalHtml = button.dataset.copyHtml || '';

      if (!originalHtml) {
        button.dataset.copyHtml = button.innerHTML;
      }

      button.setAttribute('data-tooltip', 'Copied!');
      button.classList.add('show-tooltip');
      button.textContent = 'Copied!';

      clearTimeout(button._copyTimeout);
      button._copyTimeout = setTimeout(() => {
        if (originalTooltip) {
          button.setAttribute('data-tooltip', originalTooltip);
        } else {
          button.removeAttribute('data-tooltip');
        }
        if (button.dataset.copyHtml) {
          button.innerHTML = button.dataset.copyHtml;
        }
        button.classList.remove('show-tooltip');
      }, 1400);
    }

    function copyStreamLink(event, url) {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }

      if (!url) return;

      const targetButton = event?.currentTarget || event?.target;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).catch(() => {});
        showCopyFeedback(targetButton);
        return;
      }

      const tempInput = document.createElement('input');
      tempInput.value = url;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showCopyFeedback(targetButton);
    }

    window.copyStreamLink = copyStreamLink;

    function toDateKey(timestamp) {
      const dateObj = new Date(timestamp * 1000);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function buildLogoHtml(url, className, alt, fallbackIcon) {
      if (!url) {
        return `<span class="logo-fallback ${className}-fallback"><i class="fas ${fallbackIcon}"></i></span>`;
      }

      return `
        <span class="logo-wrap ${className}-wrap">
          <img
            src="${url}"
            alt="${alt}"
            class="${className}"
            loading="lazy"
            decoding="async"
            width="40"
            height="40"
            onerror="this.classList.add('is-hidden'); this.nextElementSibling.classList.remove('is-hidden');"
          />
          <span class="logo-fallback ${className}-fallback is-hidden"><i class="fas ${fallbackIcon}"></i></span>
        </span>
      `;
    }

    function buildSportIconHtml(event) {
      const fallbackIcon = getSportFallbackIcon(event.sport);
      const sportLogo = event.sport_logo && isUrl(event.sport_logo) ? event.sport_logo : '';

      if (sportLogo) {
        return `
          <span class="sport-icon-wrap">
            <img
              src="${sportLogo}"
              alt="${event.sport} logo"
              class="sport-icon-img"
              loading="lazy"
              decoding="async"
              width="22"
              height="22"
              onerror="this.classList.add('is-hidden'); this.nextElementSibling.classList.remove('is-hidden');"
            />
            <span class="sport-icon-fallback is-hidden"><i class="fas ${fallbackIcon}"></i></span>
          </span>
        `;
      }

      if (event.sport_emoji) {
        return `<span class="sport-icon-emoji">${event.sport_emoji}</span>`;
      }

      return `<span class="sport-icon-fallback"><i class="fas ${fallbackIcon}"></i></span>`;
    }

    function buildSelectOptionHtml(option) {
      const item = document.createElement('div');
      item.className = 'custom-select-option';
      item.dataset.value = option.value;

      if (option.logoUrl) {
        const img = document.createElement('img');
        img.src = option.logoUrl;
        img.alt = '';
        img.className = 'select-logo';
        img.width = 26;
        img.height = 26;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', () => {
          img.remove();
          if (option.emoji) {
            const emoji = document.createElement('span');
            emoji.className = 'select-emoji';
            emoji.textContent = option.emoji;
            item.prepend(emoji);
          } else {
            const fallback = document.createElement('span');
            fallback.className = 'select-fallback';
            fallback.innerHTML = `<i class="fas ${option.fallbackIcon}"></i>`;
            item.prepend(fallback);
          }
        });
        item.appendChild(img);
      } else if (option.emoji) {
        const emoji = document.createElement('span');
        emoji.className = 'select-emoji';
        emoji.textContent = option.emoji;
        item.appendChild(emoji);
      } else {
        const fallback = document.createElement('span');
        fallback.className = 'select-fallback';
        fallback.innerHTML = `<i class="fas ${option.fallbackIcon}"></i>`;
        item.appendChild(fallback);
      }

      const label = document.createElement('span');
      label.className = 'custom-select-label';
      label.textContent = option.label;
      item.appendChild(label);

      return item;
    }

    function enhanceSelectWithLogos(selectEl, options, placeholderLabel) {
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
        const optionEl = buildSelectOptionHtml(option);
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
        if (option.logoUrl) {
          const img = document.createElement('img');
          img.src = option.logoUrl;
          img.alt = '';
          img.className = 'select-logo';
          img.width = 26;
          img.height = 26;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.addEventListener('error', () => {
            img.remove();
            if (option.emoji) {
              const emoji = document.createElement('span');
              emoji.className = 'select-emoji';
              emoji.textContent = option.emoji;
              triggerIcon.appendChild(emoji);
            } else {
              const fallback = document.createElement('span');
              fallback.className = 'select-fallback';
              fallback.innerHTML = `<i class="fas ${option.fallbackIcon}"></i>`;
              triggerIcon.appendChild(fallback);
            }
          });
          triggerIcon.appendChild(img);
        } else if (option.emoji) {
          const emoji = document.createElement('span');
          emoji.className = 'select-emoji';
          emoji.textContent = option.emoji;
          triggerIcon.appendChild(emoji);
        } else {
          const fallback = document.createElement('span');
          fallback.className = 'select-fallback';
          fallback.innerHTML = `<i class="fas ${option.fallbackIcon}"></i>`;
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

    async function loadEvents(showSkeleton = true) {
      if (isLoading) return;
      isLoading = true;

      try {
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

        const response = await fetch(`${API_BASE}/api/events`);
        if (!response.ok) {
          throw new Error('Network error while fetching events.');
        }
        const apiResponse = await response.json();

        if (apiResponse.status !== 'success' || !apiResponse.data) {
          throw new Error('Invalid API response.');
        }

        eventsData = apiResponse.data.map((event) => {
          const sportName = event.sport || event.sport_name || event.sportName || 'Unknown';
          const leagueName = event.league || event.league_name || event.leagueName || event.tournament || event.tournament_name || 'Unknown';
          const tournamentName = event.tournament || event.tournament_name || event.tournamentName || event.league || event.league_name || 'Unknown';
          const homeTeam = event.home_team || event.homeTeam || event.home || '';
          const awayTeam = event.away_team || event.awayTeam || event.away || '';
          const matchName = homeTeam && awayTeam
            ? `${homeTeam} vs ${awayTeam}`
            : event.match || event.name || event.title || 'TBD';

          const sportEmoji = extractEmoji(
            event.sport_emoji || event.sportEmoji || event.sport_icon || event.sportIcon || ''
          );
          const sportLogoCandidate = getFirstImage(event, [
            'sport_logo',
            'sport_logo_url',
            'sport_image',
            'sport_image_url',
            'sport_icon_url'
          ]);
          const sportLogo = isUrl(sportLogoCandidate) ? sportLogoCandidate : '';

          const leagueLogo = getFirstImage(event, [
            'league_logo',
            'league_logo_url',
            'league_image',
            'league_image_url',
            'league_icon',
            'league_icon_url'
          ]);
          const tournamentLogo = getFirstImage(event, [
            'tournament_logo',
            'tournament_logo_url',
            'tournament_image',
            'tournament_image_url'
          ]) || leagueLogo;

          const channels = event.channels
            ? event.channels.map((ch) => {
              const canonicalName = ch.name || ch.link || '';
              return {
                url: buildChannelUrl(canonicalName),
                country: extractCountry(canonicalName)
              };
            })
            : [];

          return {
            id: event.id,
            date: toDateKey(event.timestamp),
            unix_timestamp: event.timestamp,
            sport: sportName,
            sport_emoji: sportEmoji,
            tournament: tournamentName,
            league: leagueName,
            match: matchName,
            channels,
            home_team: homeTeam,
            away_team: awayTeam,
            sport_logo: sportLogo,
            league_logo: leagueLogo,
            tournament_logo: tournamentLogo,
            home_team_logo: getFirstImage(event, [
              'home_team_logo',
              'home_team_logo_url',
              'home_team_image',
              'home_team_image_url',
              'home_team_badge',
              'home_team_icon',
              'home_logo',
              'home_badge'
            ]),
            away_team_logo: getFirstImage(event, [
              'away_team_logo',
              'away_team_logo_url',
              'away_team_image',
              'away_team_image_url',
              'away_team_badge',
              'away_team_icon',
              'away_logo',
              'away_badge'
            ])
          };
        });

        const sportsMap = new Map();
        const leagueMap = new Map();
        const tournamentMap = new Map();

        eventsData.forEach((event) => {
          if (!sportsMap.has(event.sport)) {
            sportsMap.set(event.sport, { logoUrl: event.sport_logo, emoji: event.sport_emoji });
          } else {
            const current = sportsMap.get(event.sport);
            if (!current.logoUrl && event.sport_logo) current.logoUrl = event.sport_logo;
            if (!current.emoji && event.sport_emoji) current.emoji = event.sport_emoji;
          }

          if (!leagueMap.has(event.league) || (!leagueMap.get(event.league) && event.league_logo)) {
            leagueMap.set(event.league, event.league_logo);
          }

          if (!tournamentMap.has(event.tournament) || (!tournamentMap.get(event.tournament) && event.tournament_logo)) {
            tournamentMap.set(event.tournament, event.tournament_logo);
          }
        });

        sportFilter.innerHTML = '<option value="">All Sports</option>';
        Array.from(sportsMap.keys()).sort().forEach((sport) => {
          const option = document.createElement('option');
          option.value = sport;
          option.textContent = sport;
          sportFilter.appendChild(option);
        });

        leagueFilter.innerHTML = '<option value="">All Leagues</option>';
        Array.from(leagueMap.keys()).sort().forEach((league) => {
          const option = document.createElement('option');
          option.value = league;
          option.textContent = league;
          leagueFilter.appendChild(option);
        });

        tournamentFilter.innerHTML = '<option value="">All Tournaments</option>';
        Array.from(tournamentMap.keys()).sort().forEach((tournament) => {
          const option = document.createElement('option');
          option.value = tournament;
          option.textContent = tournament;
          tournamentFilter.appendChild(option);
        });

        const sportOptions = [
          { value: '', label: 'All Sports', logoUrl: '', emoji: '', fallbackIcon: 'fa-futbol' },
          ...Array.from(sportsMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([label, meta]) => ({
            value: label,
            label,
            logoUrl: meta?.logoUrl || '',
            emoji: meta?.emoji || '',
            fallbackIcon: getSportFallbackIcon(label)
          }))
        ];

        const leagueOptions = [
          { value: '', label: 'All Leagues', logoUrl: '', fallbackIcon: 'fa-shield' },
          ...Array.from(leagueMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([label, logoUrl]) => ({
            value: label,
            label,
            logoUrl,
            fallbackIcon: 'fa-shield'
          }))
        ];

        const tournamentOptions = [
          { value: '', label: 'All Tournaments', logoUrl: '', fallbackIcon: 'fa-trophy' },
          ...Array.from(tournamentMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([label, logoUrl]) => ({
            value: label,
            label,
            logoUrl,
            fallbackIcon: 'fa-trophy'
          }))
        ];

        enhanceSelectWithLogos(sportFilter, sportOptions, 'All Sports');
        enhanceSelectWithLogos(leagueFilter, leagueOptions, 'All Leagues');
        enhanceSelectWithLogos(tournamentFilter, tournamentOptions, 'All Tournaments');

        displayEvents(eventsData);
      } catch (error) {
        console.error('Error loading events:', error);

        if (window.UXEnhancements) {
          eventList.innerHTML = '';
          window.UXEnhancements.ErrorState.show(
            errorMessage,
            'Unable to load events. Please check your connection and try again.',
            () => { loadEvents(true); }
          );
        } else {
          eventList.innerHTML = '<div class="empty-message">Unable to load events. Please try again later.</div>';
          errorMessage.textContent = 'Unable to load events from the API. Please check your connection and try again.';
          errorMessage.style.display = 'block';
        }
      } finally {
        loadingIndicator.style.display = 'none';
        isLoading = false;
      }
    }

    function displayEvents(events) {
      eventList.innerHTML = '';

      if (events.length === 0) {
        if (window.UXEnhancements) {
          window.UXEnhancements.EmptyState.showInContainer(
            eventList,
            'No events found. Try adjusting your filters.'
          );
        } else {
          eventList.innerHTML = '<div class="empty-message">No events found.</div>';
        }
        return;
      }

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      function buildStreamButton(channel, index) {
        const flag = getCountryFlag(channel.country);
        const code = formatStreamCode(channel.country);
        const flagHtml = flag ? `<span class="stream-flag" aria-hidden="true">${flag}</span>` : '';
        const streamNumber = String(index + 1).padStart(2, '0');

        return `
          <button
            class="stream-chip"
            type="button"
            onclick="loadStream('${channel.url}')"
            oncontextmenu="copyStreamLink(event, '${channel.url}')"
            data-stream-url="${channel.url}"
            data-tooltip="Right-click to copy"
          >
            ${flagHtml}
            <span class="stream-chip-meta">
              <span class="stream-chip-index">Stream #${streamNumber}</span>
              <span class="stream-chip-code">(${code})</span>
            </span>
            <span class="stream-chip-play">
              <span class="stream-chip-icon" aria-hidden="true"><i class="fas fa-play"></i></span>
              <span class="stream-chip-label">Play</span>
            </span>
          </button>
        `;
      }

      events.forEach((event) => {
        const dateParts = event.date.split('-');
        const year = dateParts[0];
        const monthIndex = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const formattedDate = `${day} ${monthNames[monthIndex]} ${year}`;

        const dateObj = new Date(event.unix_timestamp * 1000);
        const time = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const homeLogo = buildLogoHtml(
          event.home_team_logo,
          'team-logo',
          `${event.home_team || 'Home'} logo`,
          'fa-shield'
        );
        const awayLogo = buildLogoHtml(
          event.away_team_logo,
          'team-logo',
          `${event.away_team || 'Away'} logo`,
          'fa-shield'
        );
        const tournamentLogo = buildLogoHtml(
          event.tournament_logo,
          'league-logo',
          `${event.tournament} logo`,
          'fa-trophy'
        );
        const homeName = event.home_team ? String(event.home_team).trim() : '';
        const awayName = event.away_team ? String(event.away_team).trim() : '';
        const matchFallback = event.match ? String(event.match).trim() : '';
        const hasTeams = homeName && awayName;
        const cardId = `event-card-${event.id || `${event.date}-${event.match}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
        const streamPanelId = `${cardId}-streams`;
        const hasStreams = Array.isArray(event.channels) && event.channels.length > 0;

        const card = document.createElement('div');
        card.className = 'event-card';
        card.dataset.eventId = String(event.id || '');
        card.innerHTML = `
          <div class="event-card-shell">
            <div class="event-card-header">
              <div class="event-meta-cluster">
                <div class="event-meta-stack">
                  <div class="event-meta-item">
                    <span class="event-meta-icon"><i class="fas fa-calendar-alt"></i></span>
                    <span class="event-meta-text">${formattedDate}</span>
                  </div>
                  <div class="event-meta-item time-meta">
                    <span class="event-meta-icon"><i class="fas fa-clock"></i></span>
                    <span class="event-meta-text">${time}</span>
                  </div>
                </div>
                <div class="event-meta-divider" aria-hidden="true"></div>
                <div class="event-meta-item sport-meta">
                  ${buildSportIconHtml(event)}
                  <span class="event-meta-text">${event.sport}</span>
                </div>
              </div>
            </div>
            <div class="event-card-body">
              <div class="event-match-layout${hasTeams ? '' : ' single'}">
                ${hasTeams
                  ? `
                    <div class="team-column home-team">
                      <span class="team-logo-slot">${homeLogo}</span>
                      <span class="team-name-text home">${homeName}</span>
                    </div>
                    <span class="match-vs">VS</span>
                    <div class="team-column away-team">
                      <span class="team-logo-slot">${awayLogo}</span>
                      <span class="team-name-text away">${awayName}</span>
                    </div>
                  `
                  : `<div class="match-name single"><span class="team-name-text">${matchFallback}</span></div>`
                }
              </div>
              <div class="event-league-row">
                ${tournamentLogo}
                <div class="event-league-copy">
                  <span class="event-league-name">${event.tournament}</span>
                </div>
              </div>
            </div>
            <div class="event-stream-panel" id="${streamPanelId}" hidden>
              <div class="event-stream-panel-inner">
                <div class="event-stream-divider" aria-hidden="true">
                  <span class="event-stream-divider-icon"><i class="fas fa-chevron-down"></i></span>
                </div>
                <div class="event-stream-grid">
                  ${hasStreams ? event.channels.map((channel, index) => buildStreamButton(channel, index)).join('') : ''}
                </div>
              </div>
            </div>
            <div class="event-card-footer">
              <button
                class="event-stream-toggle"
                type="button"
                aria-expanded="false"
                aria-controls="${streamPanelId}"
                ${hasStreams ? '' : 'disabled'}
              >
                <span class="event-stream-toggle-text">${hasStreams ? 'Watch Available Streams' : 'No Streams Available'}</span>
                <span class="event-stream-toggle-icon" aria-hidden="true"><i class="fas fa-chevron-down"></i></span>
              </button>
            </div>
          </div>
        `;

        const toggle = card.querySelector('.event-stream-toggle');
        const panel = card.querySelector('.event-stream-panel');

        if (toggle && panel && hasStreams) {
          toggle.addEventListener('click', () => {
            const isExpanded = card.classList.toggle('is-expanded');
            toggle.setAttribute('aria-expanded', String(isExpanded));
            panel.hidden = !isExpanded;
          });
        }

        eventList.appendChild(card);
      });
    }

    function filterEvents() {
      const selectedSport = sportFilter.value;
      const selectedLeague = leagueFilter.value;
      const selectedTournament = tournamentFilter.value;
      const searchQuery = eventSearch.value.toLowerCase();

      const filteredEvents = eventsData.filter((event) => {
        const matchesSport = selectedSport ? event.sport === selectedSport : true;
        const matchesLeague = selectedLeague ? event.league === selectedLeague : true;
        const matchesTournament = selectedTournament ? event.tournament === selectedTournament : true;
        const matchesSearch = event.match.toLowerCase().includes(searchQuery) ||
          event.tournament.toLowerCase().includes(searchQuery) ||
          event.league.toLowerCase().includes(searchQuery);

        return matchesSport && matchesLeague && matchesTournament && matchesSearch;
      });

      displayEvents(filteredEvents);
    }

    if (sportFilter) sportFilter.addEventListener('change', filterEvents);
    if (leagueFilter) leagueFilter.addEventListener('change', filterEvents);
    if (tournamentFilter) tournamentFilter.addEventListener('change', filterEvents);
    if (eventSearch) eventSearch.addEventListener('input', filterEvents);

    if (window.UXEnhancements && window.UXEnhancements.isMobile()) {
      setTimeout(() => {
        window.UXEnhancements.PullToRefresh.init('page-football', async () => {
          await loadEvents(false);
          filterEvents();
        });
      }, 500);
    }

    loadEvents();
  });
})();
