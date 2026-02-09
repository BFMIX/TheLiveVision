# The Live Vision

The Live Vision is a mobile-first sports streaming web app (PWA-like) built with vanilla HTML, CSS, and JavaScript. It provides a streamlined experience for streaming links, events, and channels.

## Features
- Stream page with URL input, search suggestions, and embedded player.
- Events page with filters, official team/league logos, and stream buttons.
- Channels page with searchable list and country flags in filters.
- Mobile bottom navigation and pull-to-refresh support.

## Running Locally
1. Open a terminal in the project root.
2. Start a static server:
   - `python3 -m http.server 3000`
3. Open `http://localhost:3000` in your browser.

## APIs Used
- **beta.adstrim.ru**
  - Metadata API for streams, events, and channels.
- **viewembed.ru**
  - Host for playable stream/embed links built from the metadata.
## Configuration
- Stream metadata and embed hosts are defined in:
  - `/Users/bfmix/Desktop/DEv/Project/TheLiveVision/js/streammanager.js`
  - `/Users/bfmix/Desktop/DEv/Project/TheLiveVision/js/searchStream.js`
  - `/Users/bfmix/Desktop/DEv/Project/TheLiveVision/js/sportsEventManager.js`
  - `/Users/bfmix/Desktop/DEv/Project/TheLiveVision/js/channelsmanager.js`
  - Update `API_BASE` (beta.adstrim.ru) and `EMBED_BASE` (viewembed.ru) together if needed.

## Project Structure
- `index.html`: Main single-page UI.
- `css/style.css`: Global styles and responsive layout.
- `js/`: Feature scripts for navigation, streams, events, and channels.

## Notes
- This project is static and does not host streams directly.
- Stream embeds rely on viewembed.ru links built from the event/channel data.
