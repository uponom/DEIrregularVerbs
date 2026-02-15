# DEIrregularVerbs

A single-page offline app for learning German irregular verbs.

## Features

- `Learn` mode: shows `Infinitiv`, `Präteritum`, `Partizip II`, and translation.
- `Quiz` mode: step-by-step form selection from multiple options.
- Translation languages: `RU`, `UA`, `EN`.
- Optional text-to-speech via Web Speech API (`de-DE`).
- No external runtime dependencies in the browser.

## Tech Stack

- `HTML`, `CSS`, `Vanilla JavaScript`.
- `Node.js` for data validation and tests.
- Built-in `node:test` for unit testing.

## Quick Start

1. Open `src/index.html` in a browser.
2. Install `Node.js` (LTS recommended) to run validation and tests.

## Scripts

```bash
npm test
npm run validate:data
```

- `npm test`: runs automated tests.
- `npm run validate:data`: runs verbs dataset validation.

## Project Structure

```text
.
├─ src/
│  └─ index.html
├─ scripts/
│  └─ validate-verbs.js
├─ tests/
│  └─ validate-verbs.test.js
├─ tasks.md
├─ package.json
└─ README.md
```

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

## Roadmap

Refactoring tasks and progress are tracked in `tasks.md`.

## License

This project is distributed under the license in `LICENSE`.
