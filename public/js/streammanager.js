// streamManager.js
// Stream loading with auto-play and mobile-friendly UX

(function () {
  'use strict';

  const API_BASE = window.API_BASE || 'https://beta.adstrim.ru';
  const EMBED_BASE = window.EMBED_BASE || 'https://viewembed.ru';

  window.API_BASE = API_BASE;
  window.EMBED_BASE = EMBED_BASE;

  // Utils
  function isMobile() {
    return window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
  }

  function scrollToPlayerWithOffset() {
    const iframe = document.getElementById("live-stream");
    if (!iframe) return;

    // Prefer scrolling to the container instead of the iframe for better UX
    const target = iframe.closest(".player-container") || iframe;

    const header = document.querySelector(".header");
    const headerOffset = header ? header.offsetHeight + 12 : 12;

    const rect = target.getBoundingClientRect();
    const top = rect.top + window.pageYOffset - headerOffset;

    window.scrollTo({ top, behavior: "smooth" });

    // Subtle visual feedback so the user sees where the player is
    target.classList.add("player-focus-pulse");
    setTimeout(() => target.classList.remove("player-focus-pulse"), 900);
  }

  function setPlayerEmptyState(isEmpty) {
    const container = document.getElementById("player-container");
    const placeholder = document.getElementById("player-empty-state");
    if (!container || !placeholder) return;

    if (isEmpty) {
      container.classList.remove("has-stream");
      placeholder.setAttribute("aria-hidden", "false");
    } else {
      container.classList.add("has-stream");
      placeholder.setAttribute("aria-hidden", "true");
    }
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

  // Global function to load stream - accessible from onclick handlers
  // Backward compatible: loadStream(url, autoScrollBoolean)
  function loadStream(url, autoScroll = true) {
    const liveStreamIframe = document.getElementById("live-stream");
    if (!liveStreamIframe) {
      console.error("Iframe not found");
      return;
    }

    try {
      setPlayerEmptyState(false);
      liveStreamIframe.src = url;

      // Save last watched stream to localStorage
      localStorage.setItem("lastStream", url);
      console.log(`Stream loaded: ${url}`);

      // Navigate to stream page if not already there
      if (typeof navigateTo === "function") {
        navigateTo("page-stream");
      }

      // Scroll to player only if autoScroll is true
      if (autoScroll) {
        // On mobile, scroll with a header offset
        // On desktop, keep the default scroll behavior
        setTimeout(() => {
          if (isMobile()) {
            scrollToPlayerWithOffset();
          } else {
            liveStreamIframe.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 350);
      }
    } catch (error) {
      console.error("Error loading stream:", error);
      alert("Error loading stream. Please check the URL and try again.");
    }
  }

  // Make loadStream globally available
  window.loadStream = loadStream;

  document.addEventListener("DOMContentLoaded", () => {
  const streamUrlInput = document.getElementById("stream-url");
  const loadStreamButton = document.getElementById("load-stream");
  setPlayerEmptyState(true);

  // Function to validate URL
  function isValidUrl(url) {
    const urlPattern = /^(https?:\/\/)/i;
    return urlPattern.test(url);
  }

  // Function to load random channel from API
  async function loadRandomChannel() {
    try {
      const response = await fetch(`${API_BASE}/api/channels`);
      if (!response.ok) return;

      const apiResponse = await response.json();
      if (apiResponse.status !== "success" || !apiResponse.channels) return;

      // Filter visible channels
      const channels = apiResponse.channels.filter((ch) => ch.show_on_livetv && !ch.hide);

      if (channels.length > 0) {
        const randomChannel = channels[Math.floor(Math.random() * channels.length)];
        const canonicalName = randomChannel.name || randomChannel.title || randomChannel.link || '';
        const streamUrl = buildChannelUrl(canonicalName);
        console.log("Auto-loaded random channel:", randomChannel.name);

        // Important: avoid auto-scroll on the initial auto-load
        loadStream(streamUrl, false);
      }
    } catch (error) {
      console.error("Could not load random channel:", error);
    }
  }

  // Check if there's a last stream in localStorage
  const lastStream = localStorage.getItem("lastStream");
  const hasVisitedBefore = localStorage.getItem("hasVisited");

  // Only auto-load on first visit
  if (!hasVisitedBefore) {
    if (lastStream) {
      console.log("First visit - Loading last watched stream:", lastStream);
      loadStream(lastStream, false); // no auto-scroll
    } else {
      loadRandomChannel();
    }
    localStorage.setItem("hasVisited", "true");
  } else {
    console.log("Returning visitor - Stream not auto-loaded");
  }

  // Button click handler
  if (loadStreamButton) {
    loadStreamButton.addEventListener("click", () => {
      const url = (streamUrlInput?.value || "").trim();

      if (!url) {
        alert("Please enter a stream URL.");
        return;
      }

      if (!isValidUrl(url)) {
        alert("Please enter a valid URL (starting with http:// or https://).");
        return;
      }

      loadStream(url, true);
    });
  }

  // Enter key handler
  if (streamUrlInput && loadStreamButton) {
    streamUrlInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        loadStreamButton.click();
      }
    });
  }
  });
})();
