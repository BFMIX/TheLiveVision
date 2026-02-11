# Agent Rules

## Project Scope

- This project is a static PWA built with vanilla HTML, CSS, and JavaScript.
- Default scope is tooling and reliability only unless explicitly requested otherwise.
- Focus on maintenance and reliability with minimal risk.

## Hard Constraints

- Do not touch stream/API/URL logic.
- Do not change embed rules, endpoint mapping, URL builders, or playback behavior.
- Do not change UI text/content unless explicitly requested.
- Do not rename pages or labels unless explicitly requested.
- Do not perform refactor sweeps.

## Change Strategy

- Prefer minimal diffs and targeted edits.
- Avoid broad refactors unless explicitly requested.
- Never reformat the whole project. Run Prettier only on targeted files.
- Fix lint warnings with minimal edits only (for example, prefix unused args/vars with `_`).
- Do not introduce behavior changes while fixing lint/format issues.

## Quality Gate

- Run `npm run check` before finishing.
- If any step fails, fix the issue before delivery.

## Service Worker Rules

- Cache only same-origin static assets by default.
- Never cache third-party embed requests.
- Never cache API responses unless explicitly whitelisted.
- Keep precache lists clean (no duplicates, no query-string variants).
- Keep runtime caches bounded and cache keys deterministic.

## Dependencies

- Add dependencies only when necessary.
- Explain why each new dependency is needed.
- Keep dependency footprint minimal.
