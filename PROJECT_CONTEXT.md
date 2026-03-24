# The Live Vision - Project Context

## Purpose
The Live Vision is a sports streaming web app with 3 main pages:

1. `Stream`
2. `Sports Events`
3. `TV Channels`

The product target is:

- desktop web
- mobile browser / web app mode
- TV browser / TV box browser

The project must remain web-first, premium, and practical for streaming usage.

## Current Repos / Versions

### V1
Path:
`/Users/bfmix/Desktop/DEv/Project/TheLiveVision`

Stack:
- HTML
- CSS
- Vanilla JS
- Vite for dev/build

Role:
- functional reference
- current live-ready baseline
- source of truth for UX behavior unless explicitly changed

### V2
Path:
`/Users/bfmix/Desktop/DEv/Project/TheLiveVision-V2`

Stack:
- React / Next.js

Role:
- rebuilt architecture candidate
- should progressively mirror V1 product behavior and design direction

## Hard Rules

- Do not change stream/API/embed/link generation logic unless explicitly requested.
- Do not invent product features.
- Do not add account/profile systems.
- Do not add extra pages beyond:
  - Stream
  - Sports Events
  - TV Channels
- Keep UI text and product identity consistent.
- Prefer minimal diffs over broad refactors.

## Current Design Direction

The project should feel:

- premium
- modern
- sports-focused
- readable
- app-like on mobile
- realistic and implementable

Important:
- No Apple TV / floating glass dock header.
- No glassmorphism navigation system.
- Header should stay in the classic sticky bar direction.
- Theme toggle should remain a single button, not a switch.

## Current Theme / Tokens

### Dark theme
- Primary accent: `#FFD700`
- Primary hover: `#F6C744`
- Main background: `#1A1A1A`
- Secondary background: `#252525`
- Card background: `#2A2A2A`
- Primary text: `#FFFFFF`
- Secondary text: `#B0B0B0`
- Neutral accent/border: `#333333`

### Light theme
- Primary accent: `#2196F3`
- Primary hover: `#1976D2`
- Main background: `#F5F7FA`
- Secondary background: `#FFFFFF`
- Card background: `#FAFBFC`
- Primary text: `#1A1A1A`
- Secondary text: `#666666`
- Neutral border: `#D1D5DB`

## Typography Direction

Current font stacks:

- Body/UI:
  `"Sofia Pro Soft Light", "Sofia Pro Soft", "Sofia Pro", "Avenir Next", "Helvetica Neue", Arial, sans-serif`

- Titles:
  `"Avenir Next Heavy Italic", "Avenir Next", "Sofia Pro Soft Bold", "Sofia Pro Soft Medium", "Sofia Pro Soft", "Helvetica Neue", Arial, sans-serif`

- Team / channel names recently adjusted toward:
  `"Avenir Next LT Pro Bold", "Avenir Next", "Sofia Pro Soft Medium", "Helvetica Neue", Arial, sans-serif`

Design intent:
- page titles can stay expressive
- team names / channel names should be cleaner, sharper, and less heavy than before

## Current V1 State

### Header
The header has been partially redesigned and is now the current reference for V2:

- classic sticky header retained
- logo + site name on the left
- tabs centered on desktop
- compact global search in the right action area
- single-button dark/light mode toggle on the right
- mobile header simplified:
  - logo left
  - `The Live Vision` centered
  - theme button right
  - page titles moved back into the hero/content area instead of the mobile header

### Header branding
`The Live Vision` currently uses split styling:

- `The Live` = light/white gradient
- `Vision` = yellow/gold gradient

### Header global search
The desktop header search is now functional in V1:

- searches both events and channels
- shows a dropdown under the header input
- clicking a result navigates to:
  - `Sports Events` and fills the events search, or
  - `TV Channels` and fills the channels search

Current implementation was added in:
- `index.html`
- `css/header.css`
- `public/js/searchStream.js`

### Navigation
Important page IDs / routing logic in V1:

- `page-stream`
- `page-football` (used for Sports Events)
- `page-channels`

Do not rename these in V1 without a good reason.

## Current V1 Page State

### Stream
- functional
- cinema mode has been reworked
- header search should not replace the main stream search
- main player / stream search flow must remain intact

### Sports Events
- currently migrated toward cards
- cards are acknowledged as not final and visually weak
- full redesign of the Events page is planned next

### TV Channels
- currently migrated toward cards
- cards are acknowledged as not final and visually weak

## Known Strategic Intent

The current plan is:

1. keep V1 as the practical reference implementation
2. copy validated improvements from V1 to V2 using targeted prompts
3. compare V1 and V2 on:
   - stability
   - professionalism
   - native-like feel
   - maintainability

## Important Checkpoint

Before the latest header changes, a checkpoint patch was saved at:

`/Users/bfmix/Desktop/DEv/Project/TheLiveVision/memory/checkpoints/pre-header-redesign-2026-03-19.patch`

This can be used if rollback is ever needed.
