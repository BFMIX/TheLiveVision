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

## Quality Checks
Before delivering changes, run:
- `npm run check`

This runs ESLint, Prettier check, and a production build.

Tooling:
- Autoprefixer (PostCSS): adds vendor prefixes for better cross-browser support (including iOS Safari).
- ESLint: lints browser JavaScript for common errors.
- Prettier: formatting checks (no automatic repo-wide formatting).
- Vite build: minifies and bundles CSS for production output.

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
- `css/main.css`: Main stylesheet importing split CSS files.
- `css/base.css`: Reset, variables, global typography.
- `css/layout.css`: Shared layout.
- `css/header.css`: Header, tabs, theme toggle.
- `css/components.css`: Buttons, inputs, dropdowns, cards, UI helpers.
- `css/pages/stream.css`: Stream page styles.
- `css/pages/events.css`: Events page styles.
- `css/pages/channels.css`: Channels page styles.
- `css/responsive.css`: Cross-cutting responsive overrides.
- `public/js/`: Feature scripts for navigation, streams, events, and channels.

## Notes
- This project is static and does not host streams directly.
- Stream embeds rely on viewembed.ru links built from the event/channel data.
