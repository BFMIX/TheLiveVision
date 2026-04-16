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

    var buildChannelUrl = window.SharedUtils.buildChannelUrl;
    var extractCountry = window.SharedUtils.extractCountry;
    var getCountryFlag = window.getCountryFlag;

    const API_BASE = window.API_BASE;

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

      // Save original children if not already saved
      if (!button._savedNodes) {
        button._savedNodes = Array.from(button.childNodes).map(function (n) { return n.cloneNode(true); });
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
        if (button._savedNodes) {
          button.textContent = '';
          button._savedNodes.forEach(function (n) { button.appendChild(n.cloneNode(true)); });
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

    function buildLogoEl(url, className, alt, fallbackIcon) {
      if (!url) {
        const span = document.createElement('span');
        span.className = `logo-fallback ${className}-fallback`;
        span.appendChild(Sanitize.createIcon(fallbackIcon));
        return span;
      }

      const wrap = document.createElement('span');
      wrap.className = `logo-wrap ${className}-wrap`;

      const img = document.createElement('img');
      img.src = Sanitize.sanitizeURL(url);
      img.alt = alt;
      img.className = className;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 40;
      img.height = 40;
      img.addEventListener('error', function () {
        this.classList.add('is-hidden');
        this.nextElementSibling.classList.remove('is-hidden');
      });

      const fallback = document.createElement('span');
      fallback.className = `logo-fallback ${className}-fallback is-hidden`;
      fallback.appendChild(Sanitize.createIcon(fallbackIcon));

      wrap.appendChild(img);
      wrap.appendChild(fallback);
      return wrap;
    }

    function buildSportIconEl(event) {
      const fallbackIcon = getSportFallbackIcon(event.sport);
      const sportLogo = event.sport_logo && isUrl(event.sport_logo) ? event.sport_logo : '';

      if (sportLogo) {
        const wrap = document.createElement('span');
        wrap.className = 'sport-icon-wrap';

        const img = document.createElement('img');
        img.src = Sanitize.sanitizeURL(sportLogo);
        img.alt = (event.sport || '') + ' logo';
        img.className = 'sport-icon-img';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 22;
        img.height = 22;
        img.addEventListener('error', function () {
          this.classList.add('is-hidden');
          this.nextElementSibling.classList.remove('is-hidden');
        });

        const fallback = document.createElement('span');
        fallback.className = 'sport-icon-fallback is-hidden';
        fallback.appendChild(Sanitize.createIcon(fallbackIcon));

        wrap.appendChild(img);
        wrap.appendChild(fallback);
        return wrap;
      }

      if (event.sport_emoji) {
        const emoji = document.createElement('span');
        emoji.className = 'sport-icon-emoji';
        emoji.textContent = event.sport_emoji;
        return emoji;
      }

      const fallback = document.createElement('span');
      fallback.className = 'sport-icon-fallback';
      fallback.appendChild(Sanitize.createIcon(fallbackIcon));
      return fallback;
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
            fallback.appendChild(Sanitize.createIcon(option.fallbackIcon));
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
        fallback.appendChild(Sanitize.createIcon(option.fallbackIcon));
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
        triggerIcon.textContent = '';
        if (option.logoUrl) {
          const img = document.createElement('img');
          img.src = Sanitize.sanitizeURL(option.logoUrl);
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
              fallback.appendChild(Sanitize.createIcon(option.fallbackIcon));
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
          fallback.appendChild(Sanitize.createIcon(option.fallbackIcon));
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
          eventList.textContent = '';
          const errMsg = document.createElement('div');
          errMsg.className = 'empty-message';
          errMsg.textContent = 'Unable to load events. Please try again later.';
          eventList.appendChild(errMsg);
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
          eventList.textContent = '';
          const noEventsMsg = document.createElement('div');
          noEventsMsg.className = 'empty-message';
          noEventsMsg.textContent = 'No events found.';
          eventList.appendChild(noEventsMsg);
        }
        return;
      }

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      function formatTournamentLines(name) {
        const rawName = String(name || '').trim();
        if (!rawName) {
          return ['Competition', ''];
        }

        const commaParts = rawName.split(',').map((part) => part.trim()).filter(Boolean);
        if (commaParts.length >= 2) {
          return [commaParts[0], commaParts.slice(1).join(', ')];
        }

        const separatorMatch = rawName.match(/^(.*?)(\s[-–]\s.*)$/);
        if (separatorMatch) {
          return [separatorMatch[1].trim(), separatorMatch[2].replace(/^\s[-–]\s/, '').trim()];
        }

        const words = rawName.split(/\s+/);
        if (words.length >= 4) {
          const midpoint = Math.ceil(words.length / 2);
          return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')];
        }

        return [rawName, ''];
      }

      function buildStreamButtonEl(channel, index) {
        const flag = getCountryFlag(channel.country);
        const code = formatStreamCode(channel.country);
        const streamNumber = String(index + 1).padStart(2, '0');
        const safeUrl = Sanitize.sanitizeURL(channel.url);

        const btn = document.createElement('button');
        btn.className = 'stream-chip';
        btn.type = 'button';
        btn.dataset.streamUrl = safeUrl;
        btn.setAttribute('data-tooltip', 'Right-click to copy');

        // Flag
        const flagSpan = document.createElement('span');
        if (flag) {
          flagSpan.className = 'stream-flag';
          flagSpan.setAttribute('aria-hidden', 'true');
          flagSpan.textContent = flag;
        } else {
          flagSpan.className = 'stream-flag stream-flag-fallback';
          flagSpan.setAttribute('aria-hidden', 'true');
          flagSpan.appendChild(Sanitize.createIcon('fa-globe'));
        }
        btn.appendChild(flagSpan);

        // Meta
        const meta = document.createElement('span');
        meta.className = 'stream-chip-meta';
        const idxSpan = document.createElement('span');
        idxSpan.className = 'stream-chip-index';
        idxSpan.textContent = 'Stream #' + streamNumber;
        const codeSpan = document.createElement('span');
        codeSpan.className = 'stream-chip-code';
        codeSpan.textContent = '(' + code + ')';
        meta.appendChild(idxSpan);
        meta.appendChild(codeSpan);
        btn.appendChild(meta);

        // Play
        const play = document.createElement('span');
        play.className = 'stream-chip-play';
        const playIcon = document.createElement('span');
        playIcon.className = 'stream-chip-icon';
        playIcon.setAttribute('aria-hidden', 'true');
        playIcon.appendChild(Sanitize.createIcon('fa-play'));
        const playLabel = document.createElement('span');
        playLabel.className = 'stream-chip-label';
        playLabel.textContent = 'Play';
        play.appendChild(playIcon);
        play.appendChild(playLabel);
        btn.appendChild(play);

        return btn;
      }

      events.forEach((event) => {
        const dateParts = event.date.split('-');
        const year = dateParts[0];
        const monthIndex = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const formattedDate = day + ' ' + monthNames[monthIndex] + ' ' + year;

        const dateObj = new Date(event.unix_timestamp * 1000);
        const time = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const homeName = event.home_team ? String(event.home_team).trim() : '';
        const awayName = event.away_team ? String(event.away_team).trim() : '';
        const matchFallback = event.match ? String(event.match).trim() : '';
        const hasTeams = homeName && awayName;
        const [tournamentLineOne, tournamentLineTwo] = formatTournamentLines(event.tournament);
        const cardId = 'event-card-' + (event.id || (event.date + '-' + event.match).replace(/[^a-z0-9]+/gi, '-').toLowerCase());
        const streamPanelId = cardId + '-streams';
        const hasStreams = Array.isArray(event.channels) && event.channels.length > 0;

        // Build card with static structure, then populate dynamic parts via DOM
        const card = document.createElement('div');
        card.className = 'event-card';
        card.dataset.eventId = String(event.id || '');

        const shell = document.createElement('div');
        shell.className = 'event-card-shell';

        // --- HEADER ---
        const header = document.createElement('div');
        header.className = 'event-card-header';
        const metaCluster = document.createElement('div');
        metaCluster.className = 'event-meta-cluster';

        const metaStack = document.createElement('div');
        metaStack.className = 'event-meta-stack';

        // Date meta
        const dateMeta = document.createElement('div');
        dateMeta.className = 'event-meta-item';
        const dateIcon = document.createElement('span');
        dateIcon.className = 'event-meta-icon';
        dateIcon.appendChild(Sanitize.createIcon('fa-calendar-alt'));
        const dateText = document.createElement('span');
        dateText.className = 'event-meta-text';
        dateText.textContent = formattedDate;
        dateMeta.appendChild(dateIcon);
        dateMeta.appendChild(dateText);

        // Time meta
        const timeMeta = document.createElement('div');
        timeMeta.className = 'event-meta-item time-meta';
        const timeIcon = document.createElement('span');
        timeIcon.className = 'event-meta-icon';
        timeIcon.appendChild(Sanitize.createIcon('fa-clock'));
        const timeText = document.createElement('span');
        timeText.className = 'event-meta-text';
        timeText.textContent = time;
        timeMeta.appendChild(timeIcon);
        timeMeta.appendChild(timeText);

        metaStack.appendChild(dateMeta);
        metaStack.appendChild(timeMeta);

        const divider = document.createElement('div');
        divider.className = 'event-meta-divider';
        divider.setAttribute('aria-hidden', 'true');

        // Sport meta
        const sportMeta = document.createElement('div');
        sportMeta.className = 'event-meta-item sport-meta';
        sportMeta.appendChild(buildSportIconEl(event));
        const sportText = document.createElement('span');
        sportText.className = 'event-meta-text';
        sportText.textContent = event.sport;
        sportMeta.appendChild(sportText);

        metaCluster.appendChild(metaStack);
        metaCluster.appendChild(divider);
        metaCluster.appendChild(sportMeta);
        header.appendChild(metaCluster);

        // --- BODY ---
        const body = document.createElement('div');
        body.className = 'event-card-body';
        const matchLayout = document.createElement('div');
        matchLayout.className = 'event-match-layout' + (hasTeams ? '' : ' single');

        if (hasTeams) {
          // Home team
          const homeCol = document.createElement('div');
          homeCol.className = 'team-column home-team';
          const homeLogoSlot = document.createElement('span');
          homeLogoSlot.className = 'team-logo-slot';
          homeLogoSlot.appendChild(buildLogoEl(event.home_team_logo, 'team-logo', (homeName || 'Home') + ' logo', 'fa-shield'));
          const homeNameEl = document.createElement('span');
          homeNameEl.className = 'team-name-text home';
          homeNameEl.textContent = homeName;
          homeCol.appendChild(homeLogoSlot);
          homeCol.appendChild(homeNameEl);

          // Center league
          const center = document.createElement('div');
          center.className = 'match-center-league';
          const glow = document.createElement('span');
          glow.className = 'match-center-glow';
          glow.setAttribute('aria-hidden', 'true');
          const centerLogo = document.createElement('span');
          centerLogo.className = 'match-center-logo';
          centerLogo.appendChild(buildLogoEl(event.tournament_logo, 'league-logo', (event.tournament || '') + ' logo', 'fa-trophy'));
          const centerName = document.createElement('span');
          centerName.className = 'match-center-name';
          const line1 = document.createElement('span');
          line1.className = 'match-center-line';
          line1.textContent = tournamentLineOne;
          centerName.appendChild(line1);
          if (tournamentLineTwo) {
            const line2 = document.createElement('span');
            line2.className = 'match-center-line';
            line2.textContent = tournamentLineTwo;
            centerName.appendChild(line2);
          }
          center.appendChild(glow);
          center.appendChild(centerLogo);
          center.appendChild(centerName);

          // Away team
          const awayCol = document.createElement('div');
          awayCol.className = 'team-column away-team';
          const awayLogoSlot = document.createElement('span');
          awayLogoSlot.className = 'team-logo-slot';
          awayLogoSlot.appendChild(buildLogoEl(event.away_team_logo, 'team-logo', (awayName || 'Away') + ' logo', 'fa-shield'));
          const awayNameEl = document.createElement('span');
          awayNameEl.className = 'team-name-text away';
          awayNameEl.textContent = awayName;
          awayCol.appendChild(awayLogoSlot);
          awayCol.appendChild(awayNameEl);

          matchLayout.appendChild(homeCol);
          matchLayout.appendChild(center);
          matchLayout.appendChild(awayCol);
        } else {
          const matchDiv = document.createElement('div');
          matchDiv.className = 'match-name single';
          const matchText = document.createElement('span');
          matchText.className = 'team-name-text';
          matchText.textContent = matchFallback;
          matchDiv.appendChild(matchText);
          matchLayout.appendChild(matchDiv);
        }
        body.appendChild(matchLayout);

        // --- STREAM PANEL ---
        const streamPanel = document.createElement('div');
        streamPanel.className = 'event-stream-panel';
        streamPanel.id = streamPanelId;
        streamPanel.hidden = true;
        const panelInner = document.createElement('div');
        panelInner.className = 'event-stream-panel-inner';
        const streamDivider = document.createElement('div');
        streamDivider.className = 'event-stream-divider';
        streamDivider.setAttribute('aria-hidden', 'true');
        const dividerIcon = document.createElement('span');
        dividerIcon.className = 'event-stream-divider-icon';
        dividerIcon.appendChild(Sanitize.createIcon('fa-chevron-down'));
        streamDivider.appendChild(dividerIcon);
        const streamGrid = document.createElement('div');
        streamGrid.className = 'event-stream-grid';
        if (hasStreams) {
          event.channels.forEach(function (channel, index) {
            streamGrid.appendChild(buildStreamButtonEl(channel, index));
          });
        }
        panelInner.appendChild(streamDivider);
        panelInner.appendChild(streamGrid);
        streamPanel.appendChild(panelInner);

        // --- FOOTER ---
        const footer = document.createElement('div');
        footer.className = 'event-card-footer';
        const toggle = document.createElement('button');
        toggle.className = 'event-stream-toggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', streamPanelId);
        if (!hasStreams) toggle.disabled = true;
        const toggleText = document.createElement('span');
        toggleText.className = 'event-stream-toggle-text';
        toggleText.textContent = hasStreams ? 'Watch Available Streams' : 'No Streams Available';
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'event-stream-toggle-icon';
        toggleIcon.setAttribute('aria-hidden', 'true');
        toggleIcon.appendChild(Sanitize.createIcon('fa-chevron-down'));
        toggle.appendChild(toggleText);
        toggle.appendChild(toggleIcon);
        footer.appendChild(toggle);

        // Assemble
        shell.appendChild(header);
        shell.appendChild(body);
        shell.appendChild(streamPanel);
        shell.appendChild(footer);
        card.appendChild(shell);
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

    // Event delegation for stream chips and toggle buttons
    eventList.addEventListener('click', function (e) {
      const chip = e.target.closest('.stream-chip');
      if (chip) {
        const url = chip.dataset.streamUrl;
        if (url && typeof window.loadStream === 'function') {
          window.loadStream(url);
        }
        return;
      }

      const toggle = e.target.closest('.event-stream-toggle');
      if (toggle && !toggle.disabled) {
        const card = toggle.closest('.event-card');
        const panelId = toggle.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (card && panel) {
          const isExpanded = card.classList.toggle('is-expanded');
          toggle.setAttribute('aria-expanded', String(isExpanded));
          panel.hidden = !isExpanded;
        }
      }
    });

    eventList.addEventListener('contextmenu', function (e) {
      const chip = e.target.closest('.stream-chip');
      if (chip) {
        const url = chip.dataset.streamUrl;
        if (url) copyStreamLink(e, url);
      }
    });

    if (sportFilter) sportFilter.addEventListener('change', filterEvents);
    if (leagueFilter) leagueFilter.addEventListener('change', filterEvents);
    if (tournamentFilter) tournamentFilter.addEventListener('change', filterEvents);
    if (eventSearch) {
      let filterDebounce;
      eventSearch.addEventListener('input', () => {
        clearTimeout(filterDebounce);
        filterDebounce = setTimeout(filterEvents, 250);
      });
    }

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
