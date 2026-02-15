# DEIrregularVerbs

A single-page Progressive Web App (PWA) for learning German irregular verbs.

## Features

- `Learn` mode: shows `Infinitiv`, `Präteritum`, `Partizip II`, and translation.
- `Quiz` mode: step-by-step form selection from multiple options.
- Translation languages: `RU`, `UA`, `EN`.
- Optional text-to-speech via Web Speech API (`de-DE`).
- Installable PWA with app manifest and service worker.
- Offline support with cached app shell and runtime caching.
- Automatic update activation for newly installed service worker versions.
- Explicit app version shown in the bottom status line.
- No external runtime dependencies in the browser.

## Tech Stack

- `HTML`, `CSS`, `Vanilla JavaScript`.
- `Node.js` for data validation and tests.
- Built-in `node:test` for unit testing.

## Quick Start

1. Open `src/index.html` in a browser.
2. Install `Node.js` (LTS recommended) to run validation and tests.
3. For full PWA behavior (service worker/install prompt), serve the app over `https` or `http://localhost`.

## Running Locally (PWA mode)

Service workers do not work from `file://`.

Example local server from `src/`:

```bash
cd src
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Scripts

```bash
npm test
npm run validate:data
```

- `npm test`: runs automated tests.
- `npm run validate:data`: runs verbs dataset validation.

## Versioning Policy

- Single source of truth for app version:
  - `src/app-version.js` (`APP_VERSION`).
- All version-dependent app behavior must reference `APP_VERSION`.
- Version format is an integer string (for example `1`, `2`, `3`).
- Before every commit, increase the version by `+1` (for example `1 -> 2`).
- The current version is displayed in the app UI footer.

## Project Structure

```text
.
├─ src/
│  └─ index.html
│  └─ manifest.webmanifest
│  └─ app-version.js
│  └─ pwa.js
│  └─ sw.js
│  └─ icons/
│     ├─ icon-192.svg
│     └─ icon-512-maskable.svg
├─ scripts/
│  └─ validate-verbs.js
├─ tests/
│  └─ validate-verbs.test.js
│  └─ pwa.test.js
├─ tasks.md
├─ package.json
└─ README.md
```

## PWA Details

- `src/manifest.webmanifest` defines install metadata, app scope, theme colors, and icons.
- `src/sw.js` implements:
  - pre-cache of core assets on install;
  - cache versioning based on `APP_VERSION` from `src/app-version.js`;
  - runtime stale-while-revalidate caching for same-origin GET requests;
  - navigation fallback to `index.html` while offline;
  - old cache cleanup on activation;
  - `SKIP_WAITING` message handling for faster updates.
- `src/pwa.js` handles service worker registration and update flow in the client.

## Update Behavior

- A new service worker is installed in the background.
- Once installed, the app triggers immediate activation (`SKIP_WAITING`).
- When the active controller changes, the page reloads to use the new version.

## Duplicate Handling Policy (Dataset)

The verbs dataset follows a strict deduplication policy.

1. Deduplication key:
`Infinitiv + Praeteritum + Partizip2`.
2. Exact duplicate (same key):
keep one record with the lowest `Level`, remove all others.
3. Different translations with the same key:
merge `RU/UA/EN` translations into the kept record.
4. Same `Infinitiv` with different grammar variants:
keep variants, but mark them explicitly with `Variant` or `Note`.

## Data Validation

The validator `scripts/validate-verbs.js` checks:

- duplicate keys;
- required fields (`Infinitiv`, `Praeteritum`, `Partizip2`);
- presence of at least one translation (`RU`/`UA`/`EN`);
- translation merge hints;
- missing variant markers for grammar variants.

Note: the current dataset still contains duplicates, so `npm run validate:data`
fails until deduplication tasks are completed.

## Testing

The project currently includes:

- dataset validation tests: `tests/validate-verbs.test.js`;
- PWA registration and helper logic tests: `tests/pwa.test.js`.
- app version format/runtime tests: `tests/app-version.test.js`.
- service worker cache version sync tests: `tests/sw-versioning.test.js`.

## Roadmap

Refactoring tasks and progress are tracked in `tasks.md`.

## License

This project is distributed under the license in `LICENSE`.
