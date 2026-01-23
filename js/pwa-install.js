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
    // iOS Safari
    if (window.navigator.standalone) return true;
    // Other browsers
    return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  };

  const alreadyDismissed = () => {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  };

  const dismissPermanently = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
  };

  const createBanner = () => {
    const banner = document.createElement('div');
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <div class="pwa-banner-icon" aria-hidden="true">
          <img src="/icon-192.png" alt="" style="width:48px;height:48px;border-radius:12px;" />
        </div>
        <div class="pwa-banner-text">
          <div class="pwa-banner-title">Installer TheLiveVision</div>
          <div class="pwa-banner-subtitle" id="pwa-banner-subtitle"></div>
        </div>
        <button class="pwa-banner-close" aria-label="Fermer">✕</button>
      </div>
      <div class="pwa-banner-actions">
        <button class="pwa-btn pwa-btn-primary" id="pwa-install-btn">Installer</button>
        <button class="pwa-btn pwa-btn-secondary" id="pwa-later-btn">Plus tard</button>
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

    // show with a tiny delay for smoother UI
    setTimeout(() => banner.classList.add('show'), 250);

    return banner;
  };

  let deferredPrompt = null;

  // Capture Android install prompt
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
      // iOS: no prompt available
      subtitle.textContent = "Sur iPhone/iPad : touche Partager puis Sur l’écran d’accueil.";
      installBtn.textContent = 'Voir comment';
      installBtn.addEventListener('click', () => {
        // Simple helper: highlight instructions (still requires user action)
        alert("Pour installer :\n1) Appuie sur le bouton Partager (carré + flèche)\n2) Choisis ‘Sur l’écran d’accueil’\n3) Valide ‘Ajouter’");
      });
      return;
    }

    // Android/Chromium
    if (deferredPrompt) {
      subtitle.textContent = "Installation en 1 clic pour une expérience plus fluide.";
      installBtn.addEventListener('click', async () => {
        try {
          deferredPrompt.prompt();
          const choice = await deferredPrompt.userChoice;
          // choice.outcome is 'accepted' or 'dismissed'
          deferredPrompt = null;
          dismissPermanently();
          banner.classList.remove('show');
          setTimeout(() => banner.remove(), 350);
        } catch (err) {
          console.warn('Install prompt failed:', err);
        }
      });
    } else {
      // Not installable yet (missing https / SW / criteria)
      subtitle.textContent = "Installation disponible une fois les conditions PWA remplies (HTTPS + cache).";
      installBtn.disabled = true;
      installBtn.style.opacity = '0.6';
    }
  };

  // Show banner shortly after load
  window.addEventListener('load', () => {
    // Avoid flashing banner too early
    setTimeout(showInstallUI, 1200);
  });
})();
