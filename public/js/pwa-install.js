// Enhanced PWA install experience (Android + iOS)
// - Android/Chromium: uses beforeinstallprompt to show a real install button
// - iOS Safari: shows a banner with Add to Home Screen instructions
// Notes:
//   * Browsers do NOT allow triggering install prompt without a user gesture.
//   * iOS Safari has no install prompt API.

(function () {
  const STORAGE_KEY = 'pwa_install_banner_dismissed_v1';

  const isIOS = () => {
    const ua = window.navigator.userAgent || '';
    const platform = window.navigator.platform || '';
    const iOSLike = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return iOSLike;
  };

  const isStandalone = () => {
    if (window.navigator.standalone) return true;
    return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  };

  const alreadyDismissed = () => {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  };

  const dismissPermanently = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore storage errors */ }
  };

  const createBanner = () => {
    const banner = document.createElement('div');
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <div class="pwa-banner-icon" aria-hidden="true">
          <img src="/assets/icons/icon-192.png" alt="" style="width:48px;height:48px;border-radius:12px;" />
        </div>
        <div class="pwa-banner-text">
          <div class="pwa-banner-title">Install The Live Vision</div>
          <div class="pwa-banner-subtitle" id="pwa-banner-subtitle"></div>
        </div>
        <button class="pwa-banner-close" aria-label="Close">&times;</button>
      </div>
      <div class="pwa-banner-actions">
        <button class="pwa-btn pwa-btn-primary" id="pwa-install-btn">Install</button>
        <button class="pwa-btn pwa-btn-secondary" id="pwa-later-btn">Later</button>
      </div>
    `;

    document.body.appendChild(banner);

    const closeBtn = banner.querySelector('.pwa-banner-close');
    const laterBtn = banner.querySelector('#pwa-later-btn');

    const hide = () => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 350);
    };

    closeBtn.addEventListener('click', () => { dismissPermanently(); hide(); });
    laterBtn.addEventListener('click', () => { dismissPermanently(); hide(); });

    setTimeout(() => banner.classList.add('show'), 250);

    return banner;
  };

  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  const showInstallUI = () => {
    if (isStandalone() || alreadyDismissed()) return;

    const banner = createBanner();
    const installBtn = banner.querySelector('#pwa-install-btn');
    const subtitle = banner.querySelector('#pwa-banner-subtitle');

    if (isIOS()) {
      subtitle.textContent = 'On iPhone/iPad: tap Share, then Add to Home Screen.';
      installBtn.textContent = 'How to install';
      installBtn.addEventListener('click', () => {
        alert('To install:\n1) Tap the Share button (square + arrow)\n2) Choose "Add to Home Screen"\n3) Tap "Add"');
      });
      return;
    }

    if (deferredPrompt) {
      subtitle.textContent = 'One-click install for a smoother experience.';
      installBtn.addEventListener('click', async () => {
        try {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
          dismissPermanently();
          banner.classList.remove('show');
          setTimeout(() => banner.remove(), 350);
        } catch (err) {
          console.warn('Install prompt failed:', err);
        }
      });
    } else {
      subtitle.textContent = 'Install available once PWA requirements are met (HTTPS + service worker).';
      installBtn.disabled = true;
      installBtn.style.opacity = '0.6';
    }
  };

  window.addEventListener('load', () => {
    setTimeout(showInstallUI, 1200);
  });
})();
