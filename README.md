# 🏆 LIVE SPORTS VISION

Your Ultimate Sports Streaming Platform - Watch live sports, events, and channels from around the world.

## 📺 Features

- **Live Streaming**: Watch sports streams from various sources
- **Sports Events**: Browse upcoming and live sports events
- **TV Channels**: Access to multiple sports channels
- **Search**: Quick search for streams and channels
- **Dark/Light Mode**: Switch between themes
- **Cinema Mode**: Immersive viewing experience
- **PWA Support**: Install as an app on your device
- **Responsive**: Works on desktop, tablet, and mobile

## 🚀 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: Beta AdsTrim API for events and channels
- **Streaming**: Embedded iframe players
- **PWA**: Progressive Web App with Service Worker

## 📁 Project Structure

```
/app/
├── css/
│   ├── style.css           # Main stylesheet
│   └── style.backup.css    # Backup
├── js/
│   ├── navigation.js       # Page navigation
│   ├── streammanager.js    # Stream management
│   ├── channelsmanager.js  # Channels display
│   ├── sportsEventManager.js # Events display
│   ├── themeToggle.js      # Dark/light theme
│   ├── anti-popup.js       # Ad/popup blocker
│   └── ...
├── index.html              # Main page
├── manifest.json           # PWA manifest
└── service-worker.js       # PWA service worker
```

## 🎨 Features Details

### Anti-Popup Protection
The player includes protection against ads and popups from iframe embeds with:
- Overlay protection
- Click-through detection
- Window.open blocking

### Cinema Mode
Simple zoom animation for immersive viewing:
- Zoom in: Scale from 0.8 to 1
- Zoom out: Scale from 1 to 0.8
- Escape key support
- Click outside to exit

### Responsive Design
- Desktop: Full features
- Mobile: Optimized layout
- Tablet: Adaptive interface

## 🔧 Configuration

### API Integration
The app uses the Beta AdsTrim API:
- Events: `https://beta.adstrim.ru/api/events`
- Channels: `https://beta.adstrim.ru/api/channels`

### PWA Configuration
Edit `manifest.json` to customize:
- App name
- Icons
- Theme colors
- Shortcuts

## 🌐 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Optimized

## 📝 Development

### Local Development
Simply open `index.html` in a browser or use a local server:
```bash
python3 -m http.server 3000
```

### PWA Testing
For PWA features, you need HTTPS or localhost.

## 🔐 Security Features

- Anti-popup protection
- Iframe sandbox attributes
- Content Security Policy headers (recommended)
- No user authentication required

## 📱 Progressive Web App

Install the app on your device:
1. Open in Chrome/Edge
2. Click "Install" icon in address bar
3. App will be added to home screen

## 🎯 Future Enhancements

- [ ] User favorites
- [ ] Watch history
- [ ] Multi-language support
- [ ] Custom themes
- [ ] Picture-in-Picture mode
- [ ] Chromecast support

## 📄 License

This project is for educational and personal use.

## 🙏 Credits

- **API**: Beta AdsTrim
- **Fonts**: Google Fonts (Orbitron, Roboto)
- **Icons**: Font Awesome

---

**Version**: 2.0.0  
**Last Updated**: January 2026
