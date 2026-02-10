# The Live Vision

The Live Vision is a mobile-first sports streaming web app (PWA-like) built with vanilla HTML, CSS, and JavaScript. It provides a streamlined experience for streaming links, events, and channels.

## Features
- Stream page with URL input, search suggestions, and embedded player.
- Events page with filters, official team/league logos, and stream buttons.
- Channels page with searchable list and country flags in filters.
- Mobile bottom navigation and pull-to-refresh support.

## Development / Build (Vite)
1. Install dependencies:
   - `npm install`
2. Start the dev server:
   - `npm run dev`
3. Build for production:
   - `npm run build`
4. Preview the production build locally:
   - `npm run preview`

Service worker registration is disabled on localhost during dev to avoid cache conflicts.

## APIs Used
- **beta.adstrim.ru**
  - Metadata API for streams, events, and channels.
- **viewembed.ru**
  - Host for playable stream/embed links built from the metadata.
## Configuration
- Stream metadata and embed hosts are defined in:
  - `/Users/bfmix/Desktop/DEv/Project/TheLiveVision/public/js/streammanager.js`
  - `/Users/bfmix/Desktop/DEv/Project/TheLiveVision/public/js/searchStream.js`
  - `/Users/bfmix/Desktop/DEv/Project/TheLiveVision/public/js/sportsEventManager.js`
  - `/Users/bfmix/Desktop/DEv/Project/TheLiveVision/public/js/channelsmanager.js`
  - Update `API_BASE` (beta.adstrim.ru) and `EMBED_BASE` (viewembed.ru) together if needed.

## Project Structure
- `index.html`: Main single-page UI.
- `public/css/main.css`: Main stylesheet importing split CSS files.
- `public/css/base.css`: Reset, variables, global typography.
- `public/css/layout.css`: Shared layout.
- `public/css/header.css`: Header, tabs, theme toggle.
- `public/css/components.css`: Buttons, inputs, dropdowns, cards, UI helpers.
- `public/css/pages/stream.css`: Stream page styles.
- `public/css/pages/events.css`: Events page styles.
- `public/css/pages/channels.css`: Channels page styles.
- `public/css/responsive.css`: Cross-cutting responsive overrides.
- `public/js/`: Feature scripts for navigation, streams, events, and channels.

## Notes
- This project is static and does not host streams directly.
- Stream embeds rely on viewembed.ru links built from the event/channel data.
