# Tasks To Reapply In V2

This file describes the validated work already done in `V1` that should be replicated in `V2` before starting the complete redesign of the `Sports Events` page.

Target V2 path:
`/Users/bfmix/Desktop/DEv/Project/TheLiveVision-V2`

## Scope

Apply only the validated header/navigation/search changes first.
Do not start the full Events redesign yet.

## Hard Constraints

- Do not change stream/API/embed/link logic.
- Do not push.
- Do not deploy.
- Do not reinterpret the product.
- Do not add features not already present in V1.

## Task Group 1 - Header Direction

V2 must match the current V1 header direction.

### Required
- Remove any Apple TV / floating glass dock navigation if still present.
- Use a classic sticky header.
- Keep:
  - logo + brand at left
  - centered desktop tabs
  - right-side compact search
  - single-button dark/light toggle

### Explicitly forbidden
- no glass dock
- no floating navigation capsule
- no glassmorphism menu
- no switch-style theme toggle

## Task Group 2 - Header Branding

Recreate the current V1 brand treatment:

- site name visible in header on desktop
- split brand styling:
  - `The Live` in a light/white gradient
  - `Vision` in a yellow/gold gradient

Typography intent:
- cleaner and more premium
- not overly heavy
- not cartoonish

## Task Group 3 - Desktop Header Layout

Desktop layout should match V1:

- logo + site name grouped on the left
- tabs centered
- compact header search + theme button on the right

Tabs:
- centered, not left-aligned
- spacing clean and balanced
- active state readable and premium

## Task Group 4 - Header Search (Desktop)

V2 must replicate the validated V1 behavior:

- compact search input in the header
- searches both:
  - sports events
  - TV channels
- results shown in dropdown under the input
- selecting a result:
  - navigates to `Sports Events` and fills/filter-searches the event page, or
  - navigates to `TV Channels` and fills/filter-searches the channel page

### Important
- this header search must not replace the main Stream page search
- keep the Stream page main search intact

### Search UX
- desktop-first behavior
- compact dropdown
- keyboard-safe if practical
- close on click outside
- keep the design visually consistent with V1

## Task Group 5 - Mobile Header

V2 mobile header must mirror the current V1 mobile behavior:

- logo on the left
- `The Live Vision` centered in the header
- theme toggle stays on the right
- no page title inside the mobile header

Page titles on mobile:
- must appear back in the hero/content area
- same structural role as desktop
- do not keep page subtitles/titles inside the mobile header

## Task Group 6 - Theme Toggle

V2 must use the same direction as V1:

- single-button theme toggle
- no track
- no sliding knob
- compact neutral button

The mobile version must also keep the button on the right.

## Task Group 7 - Typography Alignment

Before the Events redesign starts, align V2 typography direction with V1 for:

- team names on cards
- channel names on cards

Direction:
- more modern
- less heavy
- more readable

Suggested stack:
- `"Avenir Next LT Pro Bold", "Avenir Next", "Sofia Pro Soft Medium", "Helvetica Neue", Arial, sans-serif`

Suggested weight:
- around `600`, not `800`

## Validation Checklist

Before marking the V2 header sync as complete:

1. Desktop
- logo + brand visible left
- tabs centered
- search visible right
- theme button visible right
- no Apple TV dock styling remains

2. Mobile
- logo left
- brand centered
- toggle right
- no page title inside header
- page title back in hero/content area

3. Search
- typing finds events and channels
- clicking result opens correct page
- corresponding page search/filter is filled

4. Safety
- no stream/API/embed logic changed
- no push
- no deploy

## Next Planned Step After This

Only after the V2 header is aligned with V1:

- start the complete redesign/refactor of the `Sports Events` page
- then later apply the same validated direction to `TV Channels`
