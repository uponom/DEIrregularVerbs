# Refactoring Tasks

## 0) PWA Foundation (Completed)
- [x] 0.1 Add app manifest (`src/manifest.webmanifest`).
- [x] 0.2 Add install icons (`src/icons/icon-192.svg`, `src/icons/icon-512-maskable.svg`).
- [x] 0.3 Add service worker (`src/sw.js`) with:
- [x] 0.3.1 core asset pre-cache;
- [x] 0.3.2 runtime stale-while-revalidate caching for same-origin GET requests;
- [x] 0.3.3 navigation fallback to `index.html`;
- [x] 0.3.4 old cache cleanup on activation.
- [x] 0.4 Add PWA registration/update logic (`src/pwa.js`).
- [x] 0.5 Connect manifest and PWA registration in `src/index.html`.
- [x] 0.6 Add automated tests for PWA logic (`tests/pwa.test.js`).

## 1) Data Layer and Integrity
- [x] 1.1 Move the verbs dictionary out of `src/index.html` into a separate file (`src/data/verbs.json` or `src/data/verbs.js`).
- [x] 1.2 Normalize the verb record schema.
- [x] 1.3 Add a unique `id` to each record.
- [x] 1.4 Remove/merge duplicate verbs.
- [x] 1.4.1 Resolve duplicates for `werfen`.
- [x] 1.4.2 Resolve duplicates for `sehen`.
- [x] 1.4.3 Resolve duplicates for `lesen`.
- [x] 1.4.4 Resolve duplicates for `essen`.
- [x] 1.4.5 Resolve duplicates for `geben`.
- [x] 1.4.6 Resolve duplicates for `nehmen`.
- [x] 1.4.7 Resolve duplicates for `helfen`.
- [x] 1.4.8 Resolve duplicates for `sterben`.
- [x] 1.4.9 Resolve duplicates for `treffen`.
- [x] 1.4.10 Resolve duplicates for `brechen`.
- [x] 1.4.11 Resolve duplicates for `fallen`.
- [x] 1.4.12 Resolve duplicates for `gefallen`.
- [x] 1.4.13 Resolve duplicates for `schlafen`.
- [x] 1.4.14 Resolve duplicates for `halten`.
- [x] 1.4.15 Resolve duplicates for `braten`.
- [x] 1.4.16 Resolve duplicates for `werden`.
- [x] 1.4.17 Resolve duplicates for `liegen`.
- [x] 1.4.18 Resolve duplicates for `stehen`.
- [x] 1.5 Define and document duplicate handling rules.
- [x] 1.6 Add dataset validation.
- [x] 1.6.1 Validate required fields (`Infinitiv`, `Praeteritum`, `Partizip2`, at least one translation).
- [x] 1.6.2 Validate duplicate keys (for example `Infinitiv + Praeteritum + Partizip2`).
- [x] 1.6.3 Add an npm script/utility for pre-release data validation.

## 2) Codebase Structure
- [x] 2.1 Split the application into modules without changing behavior.
- [x] 2.1.1 Create `src/index.js` for app initialization.
- [x] 2.1.2 Create `src/state.js` for state and transitions.
- [x] 2.1.3 Create `src/ui/learn.js` for learn mode.
- [x] 2.1.4 Create `src/ui/quiz.js` for quiz mode.
- [x] 2.1.5 Create `src/services/tts.js` for text-to-speech logic.
- [x] 2.1.6 Wire modules in `src/index.html`.

## 3) State Management
- [x] 3.1 Remove scattered direct global state mutations.
- [x] 3.2 Introduce a centralized `dispatch(action)` (or equivalent).
- [x] 3.3 Move transitions (`next`, `mode switch`, `quiz reset`, `set language`, `set tts`) into dedicated functions.
- [x] 3.4 Ensure a single rendering flow after state changes.

## 4) Rendering and Safety
- [x] 4.1 Reduce `innerHTML` usage where user/external data can be involved.
- [x] 4.2 Move dynamic rendering to `createElement` + `textContent`.
- [x] 4.3 Extract recurring UI blocks into small component-like functions.
- [x] 4.4 Minimize string-based HTML interpolation.

## 5) Styles and Layout
- [x] 5.1 Move inline styles from HTML/JS to CSS classes.
- [x] 5.2 Remove semantic collisions in CSS classes (for example split `.left/.right` by context).
- [x] 5.3 Group CSS by logical blocks (controls, card, quiz options, tts info).
- [x] 5.4 Use clearer class names for maintainability.

## 6) Accessibility and UX
- [x] 6.1 Add accessibility attributes for language/mode toggles (`aria-pressed`, roles/labels where needed).
- [x] 6.2 Ensure correct/wrong feedback is not color-only.
- [x] 6.3 Verify keyboard navigation for mode buttons and answer options.
- [x] 6.4 Add an explicit empty-state screen when no items are available.

## 7) Stability and Guards
- [x] 7.1 Add protection for empty `ITEMS` (avoid crashes in `renderLearn`/`renderQuiz`).
- [x] 7.2 Add guard branches for missing verb forms.
- [x] 7.3 Simplify and centralize TTS error handling.

## 8) Internationalization
- [x] 8.1 Move UI strings to a localization dictionary.
- [x] 8.2 Add full UI translations for RU/UA/EN (not only verb translations).
- [x] 8.3 Remove hardcoded RU strings from rendering and handlers.

## 9) Testing and Regression Control
- [x] 9.1 Add minimum tests/checks.
- [x] 9.1.1 Test option generation (`makeSmartOptions`).
- [x] 9.1.2 Test quiz step transitions.
- [x] 9.1.3 Test duplicate and empty-field handling in data validation.
- [x] 9.2 Add a smoke test for app initialization.

## 10) Incremental Delivery Plan
- [x] 10.1 Phase 1: data extraction + deduplication + validation.
- [x] 10.2 Phase 2: module decomposition (`state`, `ui`, `tts`).
- [x] 10.3 Phase 3: safer rendering with reduced `innerHTML`.
- [x] 10.4 Phase 4: CSS cleanup + a11y + UX polish.
- [x] 10.5 After each phase, run manual regression for `Learn` and `Quiz` modes.

## 11) UI Enhancements (Current)
- [x] 11.1 Replace top TTS checkbox with an emoji-only toggle button.
- [x] 11.2 Add a top-row emoji button that opens a modal with the full verbs list.
- [x] 11.2.1 Modal list shows all verb forms and translation for the current UI language.
- [x] 11.2.2 Default sort is by infinitive, with emoji-only toggle for sort-by-translation.
- [x] 11.2.3 Add dynamic level filters in the modal (based on levels present in `src/data/verbs.js`).
- [x] 11.3 Add a per-card speak button in Learn mode (works regardless of global TTS toggle).
- [x] 11.4 Ensure bottom technical status line explicitly displays app version.
- [x] 11.5 While speaking forms, also speak translation in the current UI language (with language switch).
- [x] 11.6 Add/update automated tests for new UI logic (sorting/filtering/shell hooks).
- [x] 11.7 Run manual UI smoke regression via Chrome DevTools MCP after implementation.
