# TheLiveVision - PRD

## Original Problem Statement
Site de streaming sportif inspiré de DAZN.com. Application SPA statique (vanilla JS/HTML/CSS) avec pages Stream, Events, Channels.

## Architecture
- **Frontend**: HTML5, CSS3, JavaScript ES6
- **Backend**: Static site (python3 -m http.server 3000)
- **API**: https://beta.adstrim.ru/api/events & channels
- **PWA**: Service Worker + Manifest

## User Personas
1. **Mobile User**: Veut une expérience "app-like" fluide
2. **Desktop User**: Veut un design premium professionnel
3. **Power User**: Utilise les filtres et raccourcis

## Core Requirements (Static)
- Afficher les événements sportifs en direct
- Afficher les chaînes TV de streaming
- Player vidéo intégré
- Filtres par sport/date/pays
- Mode sombre/clair

---

## What's Been Implemented

### Session 26 Jan 2026 - UX Enhancements "App-Like"

#### P0 - Bottom Navigation (Mobile)
- ✅ Barre de navigation fixe en bas (Stream / Events / Channels)
- ✅ Onglet actif visuellement distingué (jaune)
- ✅ Safe-area iOS (env safe-area-inset-bottom)
- ✅ Body padding pour ne pas cacher le contenu

#### P0 - Header Simplifié (Mobile)
- ✅ Titre "THE LIVE VISION" centré
- ✅ Theme toggle repositionné en haut à droite
- ✅ Tabs masqués quand bottom nav active
- ✅ Desktop inchangé

#### P1 - Skeleton Loaders + États
- ✅ Skeleton loader pour Events et Channels
- ✅ Empty state: "No events/channels found"
- ✅ Error state avec bouton "Retry"
- ✅ Fonctions utilitaires réutilisables (UXEnhancements)

#### P1 - Pull-to-Refresh
- ✅ Structure en place dans uxEnhancements.js
- ✅ Initialisé pour Events et Channels
- ✅ Indicateur visuel "Pull to refresh" / "Refreshing..."

#### P2 - Micro-animations
- ✅ Animation d'entrée des cards (fade + translate)
- ✅ Stagger animation (décalage progressif)
- ✅ Tap/click feedback (scale 0.95)
- ✅ Hover effect desktop
- ✅ Respect prefers-reduced-motion

### Session Précédente - Mobile UI Refactor
- ✅ Tables → Cards responsives (mobile)
- ✅ Filtres accordéon
- ✅ Sport Category en haut à gauche des cards
- ✅ Icônes neutres/grises
- ✅ Contraste dark mode amélioré
- ✅ Search + Play sur une ligne
- ✅ Footer 2 lignes adaptatives

---

## Files Modified This Session
- `/app/js/uxEnhancements.js` - **NEW** Utilities UX
- `/app/css/style.css` - Bottom nav, skeletons, animations
- `/app/index.html` - Script include
- `/app/js/sportsEventManager.js` - Skeleton/error integration
- `/app/js/channelsmanager.js` - Skeleton/error integration

---

## Prioritized Backlog

### P1 (Next Sprint)
- [ ] Quick Preview hover (mini player desktop)
- [ ] Keyboard Navigation complète
- [ ] Haptic Feedback mobile

### P2
- [ ] Lazy loading images (drapeaux)
- [ ] Glassmorphism header/cards
- [ ] Swipe gestures cards
- [ ] Splash Screen animé

### P3
- [ ] Offline Mode amélioré
- [ ] Push Notifications
- [ ] Multi-stream view
- [ ] Dashboard Analytics

---

## Technical Debt
- `/app/css/style.css` est monolithique (3800+ lignes)
- Considérer split en modules (base, mobile, desktop, animations)

---

## Next Tasks
1. Sprint 1: Quick Wins (Typographie, Colors, Splash)
2. Sprint 2: Core Mobile (Haptic, Swipe gestures)
3. Sprint 3: Desktop Premium (Glassmorphism, Keyboard nav)
