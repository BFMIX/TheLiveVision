# The Live Vision

Your Ultimate Sports Streaming Platform - Watch live sports, events, and channels from around the world.

## Features

- **Live Streaming**: Watch sports streams from various sources
- **Sports Events**: Browse upcoming and live sports events with country flags
- **TV Channels**: Access to multiple sports channels worldwide
- **Search**: Quick search for streams, events, and channels
- **Dark/Light Mode**: Switch between themes with floating toggle button
- **Cinema Mode**: Immersive full-screen viewing experience
- **PWA Support**: Install as an app on your device (iOS & Android)
- **Mobile-First Design**: App-like experience on mobile devices

## What's New (v3.0)

### Mobile App-Like Experience
- **Cards Layout**: Events and Channels display as modern cards on mobile
- **Accordion Filters**: Collapsible filters to save screen space
- **Compact Hero**: Reduced hero section height on mobile
- **Scrollable Header**: Horizontal scrolling tabs without cutoff
- **Touch-Friendly**: All tap targets >= 44px

### UI/UX Improvements
- **Centered Content**: All card content is centered (date, match, buttons)
- **Uniform Buttons**: Play buttons have consistent sizing with/without flags
- **Dark Mode Contrast**: Better card visibility with golden borders
- **Search & Player Cards**: Styled as cards on mobile for cleaner look

### Features
- **Country Flags**: Display country flags on stream buttons
- **Copy Stream Link**: Right-click to copy stream URL
- **Anti-Popup Protection**: Blocks ads and redirects from iframe players
- **PWA Install Banner**: Prompts users to install the app

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: CSS Variables, CSS Grid, Flexbox
- **API**: Beta AdsTrim API for events and channels
- **Streaming**: Embedded iframe players
- **PWA**: Service Worker + Web App Manifest

## Project Structure

```
/app/
├── assets/
│   └── icons/              # Favicons, PWA icons, splash screens
├── css/
│   └── style.css           # Main stylesheet (responsive)
├── js/
│   ├── navigation.js       # Page navigation
│   ├── streammanager.js    # Stream player management
│   ├── channelsmanager.js  # Channels table/cards
│   ├── sportsEventManager.js # Events table/cards + flags
│   ├── themeToggle.js      # Dark/light theme toggle
│   ├── mobileFilters.js    # Accordion filters for mobile
│   ├── anti-popup.js       # Ad/popup blocker overlay
│   ├── pwa-install.js      # PWA install banner
│   ├── favorites.js        # Favorites management
│   └── ...
├── index.html              # Single-page application
├── manifest.json           # PWA manifest
└── service-worker.js       # PWA service worker
```

## Pages

### Stream Page
- URL input for custom streams
- Search functionality
- Embedded video player with cinema mode

### All Sports Events
- Live and upcoming sports events
- Filter by: Sport, Date, Tournament
- Search events
- Play buttons with country flags
- Mobile: Card layout with centered content

### All Channels
- TV channels from around the world
- Filter by country
- Search channels
- Copy channel link feature
- Mobile: Compact card layout

## Mobile Features

### Responsive Breakpoints
- **Desktop**: >= 1024px - Full table layout
- **Tablet**: 768px - 1023px - Adapted layout
- **Mobile**: <= 768px - Card-based UI

### Mobile-Specific UI
- Cards instead of tables
- Accordion filters (tap to expand)
- Horizontal scrolling header tabs
- Compact hero section
- Touch-friendly buttons (44px minimum)

## API Integration

The app uses the Beta AdsTrim API:
- **Events**: `https://beta.adstrim.ru/api/events`
- **Channels**: `https://beta.adstrim.ru/api/channels`

## Local Development

```bash
# Clone the repository
git clone https://github.com/BFMIX/TheLiveVision.git
cd TheLiveVision

# Start local server
python3 -m http.server 3000

# Open in browser
open http://localhost:3000
```

## PWA Installation

### On Mobile (iOS/Android)
1. Open the site in Safari/Chrome
2. Tap "Add to Home Screen" or use the install banner
3. App icon appears on home screen

### On Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Click "Install"
3. App opens in its own window

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | Full |
| Firefox | Full |
| Safari | Full |
| Edge | Full |
| Mobile Chrome | Full |
| Mobile Safari | Full |

## Git Branches

- **AI-(Emergent)**: AI/Emergent development branch (default)
- **OwnDev**: Manual development branch

## Future Enhancements

- [ ] User favorites persistence
- [ ] Watch history
- [ ] Multi-language support (FR, EN, ES)
- [ ] Custom themes
- [ ] Picture-in-Picture mode
- [ ] Chromecast support
- [ ] Push notifications for live events

## License

This project is for educational and personal use.

## Credits

- **API**: Beta AdsTrim
- **Fonts**: Google Fonts (Orbitron, Roboto)
- **Icons**: Font Awesome 6

---

**Version**: 3.0.0  
**Last Updated**: January 2026
