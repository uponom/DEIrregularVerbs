# DEIrregularVerbs

A single-page Progressive Web App (PWA) for learning German irregular verbs.

## Features

- `Learn` mode: shows `Infinitiv`, `Präteritum`, `Partizip II`, and translation.
- `Quiz` mode: step-by-step form selection from multiple options.
- Mobile-friendly UI with large text and large buttons for comfortable on-the-go practice.
- Interface and translations are available in `RU`, `UA`, and `EN`.
- Full verbs list in a modal window with sorting and level-based filtering.
- Level-based filtering is available both in training and in quiz modes.
- Text-to-speech pronunciation for verb forms and translation.
- Manual card speech playback and optional automatic speech in Learn mode.
- Installable PWA with offline support.

## Implementation Notes

- Top controls use icon-only buttons.
- Verbs list and card-level filters are maintained as separate filter states.
- Level filter logic prevents an empty selection (at least one level always active).
- Auto-TTS in Learn mode runs only when a new card is shown.
- TTS is implemented through Web Speech API (`de-DE` + active UI language for translation).
- State transitions are centralized via `dispatch(action)`.
- Accessibility uses `aria-pressed` toggles and text markers in quiz feedback.
- Service worker update flow uses immediate activation (`SKIP_WAITING`) and reload on controller change.
- Browser app runtime has no external dependencies.
- Current app version is shown in the bottom status line.

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

## GitHub Pages Deployment

The project includes a GitHub Actions workflow that deploys the app from `src/` to GitHub Pages:

- workflow file: `.github/workflows/deploy-pages.yml`;
- trigger: push to `main` (and manual run from Actions UI);
- published artifact path: `src`.

Repository setup (one-time):

1. Open repository `Settings` -> `Pages`.
2. In `Build and deployment`, set `Source` to `GitHub Actions`.
3. Push to `main` (or run the workflow manually in `Actions`).

After successful deployment, the site URL appears in the workflow run summary and in `Settings` -> `Pages`.

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
│  └─ index.js
│  └─ i18n.js
│  └─ state.js
│  └─ quiz-logic.js
│  └─ verbs-list.js
│  └─ data/
│     └─ verbs.js
│     └─ verb-schema.js
│  └─ ui/
│     ├─ learn.js
│     └─ quiz.js
│     └─ verbs-modal.js
│  └─ services/
│     └─ tts.js
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
│  └─ app-smoke.test.js
│  └─ quiz-logic.test.js
│  └─ verbs-list.test.js
│  └─ validate-verbs.test.js
│  └─ verb-schema.test.js
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
The current source file is `src/data/verbs.js`.

1. Deduplication key:
`Infinitiv + Praeteritum + Partizip2`.
2. Exact duplicate (same key):
keep one record with the lowest `Level`, remove all others.
3. Different translations with the same key:
merge `RU/UA/EN` translations into the kept record.
4. Same `Infinitiv` with different grammar variants:
keep variants, but mark them explicitly with `Variant` or `Note`.

## `src/data/verbs.js` Purpose and Structure

`src/data/verbs.js` is the single runtime dataset source for the browser app.
It exposes records via `window.VERBS = [...]` so the app can load verbs without extra network requests.

Primary responsibilities:

- store all irregular verb entries used by Learn/Quiz/Modal views;
- keep CEFR level and translation data in one place;
- provide stable `id` values for deterministic behavior and validation.

Current file format (raw source shape):

- top-level: JavaScript array assigned to `window.VERBS`;
- one object per verb record;
- legacy field names are preserved in the dataset:
  - identity and level: `id`, `Level`;
  - verb forms: `Infinitiv`, `Praesens3`, `Praeteritum`, `Partizip2`, `AuxVerb`;
  - vowel-change markers: `InfChar`, `P3Char`, `PraetChar`, `P2Char`;
  - translations: `RU`, `UA`, `EN`;
  - optional metadata: `Variant`, `Note`.

Example record:

```js
{
  id: "sehen-sah-gesehen",
  Level: "A1",
  Infinitiv: "sehen",
  Praesens3: "sieht",
  Praeteritum: "sah",
  Partizip2: "gesehen",
  AuxVerb: "haben",
  RU: "видеть",
  UA: "бачити",
  EN: "see"
}
```

At runtime and in validation, this raw shape is normalized by `src/data/verb-schema.js`
into the canonical model (`level`, `infinitive`, `present3`, `preterite`, `participle2`, `auxiliary`, `translations`, etc.).
This allows the source file to stay backward-compatible while the app logic uses a strict internal schema.

## Data Validation

The validator `scripts/validate-verbs.js` checks:

- required and unique `id` per record;
- duplicate keys;
- required fields (`Infinitiv`, `Praeteritum`, `Partizip2`);
- presence of at least one translation (`RU`/`UA`/`EN`);
- translation merge hints;
- missing variant markers for grammar variants.

## Verb Record Schema

`src/data/verb-schema.js` provides shared normalization for both browser UI and Node.js validation.

Canonical normalized shape:

- `id`: required unique string;
- `level`: CEFR level (`A1`, `A2`, `B1`, ...);
- `infinitive`, `present3`, `preterite`, `participle2`, `auxiliary`: normalized verb forms;
- `classes`: grouped vowel-change markers (`infinitive`, `present3`, `preterite`, `participle2`);
- `variant`, `note`: optional variant metadata;
- `translations`: `{ ru, ua, en }`.

The normalizer accepts legacy record keys from `src/data/verbs.js` and converts them into this canonical schema.

## Runtime Modules

The browser runtime is split into ES modules:

- `src/index.js`: app bootstrap, wiring, event handlers;
- `src/i18n.js`: UI localization dictionaries for RU/UA/EN;
- `src/state.js`: state shape and transition helpers;
- `src/ui/learn.js`: learn-mode rendering;
- `src/ui/quiz.js`: quiz-mode rendering and option generation;
- `src/ui/verbs-modal.js`: modal rendering for full verbs list;
- `src/services/tts.js`: TTS voice selection, multi-language segmented speaking, and footer info rendering.

Additional shared UMD module:

- `src/quiz-logic.js`: pure quiz logic (`makeSmartOptions`, quiz stage transitions), reused by tests.
- `src/verbs-list.js`: verbs list helpers (levels, filtering, sorting, translation projection), reused by tests.

## State Flow

- State updates go through centralized `dispatch(action)` in `src/index.js`.
- Transition rules are implemented in `src/state.js` reducer helpers.
- The app uses a single render flow (`renderApp`) after each dispatched action.

## Testing

The project currently includes:

- app shell initialization smoke test: `tests/app-smoke.test.js`;
- quiz logic tests (`makeSmartOptions`, quiz transitions): `tests/quiz-logic.test.js`;
- verbs list logic tests (sorting/filtering/levels): `tests/verbs-list.test.js`;
- dataset validation tests: `tests/validate-verbs.test.js`;
- PWA registration and helper logic tests: `tests/pwa.test.js`.
- app version format/runtime tests: `tests/app-version.test.js`.
- service worker cache version sync tests: `tests/sw-versioning.test.js`.

## Roadmap

Refactoring tasks and progress are tracked in `tasks.md`.

## License

This project is distributed under the license in `LICENSE`.
